#!/usr/bin/env python
"""
Example usage of the WatchDoc API endpoints.
"""

import json
import requests

# Base URL for your Django application
BASE_URL = "http://localhost:8000"

def create_document_and_scan(title, url, desc="", status="Healthy"):
    """
    Create a new document and immediately run a scan on it.
    
    Args:
        title (str): Document title
        url (str): Document URL to monitor
        desc (str): Optional description
        status (str): Document status (default: "Healthy")
    
    Returns:
        dict: API response with document and scan details
    """
    payload = {
        "title": title,
        "url": url,
        "desc": desc,
        "status": status
    }
    
    response = requests.post(
        f"{BASE_URL}/createDocumentAndScan/",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code}")
        print(response.json())
        return None

def run_scans():
    """
    Run scans on all existing documents.
    
    Returns:
        dict: API response with scan results
    """
    response = requests.post(f"{BASE_URL}/runScans/")
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code}")
        print(response.json())
        return None

def get_documents():
    """
    Fetch all documents with their latest scan information.
    
    Returns:
        dict: API response with list of documents
    """
    response = requests.get(f"{BASE_URL}/documents/")
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code}")
        print(response.json())
        return None

if __name__ == "__main__":
    # Example 1: Get all existing documents
    print("Fetching all documents...")
    documents = get_documents()
    
    if documents:
        print(f"✅ Found {documents['total_count']} documents:")
        for doc in documents['documents']:
            print(f"  - {doc['title']} ({doc['url']})")
            if doc['latest_scan']:
                print(f"    Last scan: {doc['latest_scan']['change_level']} - {doc['latest_scan']['scan_date']}")
            else:
                print("    No scans yet")
        print()
    
    # Example 2: Create a new document and scan it
    print("Creating new document and running initial scan...")
    result = create_document_and_scan(
        title="OpenAI Blog",
        url="https://openai.com/blog/",
        desc="Monitor OpenAI's latest blog posts",
        status="Healthy"
    )
    
    if result:
        print("✅ Document created successfully!")
        print(f"Document ID: {result['document']['id']}")
        print(f"Initial scan ID: {result['scan']['id']}")
        print(f"Changes detected: {result['scan']['changes']}")
        print(f"Change level: {result['scan']['change_level']}")
        print()
    
    # Example 3: Run scans on all documents
    print("Running scans on all documents...")
    scan_results = run_scans()
    
    if scan_results:
        print("✅ Scans completed!")
        for result in scan_results['results']:
            print(f"Document {result['document_id']}: {result['change_level']}")
        print()
    
    # Example 4: Fetch updated document list
    print("Fetching updated document list...")
    updated_documents = get_documents()
    
    if updated_documents:
        print(f"✅ Now have {updated_documents['total_count']} documents total")