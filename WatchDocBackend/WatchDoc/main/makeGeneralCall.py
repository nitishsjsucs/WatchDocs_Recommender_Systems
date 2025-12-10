import json
import logging
import os
import requests
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def makeConversationalUpdateCall(context: str) -> Dict[str, Any]:
    """
    Makes a conversational update call using Vapi API to share website updates in a friendly way.
    
    Args:
        context (str): Latest updates and changes from all monitored websites
    
    Returns:
        Dict[str, Any]: Success/failure status of the call with details
    """
    
    # Hardcoded phone number as requested
    target_phone_number = "+14082108817"  # +1 (408) 581-5324
    
    # Assistant ID for Conversational Website Updates Assistant (created via MCP server)
    assistant_id = "014afdbb-c505-47b0-92a4-057704d8a771"
    
    # Phone Number ID for outbound calls (configured in Vapi account)
    phone_number_id = "3c9fa6f4-063a-457d-90cb-444d21d527a0"
    
    try:
        logger.info(f"Making conversational update call to {target_phone_number}")
        logger.info(f"Context: {context}")
        
        # Prepare the call configuration
        call_config = {
            "assistantId": assistant_id,
            "phoneNumberId": phone_number_id,
            "customer": {
                "number": target_phone_number
            },
            "assistantOverrides": {
                "variableValues": {
                    "context": context
                }
            }
        }
        
        # Make the actual Vapi call
        # This will trigger the real call through the Vapi API
        call_result = make_actual_vapi_call(call_config)
        
        if call_result and call_result.get("success"):
            return {
                "success": True,
                "message": "Conversational update call initiated successfully",
                "phone_number": target_phone_number,
                "assistant_id": assistant_id,
                "phone_number_id": phone_number_id,
                "context": context,
                "call_id": call_result.get("call_id"),
                "call_status": call_result.get("status")
            }
        else:
            return {
                "success": False,
                "message": "Failed to initiate conversational update call",
                "phone_number": target_phone_number,
                "assistant_id": assistant_id,
                "phone_number_id": phone_number_id,
                "context": context,
                "error": call_result.get("error", "Unknown error")
            }
        
    except Exception as e:
        logger.error(f"Failed to prepare conversational update call: {str(e)}")
        return {
            "success": False,
            "message": f"Failed to prepare conversational update call: {str(e)}",
            "phone_number": target_phone_number,
            "assistant_id": assistant_id,
            "phone_number_id": phone_number_id,
            "error": str(e),
            "context": context
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
    test_context = "Your e-commerce site had a major product page update, your blog added 3 new posts, and your competitor's pricing changed by 15%. Also, your main landing page had some design tweaks that look really good!"
    
    result = makeConversationalUpdateCall(test_context)
    print("Call result:", json.dumps(result, indent=2))
