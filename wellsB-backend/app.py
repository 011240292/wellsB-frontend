from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
from google.genai import types
import os
import json 
import csv
import io
from datetime import datetime, timezone
from supabase import create_client

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
You are the AI food recognition and nutrition analysis system
for WELLsB Smart Wellness.

Your task is to identify and analyse ANY edible food or drink
visible in the uploaded image.

IMPORTANT: Do not restrict recognition to specific meals or a
predefined food list.

Recognise a wide variety of edible items, including:

1. Traditional and international meals.
2. Cooked and raw foods.
3. Fruits and vegetables.
4. Snacks, sweets, desserts and confectionery.
5. Bread, cakes, biscuits and pastries.
6. Drinks and beverages, including water, juice, milk, tea,
   coffee, smoothies and soft drinks.
7. Dairy products, eggs, meat, fish and seafood.
8. Nuts, seeds, cereals and grains.
9. Packaged foods and visible food products.
10. Sauces, soups, spreads and other edible ingredients.

Recognise local Ugandan and African foods as well as foods
from other parts of the world.

If the image contains multiple edible items, identify each
recognisable item separately.

Estimate the portion size and nutritional content of each
item, then calculate the combined nutritional totals.

Include:
- Food or drink names.
- Estimated portion sizes.
- Calories in kcal.
- Protein in grams.
- Carbohydrates in grams.
- Fat in grams.

For drinks, estimate nutritional values according to their
visible type. Do not assume every drink contains calories.
For plain water, estimate zero calories and zero macronutrients.

Do not invent foods that are not visible.
If an item is unclear, explain the uncertainty.
Do not claim exact nutritional measurements.
Use reasonable estimates based on visible portions.

Return ONLY valid JSON using exactly these fields:

{
  "food_name": "Names of all identified foods and drinks",
  "portion_estimate": "Estimated portion of each item",
  "calories": 0,
  "protein_g": 0,
  "carbs_g": 0,
  "fat_g": 0,
  "confidence": "low, medium, or high",
  "notes": "Identified items, combined nutritional estimates and any uncertainty"
}

Use numeric values for calories and nutrients.
Ensure the nutritional totals represent all identified items
combined, not just the first item.

If no recognizable edible item is visible, explain this
clearly in food_name and notes.
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





def get_supabase_client():
    """Connect to Supabase only when its environment variables are available."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        return None

    return create_client(url, key)


def get_local_fitpro_file():
    folder = os.path.join(os.path.dirname(__file__), "fitpro-data")
    os.makedirs(folder, exist_ok=True)
    return os.path.join(folder, "imported_fitpro.json")


def save_fitpro_records(data_type, records):
    """Save records to Supabase, or local JSON during local development."""
    client = get_supabase_client()

    if client:
        client.table("fitpro_records").upsert({
            "data_type": data_type,
            "records": records,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }, on_conflict="data_type").execute()
        return

    storage_file = get_local_fitpro_file()
    saved_data = {}

    if os.path.exists(storage_file):
        with open(storage_file, "r", encoding="utf-8") as file:
            saved_data = json.load(file)

    saved_data[data_type] = records

    with open(storage_file, "w", encoding="utf-8") as file:
        json.dump(saved_data, file, indent=4)


def load_fitpro_records():
    """Read FitPro records directly from the local JSON backup."""

    storage_file = get_local_fitpro_file()

    if not os.path.exists(storage_file):
        return {"steps": [], "heart": [], "sleep": []}

    with open(storage_file, "r", encoding="utf-8") as file:
        saved_data = json.load(file)

    return {
        "steps": saved_data.get("steps", []),
        "heart": saved_data.get("heart", []),
        "sleep": saved_data.get("sleep", [])
    }


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

    if not uploaded_file.filename or not uploaded_file.filename.lower().endswith(".csv"):
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

        save_fitpro_records(data_type, records)

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
        return jsonify({"error": "FitPro import failed. Check the backend logs."}), 500


@app.route("/fitpro-data", methods=["GET"])
def get_fitpro_data():
    try:
        saved_data = load_fitpro_records()
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
