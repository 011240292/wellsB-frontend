from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
from google.genai import types
import os
import json 
import csv
import io

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



@app.route("/import-fitpro", methods=["POST"])
def import_fitpro():
    if "file" not in request.files:
        return jsonify({"error": "Please select a FitPro CSV file."}), 400

    uploaded_file = request.files["file"]
    data_type = request.form.get("data_type", "").lower()

    required_columns = {
        "steps": ["userId", "devid", "date", "mode", "step", "calory", "distance"],
        "heart": ["userId", "devid", "date", "heart", "spo"],
        "sleep": ["userId", "devid", "date", "sleepType", "minutes"]
    }

    if data_type not in required_columns:
        return jsonify({"error": "Invalid data type. Choose steps, heart, or sleep."}), 400

    if not uploaded_file.filename.lower().endswith(".csv"):
        return jsonify({"error": "Please upload a CSV file."}), 400

    try:
        content = uploaded_file.read().decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(content))

        if not reader.fieldnames:
            return jsonify({"error": "The CSV file is empty."}), 400

        reader.fieldnames = [name.strip() for name in reader.fieldnames]

        missing = [
            column for column in required_columns[data_type]
            if column not in reader.fieldnames
        ]

        if missing:
            return jsonify({
                "error": "Incorrect FitPro CSV format.",
                "missing_columns": missing
            }), 400

        records = list(reader)

        if not records:
            return jsonify({"error": "No smartwatch records found."}), 400

        # Save the imported records so the frontend can retrieve them later
        storage_folder = os.path.join(os.path.dirname(__file__), "fitpro-data")
        os.makedirs(storage_folder, exist_ok=True)

        storage_file = os.path.join(storage_folder, "imported_fitpro.json")

        saved_data = {}

        if os.path.exists(storage_file):
            with open(storage_file, "r", encoding="utf-8") as file:
                saved_data = json.load(file)

        # Replace the previous import of this data type
        saved_data[data_type] = records

        with open(storage_file, "w", encoding="utf-8") as file:
            json.dump(saved_data, file, indent=4)
        return jsonify({
            "status": "success",
            "message": "FitPro data imported successfully.",
            "data_type": data_type,
            "total_records": len(records),
            "records": records
        }), 200

    except UnicodeDecodeError:
        return jsonify({"error": "Could not read this CSV file."}), 400

    except Exception:
        app.logger.exception("FitPro import failed")
        return jsonify({"error": "FitPro import failed."}), 500

@app.route("/fitpro-data", methods=["GET"])
def get_fitpro_data():
    storage_file = os.path.join(
        os.path.dirname(__file__),
        "fitpro-data",
        "imported_fitpro.json"
    )

    if not os.path.exists(storage_file):
        return jsonify({
            "status": "success",
            "records": {
                "steps": [],
                "heart": [],
                "sleep": []
            }
        })

    try:
        with open(storage_file, "r", encoding="utf-8") as file:
            saved_data = json.load(file)

        data_type = request.args.get("type")

        if data_type:
            if data_type not in ["steps", "heart", "sleep"]:
                return jsonify({"error": "Invalid data type."}), 400

            return jsonify({
                "status": "success",
                "data_type": data_type,
                "records": saved_data.get(data_type, [])
            })

        return jsonify({
            "status": "success",
            "records": saved_data
        })

    except Exception:
        app.logger.exception("Could not retrieve FitPro data")
        return jsonify({"error": "Could not retrieve FitPro data."}), 500
@app.errorhandler(413)
def file_too_large(error):
    return jsonify({
        "error": "The photo is too large. Please use an image smaller than 8 MB."
    }), 413


if __name__ == "__main__":
    app.run(debug=True, port=5000)
