import json
from unittest.mock import MagicMock, patch

from django.test import TestCase
from django.urls import reverse

from .browser_use_client import BrowserUseAPIError, BrowserUseResult
from .models import Document, DocumentScan


class RunScansViewTests(TestCase):
	def setUp(self):
		self.document = Document.objects.create(
			title='Test Document',
			desc='Description',
			url='https://example.com',
		)

	@patch('main.views.BrowserUseClient')
	@patch('main.views.extract_page_content_with_soup')
	def test_run_scans_creates_document_scan(self, mock_soup: MagicMock, mock_client_cls: MagicMock):
		mock_client = mock_client_cls.return_value
		mock_client.compare_document.return_value = BrowserUseResult(
			difference_detected=True,
			difference_description='Content updated significantly.',
			severity='Major',
			current_summary='Detailed current summary.',
			changes={
				"added": ["New section", "Updated footer"],
				"removed": ["Old banner"],
				"modified": ["Main content"]
			},
			raw_response={'output': {'foo': 'bar'}},
		)
		mock_soup.return_value = 'Raw page content from Beautiful Soup'

		response = self.client.post(reverse('run_scans'))

		self.assertEqual(response.status_code, 200)
		self.assertEqual(DocumentScan.objects.count(), 1)
		scan = DocumentScan.objects.get()
		self.assertTrue(scan.changes)
		self.assertEqual(scan.changeLevel, 'Major')
		self.assertEqual(scan.changeSummary, 'Content updated significantly.')
		self.assertEqual(scan.currentSummary, 'Detailed current summary.')
		expected_raw_payload = {
			'difference_detected': True,
			'difference_description': 'Content updated significantly.',
			'severity': 'Major',
			'current_summary': 'Detailed current summary.',
			'raw_content': 'Raw page content from Beautiful Soup',
			'changes': {
				"added": ["New section", "Updated footer"],
				"removed": ["Old banner"],
				"modified": ["Main content"]
			},
		}
		self.assertEqual(json.loads(scan.rawData), expected_raw_payload)

		payload = response.json()['results'][0]
		self.assertEqual(payload['document_id'], self.document.id)
		self.assertEqual(payload['scan_id'], scan.id)
		self.assertTrue(payload['changes'])

	@patch('main.views.BrowserUseClient')
	@patch('main.views.extract_page_content_with_soup')
	def test_run_scans_forces_no_change_severity_when_unchanged(self, mock_soup: MagicMock, mock_client_cls: MagicMock):
		mock_client = mock_client_cls.return_value
		mock_client.compare_document.return_value = BrowserUseResult(
			difference_detected=False,
			difference_description='No differences detected.',
			severity='Major',
			current_summary='Baseline summary.',
			changes={"added": [], "removed": [], "modified": []},
			raw_response={'output': {'foo': 'bar'}},
		)
		mock_soup.return_value = 'Raw baseline content from Beautiful Soup'

		response = self.client.post(reverse('run_scans'))

		self.assertEqual(response.status_code, 200)
		scan = DocumentScan.objects.get()
		self.assertFalse(scan.changes)
		self.assertEqual(scan.changeLevel, 'No Change')
		expected_raw_payload = {
			'difference_detected': False,
			'difference_description': 'No differences detected.',
			'severity': 'No Change',
			'current_summary': 'Baseline summary.',
			'raw_content': 'Raw baseline content from Beautiful Soup',
			'changes': {"added": [], "removed": [], "modified": []},
		}
		self.assertEqual(json.loads(scan.rawData), expected_raw_payload)

	@patch('main.views.BrowserUseClient')
	def test_run_scans_handles_client_initialisation_error(self, mock_client_cls: MagicMock):
		mock_client_cls.side_effect = BrowserUseAPIError('Missing API key')

		response = self.client.post(reverse('run_scans'))

		self.assertEqual(response.status_code, 500)
		self.assertEqual(response.json()['error'], 'Missing API key')
		self.assertEqual(DocumentScan.objects.count(), 0)


class CreateDocumentAndScanViewTests(TestCase):
	@patch('main.views.BrowserUseClient')
	def test_create_document_and_scan_success(self, mock_client_cls: MagicMock):
		mock_client = mock_client_cls.return_value
		mock_client.compare_document.return_value = BrowserUseResult(
			difference_detected=False,
			difference_description='Initial baseline scan.',
			severity='No Change',
			current_summary='Detailed baseline summary.',
			changes={"added": [], "removed": [], "modified": []},
			raw_response={'output': {'baseline': True}},
		)

		payload = {
			'title': 'Test Document',
			'desc': 'Test description',
			'url': 'https://example.com',
			'status': 'Healthy'
		}

		response = self.client.post(
			reverse('create_document_and_scan'),
			data=json.dumps(payload),
			content_type='application/json'
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(Document.objects.count(), 1)
		self.assertEqual(DocumentScan.objects.count(), 1)

		document = Document.objects.get()
		scan = DocumentScan.objects.get()

		# Check document fields
		self.assertEqual(document.title, 'Test Document')
		self.assertEqual(document.desc, 'Test description')
		self.assertEqual(document.url, 'https://example.com')
		self.assertEqual(document.status, 'Healthy')

		# Check scan fields
		self.assertFalse(scan.changes)
		self.assertEqual(scan.changeLevel, 'No Change')
		self.assertEqual(scan.changeSummary, 'Initial baseline scan.')
		self.assertEqual(scan.currentSummary, 'Detailed baseline summary.')

		# Check response structure
		response_data = response.json()
		self.assertEqual(response_data['message'], 'Document created and scanned successfully')
		self.assertEqual(response_data['document']['id'], document.id)
		self.assertEqual(response_data['scan']['id'], scan.id)

	def test_create_document_and_scan_missing_fields(self):
		payload = {'title': 'Test Document'}  # Missing 'url'

		response = self.client.post(
			reverse('create_document_and_scan'),
			data=json.dumps(payload),
			content_type='application/json'
		)

		self.assertEqual(response.status_code, 400)
		self.assertIn('Missing required fields', response.json()['error'])
		self.assertEqual(Document.objects.count(), 0)
		self.assertEqual(DocumentScan.objects.count(), 0)

	def test_create_document_and_scan_invalid_json(self):
		response = self.client.post(
			reverse('create_document_and_scan'),
			data='invalid json',
			content_type='application/json'
		)

		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.json()['error'], 'Invalid JSON')
		self.assertEqual(Document.objects.count(), 0)

	@patch('main.views.BrowserUseClient')
	def test_create_document_and_scan_browser_use_error(self, mock_client_cls: MagicMock):
		mock_client = mock_client_cls.return_value
		mock_client.compare_document.side_effect = BrowserUseAPIError('Network error')

		payload = {
			'title': 'Test Document',
			'url': 'https://example.com'
		}

		response = self.client.post(
			reverse('create_document_and_scan'),
			data=json.dumps(payload),
			content_type='application/json'
		)

		self.assertEqual(response.status_code, 500)
		self.assertIn('Scan failed', response.json()['error'])
		# Document should still be created even if scan fails
		self.assertEqual(Document.objects.count(), 1)
		self.assertEqual(DocumentScan.objects.count(), 0)


class GetDocumentTimelineViewTests(TestCase):
	def setUp(self):
		self.document = Document.objects.create(
			title='Test Document',
			desc='Test description',
			url='https://example.com'
		)
		
		# Create a couple of test scans
		self.scan1 = DocumentScan.objects.create(
			document=self.document,
			changes=False,
			changeLevel='No Change',
			changeSummary='Initial baseline capture',
			currentSummary='Clean homepage with navigation',
			additions=None,
			deletions=None,
			modifications=None,
			rawData=json.dumps({
				'difference_detected': False,
				'difference_description': 'Initial baseline capture',
				'severity': 'No Change',
				'current_summary': 'Clean homepage with navigation',
				'raw_content': 'Homepage content here',
				'changes': {'added': [], 'removed': [], 'modified': []}
			})
		)
		
		self.scan2 = DocumentScan.objects.create(
			document=self.document,
			changes=True,
			changeLevel='Major',
			changeSummary='Significant content updates',
			currentSummary='Updated homepage with new features',
			additions='New pricing section\nCustomer testimonials',
			deletions='Old banner',
			modifications='Navigation menu',
			rawData=json.dumps({
				'difference_detected': True,
				'difference_description': 'Significant content updates',
				'severity': 'Major',
				'current_summary': 'Updated homepage with new features',
				'raw_content': 'Updated homepage content here',
				'changes': {
					'added': ['New pricing section', 'Customer testimonials'],
					'removed': ['Old banner'],
					'modified': ['Navigation menu']
				}
			})
		)

	def test_get_document_timeline_success(self):
		response = self.client.get(f'/documents/{self.document.id}/timeline/')
		
		self.assertEqual(response.status_code, 200)
		data = response.json()
		
		# Check document data
		self.assertEqual(data['document']['id'], self.document.id)
		self.assertEqual(data['document']['title'], 'Test Document')
		self.assertEqual(data['document']['url'], 'https://example.com')
		
		# Check timeline data
		self.assertEqual(len(data['timeline']), 2)
		self.assertEqual(data['total_scans'], 2)
		
		# Check the most recent scan (scan2) is first
		recent_scan = data['timeline'][0]
		self.assertEqual(recent_scan['id'], str(self.scan2.id))
		self.assertEqual(recent_scan['status'], 'changed')
		self.assertEqual(recent_scan['title'], 'Major Changes Detected')
		self.assertEqual(recent_scan['change_level'], 'Major')
		
		# Check changes structure
		self.assertIn('changes', recent_scan)
		changes = recent_scan['changes']
		self.assertEqual(len(changes['added']), 2)
		self.assertEqual(len(changes['removed']), 1)
		self.assertEqual(len(changes['modified']), 1)
		self.assertIn('New pricing section', changes['added'])

	def test_get_document_timeline_not_found(self):
		response = self.client.get('/documents/999/timeline/')
		
		self.assertEqual(response.status_code, 404)
		data = response.json()
		self.assertEqual(data['error'], 'Document not found')


	def setUp(self):
		self.document1 = Document.objects.create(
			title='Test Document 1',
			desc='First test document',
			url='https://example1.com',
			status='Healthy'
		)
		self.document2 = Document.objects.create(
			title='Test Document 2',
			desc='Second test document',
			url='https://example2.com',
			status='Warning'
		)

	def test_get_documents_empty_list(self):
		# Clear all documents
		Document.objects.all().delete()
		
		response = self.client.get(reverse('get_documents'))
		
		self.assertEqual(response.status_code, 200)
		data = response.json()
		self.assertEqual(data['total_count'], 0)
		self.assertEqual(len(data['documents']), 0)

	def test_get_documents_without_scans(self):
		response = self.client.get(reverse('get_documents'))
		
		self.assertEqual(response.status_code, 200)
		data = response.json()
		self.assertEqual(data['total_count'], 2)
		self.assertEqual(len(data['documents']), 2)
		
		# Check document data
		document_ids = [doc['id'] for doc in data['documents']]
		self.assertIn(self.document1.id, document_ids)
		self.assertIn(self.document2.id, document_ids)
		
		# Check that latest_scan is None for documents without scans
		for doc in data['documents']:
			self.assertIsNone(doc['latest_scan'])

	def test_get_documents_with_scans(self):
		# Create scans for both documents
		scan1 = DocumentScan.objects.create(
			document=self.document1,
			changes=True,
			changeLevel='Major',
			changeSummary='Document updated',
			currentSummary='Current state summary',
			additions='New feature',
			deletions=None,
			modifications='Updated content',
			rawData=json.dumps({'test': 'data'})
		)
		
		scan2 = DocumentScan.objects.create(
			document=self.document2,
			changes=False,
			changeLevel='No Change',
			changeSummary='No changes detected',
			currentSummary='Baseline summary',
			additions=None,
			deletions=None,
			modifications=None,
			rawData=json.dumps({'baseline': True})
		)
		
		response = self.client.get(reverse('get_documents'))
		
		self.assertEqual(response.status_code, 200)
		data = response.json()
		self.assertEqual(data['total_count'], 2)
		
		# Find documents in response
		doc1_data = next(doc for doc in data['documents'] if doc['id'] == self.document1.id)
		doc2_data = next(doc for doc in data['documents'] if doc['id'] == self.document2.id)
		
		# Check document 1 data
		self.assertEqual(doc1_data['title'], 'Test Document 1')
		self.assertEqual(doc1_data['url'], 'https://example1.com')
		self.assertEqual(doc1_data['status'], 'Healthy')
		self.assertIsNotNone(doc1_data['latest_scan'])
		self.assertEqual(doc1_data['latest_scan']['id'], scan1.id)
		self.assertTrue(doc1_data['latest_scan']['changes'])
		self.assertEqual(doc1_data['latest_scan']['change_level'], 'Major')
		
		# Check document 2 data
		self.assertEqual(doc2_data['title'], 'Test Document 2')
		self.assertEqual(doc2_data['url'], 'https://example2.com')
		self.assertEqual(doc2_data['status'], 'Warning')
		self.assertIsNotNone(doc2_data['latest_scan'])
		self.assertEqual(doc2_data['latest_scan']['id'], scan2.id)
		self.assertFalse(doc2_data['latest_scan']['changes'])
		self.assertEqual(doc2_data['latest_scan']['change_level'], 'No Change')

	def test_get_documents_latest_scan_only(self):
		# Create multiple scans for one document to test that only latest is returned
		old_scan = DocumentScan.objects.create(
			document=self.document1,
			changes=False,
			changeLevel='No Change',
			changeSummary='Old scan',
			currentSummary='Old summary',
			additions=None,
			deletions=None,
			modifications=None
		)
		
		# Create a newer scan
		new_scan = DocumentScan.objects.create(
			document=self.document1,
			changes=True,
			changeLevel='Critical',
			changeSummary='New scan with changes',
			currentSummary='Updated summary',
			additions='Critical updates',
			deletions='Removed content',
			modifications='Modified sections'
		)
		
		response = self.client.get(reverse('get_documents'))
		
		self.assertEqual(response.status_code, 200)
		data = response.json()
		
		doc1_data = next(doc for doc in data['documents'] if doc['id'] == self.document1.id)
		
		# Should return the newer scan, not the old one
		self.assertEqual(doc1_data['latest_scan']['id'], new_scan.id)
		self.assertEqual(doc1_data['latest_scan']['change_level'], 'Critical')
		self.assertEqual(doc1_data['latest_scan']['change_summary'], 'New scan with changes')


class GetDocumentDetailsViewTests(TestCase):
	def setUp(self):
		# Create test document
		self.document = Document.objects.create(
			title='Test Document',
			desc='Test document description',
			url='https://example.com',
			category='Tech'
		)
		
		# Create some scans for the document
		self.scan1 = DocumentScan.objects.create(
			document=self.document,
			changes=False,
			changeLevel='No Change',
			changeSummary='Initial scan',
			currentSummary='Clean homepage',
			additions=None,
			deletions=None,
			modifications=None,
			rawData=json.dumps({
				'difference_detected': False,
				'changes': {'added': [], 'removed': [], 'modified': []},
				'raw_content': 'Initial content here'
			})
		)
		
		self.scan2 = DocumentScan.objects.create(
			document=self.document,
			changes=True,
			changeLevel='Major',
			changeSummary='Content updated',
			currentSummary='Updated homepage with new features',
			additions='New section',
			deletions='Old banner',
			modifications='Navigation',
			rawData=json.dumps({
				'difference_detected': True,
				'changes': {
					'added': ['New section'],
					'removed': ['Old banner'],
					'modified': ['Navigation']
				},
				'raw_content': 'Updated content here'
			})
		)

	def test_get_document_details_success(self):
		response = self.client.get(f'/documents/{self.document.id}/')
		
		self.assertEqual(response.status_code, 200)
		response_data = response.json()
		
		# Check response structure
		self.assertIn('document', response_data)
		self.assertIn('total_scans', response_data)
		self.assertEqual(response_data['total_scans'], 2)
		
		# Check document data
		doc_data = response_data['document']
		self.assertEqual(doc_data['id'], self.document.id)
		self.assertEqual(doc_data['title'], 'Test Document')
		self.assertEqual(doc_data['category'], 'Tech')
		self.assertEqual(doc_data['scan_count'], 2)
		self.assertEqual(len(doc_data['scan_history']), 2)
		
		# Check latest scan
		self.assertEqual(doc_data['latest_scan']['change_level'], 'Major')
		
		# Check scan history details
		latest_scan_history = doc_data['scan_history'][0]  # Should be most recent
		self.assertEqual(latest_scan_history['change_level'], 'Major')
		self.assertIn('changes_detail', latest_scan_history)
		self.assertEqual(len(latest_scan_history['changes_detail']['added']), 1)
		
		# Check the new database fields
		self.assertEqual(latest_scan_history['additions'], ['New section'])
		self.assertEqual(latest_scan_history['deletions'], ['Old banner'])
		self.assertEqual(latest_scan_history['modifications'], ['Navigation'])

	def test_get_document_details_not_found(self):
		response = self.client.get('/documents/999/')
		
		self.assertEqual(response.status_code, 404)
		response_data = response.json()
		self.assertEqual(response_data['error'], 'Document not found')

	def test_get_document_details_without_scans(self):
		# Create a document without scans
		document_no_scans = Document.objects.create(
			title='No Scans Document',
			desc='Document without scans',
			url='https://noscans.com',
			category='General'
		)
		
		response = self.client.get(f'/documents/{document_no_scans.id}/')
		
		self.assertEqual(response.status_code, 200)
		response_data = response.json()
		
		doc_data = response_data['document']
		self.assertEqual(doc_data['scan_count'], 0)
		self.assertEqual(len(doc_data['scan_history']), 0)
		self.assertIsNone(doc_data['latest_scan'])
