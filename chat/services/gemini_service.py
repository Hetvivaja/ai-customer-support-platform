import logging
import os
import time

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

MODEL_NAME = "gemini-3.5-flash-lite"  # keep whichever name works for your key
MAX_ATTEMPTS = 3


def _build_contents(question, history):
    """history = [{"role": "user" | "assistant", "text": "..."}]"""
    contents = []

    for item in history or []:
        role = "model" if item["role"] == "assistant" else "user"
        contents.append(
            types.Content(role=role, parts=[types.Part(text=item["text"])])
        )

    contents.append(types.Content(role="user", parts=[types.Part(text=question)]))
    return contents


def ask_gemini(question, history=None, system_instruction=None):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise ValueError("Gemini API key is not configured.")

    question = question.strip()

    if not question:
        raise ValueError("Question cannot be empty.")

    client = genai.Client(api_key=api_key)
    contents = _build_contents(question, history)
    config = (
        types.GenerateContentConfig(system_instruction=system_instruction)
        if system_instruction
        else None
    )

    for attempt in range(MAX_ATTEMPTS):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=contents,
                config=config,
            )

            if not response.text:
                raise ValueError("Gemini returned an empty response.")

            return response.text

        except Exception as error:
            message = str(error).upper()

            temporary = any(
                code in message
                for code in ("503", "429", "500", "UNAVAILABLE",
                             "RESOURCE_EXHAUSTED", "INTERNAL")
            )

            if not temporary or attempt == MAX_ATTEMPTS - 1:
                raise

            wait_seconds = 2 ** (attempt + 1)
            logger.warning(
                "Gemini temporarily unavailable, retrying in %s s (attempt %s/%s)",
                wait_seconds, attempt + 1, MAX_ATTEMPTS - 1,
            )
            time.sleep(wait_seconds)