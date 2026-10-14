from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
from google.genai import types
import os
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

# Limit uploaded photos to 8 MB
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "success",
        "message": "WELLsB backend is running!"
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "WELLsB Smart Wellness"
    })


@app.route("/analyze-food", methods=["POST"])
def analyze_food():
    # Check that a photo was uploaded
    if "image" not in request.files:
        return jsonify({
            "error": "Please upload a food photo using the image field."
        }), 400

    image = request.files["image"]

    if not image.filename:
        return jsonify({"error": "No photo selected."}), 400

    if image.mimetype not in ["image/jpeg", "image/png", "image/webp"]:
        return jsonify({
            "error": "Please upload a JPG, PNG, or WEBP image."
        }), 400

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return jsonify({
            "error": "The AI API key is not configured on the backend."
        }), 500

    try:
        photo_bytes = image.read()

        if not photo_bytes:
            return jsonify({"error": "The uploaded photo is empty."}), 400

        client = genai.Client(api_key=api_key)

        prompt = """
        Examine this food photo and estimate its nutritional content.
        Return ONLY valid JSON with these fields:
        {
          "food_name": "best estimate of the food",
          "portion_estimate": "estimated portion size",
          "calories": 0,
          "protein_g": 0,
          "carbs_g": 0,
          "fat_g": 0,
          "confidence": "low, medium, or high",
          "notes": "brief explanation of uncertainty"
        }
        Use numeric values for calories and nutrients.
        Estimate only what is visible. Do not claim exact measurements.
        If the image does not show recognizable food, say so in food_name
        and explain that in notes.
        """

        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=[
                types.Part.from_bytes(
                    data=photo_bytes,
                    mime_type=image.mimetype
                ),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        result = json.loads(response.text)

        return jsonify({
            "status": "success",
            "analysis": result
        })

    except Exception:
        app.logger.exception("Food photo analysis failed")
        return jsonify({
            "error": "Food analysis failed. Check the backend logs and API configuration."
        }), 502


@app.errorhandler(413)
def file_too_large(error):
    return jsonify({
        "error": "The photo is too large. Please use an image smaller than 8 MB."
    }), 413


if __name__ == "__main__":
    app.run(debug=True, port=5000)
