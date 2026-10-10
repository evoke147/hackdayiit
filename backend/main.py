"""
main.py
-------
FastAPI application for the Antigravity career accelerator.

The /roadmap endpoint returns fully structured JSON — each section
of the Launch Plan (strengths, gaps, actions, radar) is a typed
field, not a raw markdown blob.

Model: gemma-4-26b-a4b-it  (called through the Gemini API via gemma_client.py)

Endpoints:
  GET  /          — health check
  POST /roadmap   — generate an Antigravity Launch Plan for a student

Run with:
  uvicorn main:app --reload
"""

import os
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

from models import OnboardingData, RoadmapResponse, TweakRequest
from prompt_builder import build_roadmap_prompt, parse_roadmap_response, build_tweak_prompt
import gemma_client  # uses ask() which calls gemma-4-26b-a4b-it

app = FastAPI(
    title="Antigravity Career Accelerator API",
    description=(
        "Generates a personalised career roadmap (the Antigravity Launch Plan) "
        "powered by Gemma 4 through the Gemini API."
    ),
    version="1.0.0",
)

# Allow the frontend (any origin during the hackathon) to call this API.
# Tighten this to specific origins before a production deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

HTML_PATH = Path(__file__).parent / "index.html"


@app.get("/", summary="Web App & Health Check")
def index_or_health(request: Request):
    """
    Returns the interactive single-screen Web UI when accessed from a browser,
    or returns the JSON health-check when requested programmatically.
    """
    accept = request.headers.get("accept", "")
    if "text/html" in accept and HTML_PATH.exists():
        return FileResponse(HTML_PATH)

    return {
        "status": "ok",
        "model": gemma_client.MODEL_ID,
        "message": "Antigravity API is live. Open http://127.0.0.1:8000/ in a browser for the Web UI, or POST to /roadmap.",
        "interactive_docs": "/docs",
    }


@app.get("/app", summary="Web App")
def web_app():
    """Explicit endpoint to open the interactive UI in a browser."""
    if HTML_PATH.exists():
        return FileResponse(HTML_PATH)
    return HTMLResponse("<h1>Antigravity Web UI</h1>")


@app.get("/roadmap", summary="Roadmap usage guidance")
def roadmap_info():
    """Friendly explanation if someone opens /roadmap in a browser."""
    return {
        "message": "The /roadmap endpoint requires a POST request with the student's profile JSON.",
        "web_ui": "Open http://127.0.0.1:8000/ in your browser for the full interactive form.",
        "interactive_docs": "Visit http://127.0.0.1:8000/docs to test the API with 1 click.",
    }


@app.post(
    "/roadmap",
    response_model=RoadmapResponse,
    summary="Generate an Antigravity Launch Plan",
)
def generate_roadmap(data: OnboardingData):
    """
    Accepts a student's onboarding profile, builds the Launch Plan prompt,
    sends it to Gemma 4 via the Gemini API, and returns structured JSON.

    Flow:
      1. build_roadmap_prompt()  — fills the prompt template
      2. gemma_client.ask()      — one Gemma 4 API call
      3. parse_roadmap_response() — extracts + validates the JSON
      4. Return RoadmapResponse  — typed, Pydantic-validated JSON

    One Gemma call per request — no database, no auth.
    """
    prompt = build_roadmap_prompt(data)

    try:
        # Step 2: one call to Gemma 4 through the Gemini API
        raw_response = gemma_client.ask(prompt)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Gemma API error: {exc}",
        )

    try:
        # Step 3: extract and validate the JSON from Gemma's reply
        launch_plan = parse_roadmap_response(raw_response)
    except (ValueError, Exception) as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Could not parse Gemma's JSON response: {exc}",
        )

    # Step 4: return fully structured JSON — no markdown, no post-processing needed
    return RoadmapResponse(
        model_used=gemma_client.MODEL_ID,
        launch_plan=launch_plan,
    )


@app.post(
    "/roadmap/tweak",
    response_model=RoadmapResponse,
    summary="Tweak an existing Launch Plan with memory of the profile and previous plan",
)
def tweak_roadmap(request: TweakRequest):
    """
    Accepts the original onboarding profile, previous launch plan, and user feedback.
    Maintains memory of the student's profile to tweak and return an updated JSON plan.
    """
    prompt = build_tweak_prompt(
        data=request.onboarding_data,
        previous_plan=request.previous_plan,
        feedback=request.user_feedback,
    )

    try:
        raw_response = gemma_client.ask(prompt)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Gemma API error: {exc}",
        )

    try:
        updated_plan = parse_roadmap_response(raw_response)
    except (ValueError, Exception) as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Could not parse Gemma's JSON response: {exc}",
        )

    return RoadmapResponse(
        model_used=gemma_client.MODEL_ID,
        launch_plan=updated_plan,
    )
