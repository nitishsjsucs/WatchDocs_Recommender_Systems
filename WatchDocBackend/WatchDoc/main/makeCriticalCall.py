import json
import logging
import os
import requests
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def makeCriticalAlertCall(change_description: str) -> Dict[str, Any]:
    """
    Makes a critical alert call using Vapi API to notify about website changes.
    
    Args:
        context (str): Details about the website change that triggered the alert
        website_url (str): The URL of the website that changed
        change_description (str): Specific description of what changed
    
    Returns:
        Dict[str, Any]: Success/failure status of the call with details
    """
    
    # Hardcoded phone number as requested
    target_phone_number = "+14082108817"  # +1 (408) 581-5324
    
    # Assistant ID for Critical Website Alert Assistant (created via MCP server)
    assistant_id = "f63219a2-0f6b-4bf2-90a6-dbc8f0cd4557"
    
    # Phone Number ID for outbound calls (configured in Vapi account)
    phone_number_id = "3c9fa6f4-063a-457d-90cb-444d21d527a0"
    
    try:
        logger.info(f"Making critical alert call to {target_phone_number}")
        logger.info(f"Change: {change_description}")
        
        # Make the actual Vapi call using the MCP server tools
        # This is where the call is actually triggered
        
        # Prepare the call configuration
        call_config = {
            "assistantId": assistant_id,
            "phoneNumberId": phone_number_id,
            "customer": {
                "number": target_phone_number
            },
            "assistantOverrides": {
                "variableValues": {
                    "change_description": change_description,
                }
            }
        }
        
        # Make the actual Vapi call
        # This will trigger the real call through the MCP server
        call_result = make_actual_vapi_call(call_config)
        
        if call_result and call_result.get("success"):
            return {
                "success": True,
                "message": "Critical alert call initiated successfully",
                "phone_number": target_phone_number,
                "assistant_id": assistant_id,
                "phone_number_id": phone_number_id,
                "change_description": change_description,
                "call_id": call_result.get("call_id"),
                "call_status": call_result.get("status")
            }
        else:
            return {
                "success": False,
                "message": "Failed to initiate critical alert call",
                "phone_number": target_phone_number,
                "assistant_id": assistant_id,
                "phone_number_id": phone_number_id,
                "change_description": change_description,
                "error": call_result.get("error", "Unknown error")
            }
        
    except Exception as e:
        logger.error(f"Failed to prepare critical alert call: {str(e)}")
        return {
            "success": False,
            "message": f"Failed to prepare critical alert call: {str(e)}",
            "phone_number": target_phone_number,
            "assistant_id": assistant_id,
            "phone_number_id": phone_number_id,
            "error": str(e),
            "change_description": change_description
        }

def make_actual_vapi_call(call_config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Makes the actual Vapi call using the Vapi API directly.
    Based on the DialZero implementation pattern.
    
    Args:
        call_config (Dict[str, Any]): Call configuration
        
    Returns:
        Dict[str, Any]: Call result if successful, None otherwise
    """
    try:
        logger.info("Making actual Vapi call with config: " + json.dumps(call_config, indent=2))
        
        # Get Vapi API key from environment
        vapi_api_key = '51bd9e64-b98d-457f-a29d-7b03e7b8a26d'
        if not vapi_api_key:
            logger.error("VAPI_PRIVATE_API_KEY not found in environment")
            return {
                "success": False,
                "error": "VAPI_PRIVATE_API_KEY not configured"
            }
        
        # Prepare the Vapi API request body
        vapi_body = {
            "assistantId": call_config.get("assistantId"),
            "phoneNumberId": call_config.get("phoneNumberId"),
            "customer": call_config.get("customer"),
            "assistantOverrides": call_config.get("assistantOverrides", {})
        }
        
        # Make the actual API call to Vapi
        response = requests.post(
            'https://api.vapi.ai/call',
            headers={
                'Authorization': f'Bearer {vapi_api_key}',
                'Content-Type': 'application/json',
            },
            json=vapi_body,
            timeout=30
        )
        
        # Parse the response
        response_data = response.json() if response.content else {}
        
        if response.ok:
            logger.info(f"Vapi call created successfully: {response_data}")
            return {
                "success": True,
                "call_id": response_data.get("id") or response_data.get("call", {}).get("id"),
                "status": "queued",
                "assistant_id": call_config.get("assistantId"),
                "phone_number_id": call_config.get("phoneNumberId"),
                "customer_number": call_config.get("customer", {}).get("number"),
                "vapi_response": response_data
            }
        else:
            logger.error(f"Vapi API call failed: {response.status_code} - {response_data}")
            return {
                "success": False,
                "error": response_data.get("error", f"HTTP {response.status_code}"),
                "details": response_data
            }
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error making Vapi call: {str(e)}")
        return {
            "success": False,
            "error": f"Network error: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Failed to make Vapi call: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

# Example usage and testing
if __name__ == "__main__":
    # Test the function
    test_context = "Homepage content has been significantly modified"
    test_website = "https://example.com"
    test_change = "Main navigation menu has been removed and replaced with a different structure"
    
    result = makeCriticalAlertCall(test_change)
    print("Call result:", json.dumps(result, indent=2))
