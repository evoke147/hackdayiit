"""
gemma_client.py
---------------
Thin wrapper around the google-genai SDK for this hackathon project.
Model: gemma-4-26b-a4b-it  (accessed through the Gemini API)

Rules (see guidelines/AI_ASSISTANT_PROMPT.md):
- Never hard-code the API key. It is read from GEMINI_API_KEY in .env.
- Do not switch models or providers.
- Call ask(), ask_with_image(), or make_chat() from other modules.
"""

import os
from pathlib import Path
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load .env from the project root (two levels up from this file)
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

MODEL_ID = "gemma-4-26b-a4b-it"

# One shared client — created once at import time.
_client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])


def ask(prompt: str) -> str:
    """Send a plain-text prompt to Gemma 4 and return the text response."""
    response = _client.models.generate_content(
        model=MODEL_ID,
        contents=prompt,
    )
    return response.text


def ask_with_image(prompt: str, image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    """
    Send a prompt together with an image to Gemma 4.

    Args:
        prompt:      The text instruction.
        image_bytes: Raw bytes of the image.
        mime_type:   MIME type of the image (default: image/jpeg).

    Returns:
        The model's text response.
    """
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
    response = _client.models.generate_content(
        model=MODEL_ID,
        contents=[image_part, prompt],
    )
    return response.text


def make_chat():
    """
    Return a stateful chat session with Gemma 4.
    Use session.send_message(text) to interact.
    """
    return _client.chats.create(model=MODEL_ID)
