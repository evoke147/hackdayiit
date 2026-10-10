"""
test_roadmap.py
---------------
Quick smoke-test: sends a sample profile to the /roadmap endpoint and
prints the generated Launch Plan as structured JSON.

Usage (with the server running):
  python test_roadmap.py

Or test directly against the Gemma client without the server:
  python test_roadmap.py --direct
"""

import sys
import json
import urllib.request
import urllib.error


SAMPLE_PROFILE = {
    "degree_specialization": "B.Tech Computer Science with AI specialization",
    "year_semester": "3rd Year, Semester 5",
    "subjects_studied": "DSA, DBMS, Operating Systems, Machine Learning, Computer Networks",
    "skills": "Problem solving, teamwork, REST API design, data analysis",
    "programming_languages": "Python, Java, JavaScript",
    "career_goals": "Become an ML Engineer at a product-based company within 18 months",
    "preferred_industry": "Artificial Intelligence / Machine Learning",
}


def _pretty_print(body: dict) -> None:
    """Print the structured JSON response in a readable format."""
    model = body.get("model_used", "unknown")
    plan  = body.get("launch_plan", {})

    print("=== Antigravity Launch Plan ===\n")
    print("1. Profile Strengths")
    for s in plan.get("profile_strengths", []):
        print(f"   * {s}")

    print("\n2. The Missing Links")
    for s in plan.get("missing_links", []):
        print(f"   * {s}")

    print("\n3. Next 30 Days")
    for i, s in enumerate(plan.get("next_30_days", []), 1):
        print(f"   {i}. {s}")

    radar = plan.get("industry_radar", {})
    print("\n4. Industry Radar")
    print(f"   Topic : {radar.get('topic', '')}")
    print(f"   Why   : {radar.get('reason', '')}")

    print(f"\n[model: {model}]")
    print("\n--- Raw JSON ---")
    print(json.dumps(body, indent=2))


def test_via_api(base_url: str = "http://127.0.0.1:8000") -> None:
    """POST the sample profile to the running FastAPI server."""
    url = f"{base_url}/roadmap"
    payload = json.dumps(SAMPLE_PROFILE).encode()
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = json.loads(resp.read())
            _pretty_print(body)
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode()}")
        sys.exit(1)
    except ConnectionRefusedError:
        print("Server not running. Start it with: uvicorn main:app --reload")
        sys.exit(1)


def test_direct() -> None:
    """Call gemma_client.ask() directly, without the HTTP server."""
    import os
    sys.path.insert(0, os.path.dirname(__file__))

    from models import OnboardingData
    from prompt_builder import build_roadmap_prompt, parse_roadmap_response
    import gemma_client

    data   = OnboardingData(**SAMPLE_PROFILE)
    prompt = build_roadmap_prompt(data)
    raw    = gemma_client.ask(prompt)

    # Parse Gemma's reply into structured JSON via the same path as the API
    plan = parse_roadmap_response(raw)

    # Wrap in the same shape as the HTTP response for _pretty_print
    body = {
        "model_used":  gemma_client.MODEL_ID,
        "launch_plan": plan.model_dump(),
    }
    _pretty_print(body)


if __name__ == "__main__":
    if "--direct" in sys.argv:
        test_direct()
    else:
        test_via_api()
