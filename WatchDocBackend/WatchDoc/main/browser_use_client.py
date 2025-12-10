import json
import re
import time
from dataclasses import dataclass
from typing import Any, Dict, Optional

import requests
from django.conf import settings

from .models import DocumentScan


class BrowserUseAPIError(Exception):
    """Custom exception for Browser Use API failures."""


@dataclass
class BrowserUseResult:
    difference_detected: bool
    difference_description: str
    severity: str
    current_summary: str
    changes: Optional[Dict[str, list]] = None  # {"added": [...], "removed": [...], "modified": [...]}
    raw_response: Dict[str, Any] = None


class BrowserUseClient:
    """Thin client around the Browser Use Cloud API."""

    DEFAULT_BASE_URL = "https://api.browser-use.com/api/v1"

    def __init__(
        self,
        *,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        poll_interval: Optional[float] = None,
        timeout: Optional[float] = None,
        session: Optional[requests.Session] = None,
    ) -> None:
        self.api_key = api_key or getattr(settings, "BROWSER_USE_API_KEY", None)
        if not self.api_key:
            raise BrowserUseAPIError("Browser Use API key is not configured.")

        self.base_url = base_url or getattr(settings, "BROWSER_USE_API_BASE_URL", self.DEFAULT_BASE_URL)
        self.poll_interval = poll_interval or getattr(settings, "BROWSER_USE_API_POLL_INTERVAL", 2.0)
        self.timeout = timeout or getattr(settings, "BROWSER_USE_API_TIMEOUT", 120.0)
        self.session = session or requests.Session()
        self.include_schema = getattr(settings, "BROWSER_USE_INCLUDE_SCHEMA", False)

    # Public API -----------------------------------------------------------------
    def compare_document(self, *, url: str, title: str, previous_snapshot: Optional[Dict[str, Any]] = None) -> BrowserUseResult:
        payload = self._build_payload(url=url, title=title, previous_snapshot=previous_snapshot)
        task_id = self._start_task(payload)
        task_details = self._wait_for_completion(task_id)
        parsed_output = self._parse_task_output(task_details)

        required_fields = [
            "difference_detected",
            "difference_description",
            "severity",
            "current_summary",
        ]
        missing_fields = [field for field in required_fields if field not in parsed_output]
        if missing_fields:
            raise BrowserUseAPIError(
                "Browser Use task output is missing required fields: " + ", ".join(sorted(missing_fields))
            )

        difference_detected_raw = parsed_output["difference_detected"]
        if isinstance(difference_detected_raw, bool):
            difference_detected = difference_detected_raw
        elif isinstance(difference_detected_raw, str):
            normalised = difference_detected_raw.strip().lower()
            if normalised in {"true", "yes", "1", "changed", "change", "y"}:
                difference_detected = True
            elif normalised in {"false", "no", "0", "unchanged", "none", "n"}:
                difference_detected = False
            else:
                raise BrowserUseAPIError(
                    "Browser Use task output provided an unrecognised value for 'difference_detected': "
                    f"{difference_detected_raw!r}"
                )
        elif isinstance(difference_detected_raw, (int, float)):
            difference_detected = bool(difference_detected_raw)
        else:
            raise BrowserUseAPIError(
                "Browser Use task output provided an unsupported type for 'difference_detected'."
            )

        difference_description = str(parsed_output["difference_description"])
        severity = str(parsed_output["severity"])
        current_summary = str(parsed_output["current_summary"])
        
        # Parse changes with fallback to empty structure
        changes = parsed_output.get("changes", {})
        if not isinstance(changes, dict):
            changes = {"added": [], "removed": [], "modified": []}
        else:
            # Ensure all required keys exist
            changes = {
                "added": changes.get("added", []),
                "removed": changes.get("removed", []),
                "modified": changes.get("modified", [])
            }
        
        allowed_values = {choice for choice, _ in DocumentScan.CHANGE_LEVEL_CHOICES}
        severity = severity if severity in allowed_values else ("No Change" if not difference_detected else "Major")

        return BrowserUseResult(
            difference_detected=difference_detected,
            difference_description=difference_description,
            severity=severity,
            current_summary=current_summary,
            changes=changes,
            raw_response=task_details,
        )

    # Internal helpers -----------------------------------------------------------
    def _build_payload(self, *, url: str, title: str, previous_snapshot: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        previous_summary = None
        previous_description = None
        previous_content = None
        if previous_snapshot:
            previous_summary = previous_snapshot.get("current_summary") or previous_snapshot.get("summary")
            previous_description = previous_snapshot.get("difference_description") or previous_snapshot.get("changeSummary")
            previous_content = previous_snapshot.get("raw_content")

        instructions = self._build_instructions(
            url=url,
            title=title,
            previous_summary=previous_summary,
            previous_description=previous_description,
            previous_content=previous_content,
        )

        schema = {
            "type": "object",
            "properties": {
                "difference_detected": {"type": "boolean", "description": "True if the document changed."},
                "difference_description": {
                    "type": "string",
                    "description": "Detailed explanation of changes between the previous and current version.",
                },
                "severity": {
                    "type": "string",
                    "enum": ["No Change", "Low", "Major", "Critical"],
                    "description": "How major the change is from no change to critical.",
                },
                "current_summary": {
                    "type": "string",
                    "description": "Highly detailed summary of the current document version.",
                },
                "changes": {
                    "type": "object",
                    "properties": {
                        "added": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of content/elements that were added to the document."
                        },
                        "removed": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of content/elements that were removed from the document."
                        },
                        "modified": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of content/elements that were modified in the document."
                        }
                    },
                    "required": ["added", "removed", "modified"],
                    "description": "Structured breakdown of specific changes categorized by type."
                },
            },
            "required": [
                "difference_detected",
                "difference_description",
                "severity",
                "current_summary",
                "changes",
            ],
            "additionalProperties": False,
        }

        payload = {
            "task": instructions,
            "llm_model": "gemini-2.5-pro",
        }

        if self.include_schema:
            payload["structured_output_json"] = json.dumps(schema)

        return payload

    def _build_instructions(
        self,
        *,
        url: str,
        title: str,
        previous_summary: Optional[str],
        previous_description: Optional[str],
        previous_content: Optional[str] = None,
    ) -> str:
        if previous_summary:
            comparison_context = (
                "Previous snapshot details to compare against:\n"
                f"- Summary:\n{previous_summary}\n\n"
                f"- Difference notes:\n{previous_description or 'None provided.'}\n\n"
            )
            
            # Include raw content if available for more accurate comparison
            if previous_content:
                # Truncate if too long to avoid token limits
                content_preview = previous_content[:10000] if len(previous_content) > 10000 else previous_content
                comparison_context += (
                    f"- Previous Raw Content (for detailed comparison):\n{content_preview}\n"
                    f"{'[Content truncated due to length]' if len(previous_content) > 10000 else ''}"
                )

            return (
                f"You are monitoring the document titled '{title}' at {url}.\n"
                "Follow these steps carefully:\n"
                "1. Visit the URL and review the current document thoroughly.\n"
                "2. Produce a meticulous, highly detailed summary of the current version.\n"
                "3. Compare the current version with the previous snapshot details provided below and catalogue every difference, even subtle ones.\n"
                "4. Determine whether any differences exist. If they do, set 'difference_detected' to true and choose an appropriate 'severity' from: No Change, Low, Major, Critical.\n"
                "5. For the 'changes' object, categorize specific changes into:\n"
                "   - 'added': New content, sections, links, images, or features that weren't present before\n"
                "   - 'removed': Content, sections, links, images, or features that existed before but are now gone\n"
                "   - 'modified': Existing content that has been altered, updated, or changed in some way\n"
                "   Each category should be an array of descriptive strings. If no changes in a category, use an empty array.\n"
                "6. Respond strictly with a JSON object containing the keys: difference_detected (boolean), difference_description (string), severity (string), current_summary (string), changes (object with added/removed/modified arrays). Do not include natural language outside of that JSON object.\n\n"
                f"{comparison_context}"
            )

        return (
            f"You are monitoring the document titled '{title}' at {url}.\n"
            "No previous snapshot exists, so treat this scan as the baseline record.\n"
            "1. Visit the URL and examine the document thoroughly.\n"
            "2. Produce a meticulous, highly detailed summary of the current version.\n"
            "3. Because this is the baseline, set 'difference_detected' to false and 'severity' to 'No Change'. In 'difference_description', note that this is the initial snapshot and highlight any noteworthy observations.\n"
            "4. For the 'changes' object, since this is the baseline, set all arrays (added, removed, modified) to empty arrays.\n"
            "5. Respond strictly with a JSON object containing the keys: difference_detected (boolean), difference_description (string), severity (string), current_summary (string), changes (object with empty added/removed/modified arrays). Do not include natural language outside of the JSON object."
        )

    def _start_task(self, payload: Dict[str, Any]) -> str:
        response = self.session.post(
            f"{self.base_url}/run-task",
            headers=self._headers,
            json=payload,
            timeout=30,
        )
        self._raise_for_status(response)
        data = response.json()
        task_id = data.get("id")
        if not task_id:
            raise BrowserUseAPIError("Browser Use API response did not include a task ID.")
        return task_id

    def _wait_for_completion(self, task_id: str) -> Dict[str, Any]:
        deadline = time.monotonic() + self.timeout
        while True:
            response = self.session.get(
                f"{self.base_url}/task/{task_id}",
                headers=self._headers,
                timeout=30,
            )
            self._raise_for_status(response)
            payload = response.json()
            status = payload.get("status")
            if status in {"finished", "failed", "stopped"}:
                if status != "finished":
                    raise BrowserUseAPIError(f"Browser Use task {task_id} ended with status: {status}")
                return payload

            if time.monotonic() > deadline:
                raise BrowserUseAPIError(f"Timed out waiting for Browser Use task {task_id} to finish.")

            time.sleep(self.poll_interval)

    def _parse_task_output(self, task_details: Dict[str, Any]) -> Dict[str, Any]:
        output = task_details.get("output")
        if output is None:
            raise BrowserUseAPIError("Browser Use task did not contain an output payload.")

        if isinstance(output, dict):
            return output

        if isinstance(output, str):
            candidate = output.strip()
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                match = re.search(r"\{.*\}", candidate, flags=re.DOTALL)
                if match:
                    try:
                        return json.loads(match.group(0))
                    except json.JSONDecodeError as exc:
                        raise BrowserUseAPIError("Unable to parse JSON output from Browser Use task.") from exc
            raise BrowserUseAPIError("Browser Use output could not be parsed as JSON.")

        raise BrowserUseAPIError("Browser Use output format is not supported.")

    @property
    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    @staticmethod
    def _raise_for_status(response: requests.Response) -> None:
        try:
            response.raise_for_status()
        except requests.HTTPError as exc:  # pragma: no cover - requests already provides info
            raise BrowserUseAPIError(f"Browser Use API request failed: {exc}") from exc