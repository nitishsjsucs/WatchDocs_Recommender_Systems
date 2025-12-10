import json
import logging
import random

import requests
from bs4 import BeautifulSoup
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from .browser_use_client import BrowserUseAPIError, BrowserUseClient
from .models import Document, DocumentScan

from .makeCriticalCall import makeCriticalAlertCall
from .makeGeneralCall import makeConversationalUpdateCall

logger = logging.getLogger(__name__)
# csrf exempt
from django.views.decorators.csrf import csrf_exempt


def extract_page_content_with_soup(url):
    """
    Extract page content using Beautiful Soup as a fallback or supplement to Browser Use.
    
    Args:
        url (str): URL to fetch and extract content from
    
    Returns:
        str: Extracted text content or error message
    """
    try:
        # Set a reasonable timeout and user agent
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Parse HTML with Beautiful Soup
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for element in soup(["script", "style", "nav", "footer", "header"]):
            element.decompose()
        
        # Extract text from main content areas
        main_content = soup.find('main') or soup.find('article') or soup.find('div', class_=['content', 'main', 'article'])
        
        if main_content:
            text = main_content.get_text(separator='\n', strip=True)
        else:
            # Fallback to body content
            text = soup.get_text(separator='\n', strip=True)
        
        # Clean up the text
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        clean_text = '\n'.join(lines)
        
        # Limit content length to prevent excessively large storage
        if len(clean_text) > 50000:  # 50KB limit
            clean_text = clean_text[:50000] + "\n\n[Content truncated due to size]"
        
        return clean_text
        
    except requests.RequestException as e:
        logger.error(f"Failed to fetch URL {url}: {e}")
        return f"Error fetching content: {str(e)}"
    except Exception as e:
        logger.error(f"Error extracting content from {url}: {e}")
        return f"Error parsing content: {str(e)}"

@csrf_exempt
@require_http_methods(["POST"])
def runScans(request):
    try:
        client = BrowserUseClient()
    except BrowserUseAPIError as exc:
        logger.error("Unable to initialise Browser Use client: %s", exc)
        return JsonResponse({"error": str(exc)}, status=500)

    results = []
    documents = Document.objects.all()

    for document in documents:
        previous_scan = DocumentScan.objects.filter(document=document).order_by('-date').first()
        previous_snapshot = None
        if previous_scan and previous_scan.rawData:
            try:
                previous_snapshot = json.loads(previous_scan.rawData)
            except json.JSONDecodeError:
                logger.warning(
                    "Unable to decode rawData for document %s (scan %s). Treating as no previous snapshot.",
                    document.id,
                    previous_scan.id,
                )

        try:
            comparison = client.compare_document(
                url=document.url,
                title=document.title,
                previous_snapshot=previous_snapshot,
            )
        except BrowserUseAPIError as exc:
            logger.error("Browser Use comparison failed for document %s: %s", document.id, exc)
            results.append(
                {
                    "document_id": document.id,
                    "status": "error",
                    "message": str(exc),
                }
            )
            continue

        # Extract raw content using Beautiful Soup
        raw_content = extract_page_content_with_soup(document.url)
        
        severity = comparison.severity if comparison.difference_detected else 'No Change'

        raw_payload = {
            "difference_detected": comparison.difference_detected,
            "difference_description": comparison.difference_description,
            "severity": severity,
            "current_summary": comparison.current_summary,
            "raw_content": raw_content,  # Use Beautiful Soup content instead of Browser Use
            "changes": comparison.changes or {"added": [], "removed": [], "modified": []},
        }

        # Extract individual change arrays for database storage
        changes_data = comparison.changes or {"added": [], "removed": [], "modified": []}
        additions_text = "\n".join(changes_data.get("added", [])) if changes_data.get("added") else None
        deletions_text = "\n".join(changes_data.get("removed", [])) if changes_data.get("removed") else None
        modifications_text = "\n".join(changes_data.get("modified", [])) if changes_data.get("modified") else None

        scan = DocumentScan.objects.create(
            document=document,
            changes=comparison.difference_detected,
            changeLevel=severity,
            changeSummary=comparison.difference_description,
            currentSummary=comparison.current_summary,
            additions=additions_text,
            deletions=deletions_text,
            modifications=modifications_text,
            rawData=json.dumps(raw_payload),
        )

        results.append(
            {
                "document_id": document.id,
                "scan_id": scan.id,
                "changes": comparison.difference_detected,
                "change_level": scan.changeLevel,
            }
        )

    return JsonResponse({"results": results})


@csrf_exempt
@require_http_methods(["POST"])
def create_document_and_scan(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    # Validate required fields
    required_fields = ['title', 'url']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return JsonResponse({
            "error": f"Missing required fields: {', '.join(missing_fields)}"
        }, status=400)

    # Check if document with this URL already exists
    existing_document = Document.objects.filter(url=data['url']).first()
    
    if existing_document:
        # Use existing document
        document = existing_document
        print(f"🔄 BROWSER USE: Found existing document (ID: {document.id})")
        
        # Get previous scan for comparison
        previous_scan = DocumentScan.objects.filter(document=document).order_by('-date').first()
        previous_snapshot = None
        
        if previous_scan and previous_scan.rawData:
            try:
                previous_snapshot = json.loads(previous_scan.rawData)
                print(f"📋 BROWSER USE: Using previous scan (ID: {previous_scan.id}) for comparison")
            except json.JSONDecodeError:
                logger.warning(f"Unable to decode rawData for scan {previous_scan.id}")
                print(f"⚠️ BROWSER USE: Previous scan data invalid, treating as new baseline")
    else:
        # Create new document
        document = Document.objects.create(
            title=data['title'],
            desc=data.get('desc', ''),
            url=data['url'],
            status=data.get('status', 'Healthy')
        )
        previous_snapshot = None
        print(f"🆕 BROWSER USE: Created new document (ID: {document.id})")

    # Initialize Browser Use client
    try:
        print(f"🤖 BROWSER USE: Initializing BrowserUseClient for document: {document.title}")
        client = BrowserUseClient()
        print(f"✅ BROWSER USE: Client initialized successfully")
    except BrowserUseAPIError as exc:
        print(f"❌ BROWSER USE: Failed to initialize client - {exc}")
        logger.error("Unable to initialise Browser Use client: %s", exc)
        return JsonResponse({"error": str(exc)}, status=500)

    # Run scan with previous snapshot (if available)
    try:
        print(f"🔍 BROWSER USE: Starting document comparison for URL: {document.url}")
        print(f"📋 BROWSER USE: Document title: {document.title}")
        
        if previous_snapshot:
            print(f"🔄 BROWSER USE: Comparing against previous scan")
        else:
            print(f"🆕 BROWSER USE: Initial baseline scan (no previous snapshot)")
        
        comparison = client.compare_document(
            url=document.url,
            title=document.title,
            previous_snapshot=previous_snapshot,  # Now passes previous scan if available
        )
        
        print(f"✅ BROWSER USE: Comparison completed successfully")
        print(f"📊 BROWSER USE: Difference detected: {comparison.difference_detected}")
        print(f"📈 BROWSER USE: Severity level: {comparison.severity if comparison.difference_detected else 'No Change'}")
        print(f"📝 BROWSER USE: Current summary length: {len(comparison.current_summary) if comparison.current_summary else 0} characters")
        
        if comparison.difference_detected:
            print(f"🔄 BROWSER USE: Change description: {comparison.difference_description}")
            if comparison.changes:
                added_count = len(comparison.changes.get("added", []))
                removed_count = len(comparison.changes.get("removed", []))
                modified_count = len(comparison.changes.get("modified", []))
                print(f"📈 BROWSER USE: Changes - Added: {added_count}, Removed: {removed_count}, Modified: {modified_count}")
        else:
            print(f"✨ BROWSER USE: No changes detected (initial scan)")
            
    except BrowserUseAPIError as exc:
        print(f"❌ BROWSER USE: Comparison failed - {exc}")
        logger.error("Browser Use comparison failed for document %s: %s", document.id, exc)
        return JsonResponse({
            "error": f"Scan failed: {str(exc)}",
            "document_id": document.id
        }, status=500)

    # Extract raw content using Beautiful Soup
    raw_content = extract_page_content_with_soup(document.url)
    
    severity = comparison.severity if comparison.difference_detected else 'No Change'

    raw_payload = {
        "difference_detected": comparison.difference_detected,
        "difference_description": comparison.difference_description,
        "severity": severity,
        "current_summary": comparison.current_summary,
        "raw_content": raw_content,  # Use Beautiful Soup content
        "changes": comparison.changes or {"added": [], "removed": [], "modified": []},
    }

    # Extract individual change arrays for database storage
    changes_data = comparison.changes or {"added": [], "removed": [], "modified": []}
    additions_text = "\n".join(changes_data.get("added", [])) if changes_data.get("added") else None
    deletions_text = "\n".join(changes_data.get("removed", [])) if changes_data.get("removed") else None
    modifications_text = "\n".join(changes_data.get("modified", [])) if changes_data.get("modified") else None

    scan = DocumentScan.objects.create(
        document=document,
        changes=comparison.difference_detected,
        changeLevel=severity,
        changeSummary=comparison.difference_description,
        currentSummary=comparison.current_summary,
        additions=additions_text,
        deletions=deletions_text,
        modifications=modifications_text,
        rawData=json.dumps(raw_payload),
    )
    
    print(f"💾 BROWSER USE: Scan saved to database with ID: {scan.id}")
    print(f"📊 BROWSER USE: Final scan summary:")
    print(f"   - Changes detected: {scan.changes}")
    print(f"   - Change level: {scan.changeLevel}")
    #print(f"   - Additions count: {len(scan.additions.split('\\n')) if scan.additions else 0}")
    # print(f"   - Deletions count: {len(scan.deletions.split('\\n')) if scan.deletions else 0}")
    #print(f"   - Modifications count: {len(scan.modifications.split('\\n')) if scan.modifications else 0}")
    print(f"🎯 BROWSER USE: Document and scan creation completed successfully!")

    # Auto-trigger critical alert call if changes detected
    if comparison.difference_detected and scan.changes:
        print(f"📞 VAPI: Changes detected - triggering critical alert call")
        try:
            call_context = f"Website: {document.title}. Change detected: {comparison.difference_description}"
            call_result = makeCriticalAlertCall(call_context)
            
            if call_result.get("success"):
                print(f"✅ VAPI: Critical alert call initiated successfully")
                print(f"📞 VAPI: Call ID: {call_result.get('call_id')}")
            else:
                print(f"⚠️ VAPI: Critical alert call failed - {call_result.get('error')}")
                logger.warning(f"Failed to initiate critical alert call: {call_result.get('error')}")
        except Exception as e:
            print(f"❌ VAPI: Error triggering critical alert call - {str(e)}")
            logger.error(f"Exception during critical alert call: {str(e)}")
    else:
        print(f"✨ VAPI: No changes detected - skipping alert call")

    return JsonResponse({
        "message": "Document created and scanned successfully",
        "document": {
            "id": document.id,
            "title": document.title,
            "desc": document.desc,
            "url": document.url,
            "status": document.status,
            "created_date": document.date.isoformat(),
        },
        "scan": {
            "id": scan.id,
            "changes": scan.changes,
            "change_level": scan.changeLevel,
            "change_summary": scan.changeSummary,
            "current_summary": scan.currentSummary,
            "scan_date": scan.date.isoformat(),
        }
    })


@csrf_exempt
@require_http_methods(["GET"])
def get_documents(request):
    documents = Document.objects.all().order_by('-date')
    
    document_list = []
    for document in documents:
        # Get the latest scan for this document
        latest_scan = DocumentScan.objects.filter(document=document).order_by('-date').first()
        
        document_data = {
            "id": document.id,
            "title": document.title,
            "desc": document.desc,
            "url": document.url,
            "status": document.status,
            "created_date": document.date.isoformat(),
        }
        
        if latest_scan:
            document_data["latest_scan"] = {
                "id": latest_scan.id,
                "changes": latest_scan.changes,
                "change_level": latest_scan.changeLevel,
                "change_summary": latest_scan.changeSummary,
                "current_summary": latest_scan.currentSummary,
                "scan_date": latest_scan.date.isoformat(),
                "additions": latest_scan.additions.split('\n') if latest_scan.additions else [],
                "deletions": latest_scan.deletions.split('\n') if latest_scan.deletions else [],
                "modifications": latest_scan.modifications.split('\n') if latest_scan.modifications else [],
            }
        else:
            document_data["latest_scan"] = None
            
        document_list.append(document_data)
    
    return JsonResponse({
        "documents": document_list,
        "total_count": len(document_list)
    })


@csrf_exempt
@require_http_methods(["GET"])
def get_document_details(request, document_id):
    # Fetch the specific document
    try:
        document = Document.objects.get(id=document_id)
    except Document.DoesNotExist:
        return JsonResponse({"error": "Document not found"}, status=404)
    
    # Get ALL scans for this document ordered by date (newest first)
    all_scans = DocumentScan.objects.filter(document=document).order_by('-date')
    
    # Get the latest scan for quick reference
    latest_scan = all_scans.first() if all_scans else None
    
    # Build comprehensive document data
    document_data = {
        "id": document.id,
        "title": document.title,
        "desc": document.desc,
        "url": document.url,
        "status": document.status,
        "category": document.category,
        "created_date": document.date.isoformat(),
        "scan_count": all_scans.count(),
    }
    
    # Add latest scan summary
    if latest_scan:
        document_data["latest_scan"] = {
            "id": latest_scan.id,
            "changes": latest_scan.changes,
            "change_level": latest_scan.changeLevel,
            "change_summary": latest_scan.changeSummary,
            "current_summary": latest_scan.currentSummary,
            "scan_date": latest_scan.date.isoformat(),
            "additions": latest_scan.additions.split('\n') if latest_scan.additions else [],
            "deletions": latest_scan.deletions.split('\n') if latest_scan.deletions else [],
            "modifications": latest_scan.modifications.split('\n') if latest_scan.modifications else [],
        }
    else:
        document_data["latest_scan"] = None
    
    # Add all scan history with parsed raw data
    scan_history = []
    for scan in all_scans:
        # Parse raw data to get additional details
        changes = None
        raw_content_preview = None
        
        if scan.rawData:
            try:
                raw_data = json.loads(scan.rawData)
                changes = raw_data.get("changes")
                raw_content = raw_data.get("raw_content", "")
                # Provide a preview of raw content (first 200 chars)
                raw_content_preview = raw_content[:200] + "..." if len(raw_content) > 200 else raw_content
            except json.JSONDecodeError:
                logger.warning(f"Unable to decode rawData for scan {scan.id}")
        
        scan_data = {
            "id": scan.id,
            "date": scan.date.isoformat(),
            "changes": scan.changes,
            "change_level": scan.changeLevel,
            "change_summary": scan.changeSummary,
            "current_summary": scan.currentSummary,
            "raw_content_preview": raw_content_preview,
            "additions": scan.additions.split('\n') if scan.additions else [],
            "deletions": scan.deletions.split('\n') if scan.deletions else [],
            "modifications": scan.modifications.split('\n') if scan.modifications else [],
        }
        
        # Add changes if available from raw data (for backwards compatibility)
        if changes:
            scan_data["changes_detail"] = changes
        
        scan_history.append(scan_data)
    
    document_data["scan_history"] = scan_history
    
    return JsonResponse({
        "document": document_data,
        "total_scans": all_scans.count()
    })


@csrf_exempt
@require_http_methods(["GET"])
def get_document_timeline(request, document_id):
    try:
        document = Document.objects.get(id=document_id)
    except Document.DoesNotExist:
        return JsonResponse({"error": "Document not found"}, status=404)
    
    # Get all scans for this document ordered by date (newest first)
    scans = DocumentScan.objects.filter(document=document).order_by('-date')
    
    timeline_entries = []
    for scan in scans:
        # Parse raw data to get changes if available
        changes = None
        raw_content = None
        
        if scan.rawData:
            try:
                raw_data = json.loads(scan.rawData)
                changes = raw_data.get("changes")
                raw_content = raw_data.get("raw_content", "")
            except json.JSONDecodeError:
                logger.warning(f"Unable to decode rawData for scan {scan.id}")
        
        # Determine status based on scan results
        if scan.changeLevel == "No Change":
            status = "captured"
        elif scan.changes:
            status = "changed" 
        else:
            status = "captured"  # fallback
        
        # Create title based on scan results
        if scan.changeLevel == "No Change":
            title = "Periodic Check" if timeline_entries else "Initial Capture"
        else:
            title = f"{scan.changeLevel} Changes Detected"
        
        timeline_entry = {
            "id": str(scan.id),
            "timestamp": scan.date.isoformat(),
            "status": status,
            "title": title,
            "description": scan.changeSummary or scan.currentSummary[:100] + "..." if scan.currentSummary else "Routine monitoring scan completed",
            "change_level": scan.changeLevel,
            "change_summary": scan.changeSummary,
            "current_summary": scan.currentSummary,
            "raw_content": raw_content,
        }
        
        # Add changes if available
        if changes:
            timeline_entry["changes"] = changes
        
        timeline_entries.append(timeline_entry)
    
    return JsonResponse({
        "document": {
            "id": document.id,
            "title": document.title,
            "desc": document.desc,
            "url": document.url,
            "status": document.status,
            "created_date": document.date.isoformat(),
        },
        "timeline": timeline_entries,
        "total_scans": len(timeline_entries)
    })


@csrf_exempt
@require_http_methods(["POST"])
def make_general_call(request):
    """
    Makes a conversational update call with context from all monitored websites.
    Gathers the latest scan data from each document and provides comprehensive context.
    """
    
    try:
        print("📞 VAPI: Gathering context from all monitored websites")
        
        # Get all documents
        documents = Document.objects.all()
        
        if not documents.exists():
            return JsonResponse({
                "success": False,
                "error": "No documents are being monitored yet"
            }, status=400)
        
        # Build context string with all website information
        context_parts = []
        context_parts.append(f"Here is the current status of all {documents.count()} monitored websites:\n")
        
        for document in documents:
            # Get the latest scan for this document
            latest_scan = DocumentScan.objects.filter(document=document).order_by('-date').first()
            
            website_info = f"\n**{document.title}** ({document.url}):"
            
            if latest_scan:
                # Format scan date
                scan_date = latest_scan.date.strftime("%B %d, %Y at %I:%M %p")
                website_info += f"\n- Last scanned: {scan_date}"
                website_info += f"\n- Status: {latest_scan.changeLevel}"
                
                if latest_scan.changes and latest_scan.changeSummary:
                    website_info += f"\n- Change detected: {latest_scan.changeSummary}"
                    
                    # Add details about specific changes
                    if latest_scan.additions:
                        additions_count = len([a for a in latest_scan.additions.split('\n') if a.strip()])
                        website_info += f"\n- {additions_count} addition(s)"
                    if latest_scan.deletions:
                        deletions_count = len([d for d in latest_scan.deletions.split('\n') if d.strip()])
                        website_info += f"\n- {deletions_count} deletion(s)"
                    if latest_scan.modifications:
                        modifications_count = len([m for m in latest_scan.modifications.split('\n') if m.strip()])
                        website_info += f"\n- {modifications_count} modification(s)"
                        
                elif not latest_scan.changes:
                    website_info += f"\n- No changes detected since last scan"
                    if latest_scan.currentSummary:
                        # Truncate summary to first 200 chars for brevity
                        summary_preview = latest_scan.currentSummary[:200] + "..." if len(latest_scan.currentSummary) > 200 else latest_scan.currentSummary
                        website_info += f"\n- Current content: {summary_preview}"
            else:
                website_info += "\n- Not yet scanned"
            
            context_parts.append(website_info)
        
        # Combine all context
        full_context = "\n".join(context_parts)
        
        print(f"📋 VAPI: Context prepared ({len(full_context)} characters)")
        print(f"📊 VAPI: Monitored websites: {documents.count()}")
        
        # Make the conversational update call
        result = makeConversationalUpdateCall(full_context)
        
        return JsonResponse({
            "success": True,
            "message": "General call initiated successfully with live website data",
            "websites_monitored": documents.count(),
            "context_length": len(full_context),
            "call_result": result
        })
        
    except Exception as e:
        logger.error(f"Failed to make general call: {str(e)}")
        return JsonResponse({
            "success": False,
            "error": f"Failed to make general call: {str(e)}"
        }, status=500)