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

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model="gemini-flash-latest",
                contents=question,
            )

            if not response.text:
                raise ValueError("Gemini returned an empty response.")

            return response.text

        except Exception as error:
            error_message = str(error)

            temporary_error = (
                "503" in error_message
                or "429" in error_message
                or "UNAVAILABLE" in error_message
                or "RESOURCE_EXHAUSTED" in error_message
            )

            if not temporary_error or attempt == 2:
                raise

            time.sleep(2 ** attempt)

