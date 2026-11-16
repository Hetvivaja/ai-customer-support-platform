
import os
import time
from google import genai


def ask_gemini(question):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise ValueError("Gemini API key is not configured.")

    question = question.strip()

    if not question:
        raise ValueError("Question cannot be empty.")

    client = genai.Client(api_key=api_key)

    max_attempts = 4

    for attempt in range(max_attempts):
        try:
            response = client.models.generate_content(
                model="gemini-3.5-flash-lite",# model= "gemini-3.8-flash","gemini-flash-latest",
                contents=question,
            )

            if not response.text:
                raise ValueError("Gemini returned an empty response.")

            return response.text

        except Exception as error:
            error_message = str(error).upper()

            temporary_error = (
                "503" in error_message
                or "429" in error_message
                or "UNAVAILABLE" in error_message
                or "RESOURCE_EXHAUSTED" in error_message
                or "500" in error_message
                or "INTERNAL" in error_message
            )

            if not temporary_error or attempt == max_attempts - 1:
                raise

            wait_seconds = 2 ** (attempt + 1)
            print(
                f"Gemini temporarily unavailable. "
                f"Retrying in {wait_seconds} seconds "
                f"(attempt {attempt + 1}/{max_attempts - 1})..."
            )
            time.sleep(wait_seconds)
