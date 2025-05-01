from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import uuid
import shutil
import asyncio
import sys

# Import from langgraph
from langgraph.graph import StateGraph, END
from typing import TypedDict
from searchFoodImage import get_food_name_from_google
from FoodClassifer import classify_image_file
from FoodNutients import find_best_match, get_food_details, find_best_food_match

# Import WebSocket handling
from websocket_endpoint import websocket_endpoint

class GraphState(TypedDict):
    image_path: str
    classification: str
    raw_name: str
    food_name: str
    nutrition: dict

# Create the graph processing function
async def process_image_graph(image_path: str):
    async def classify_image(state: GraphState):
        image_type = await classify_image_file(state["image_path"])
        return {"classification": image_type["prediction"]}

    async def get_food_name(state: GraphState):
        if state["classification"] == "Food":
            name = get_food_name_from_google(state["image_path"])
        else:
            name = "Non-Food"
        return {"raw_name": name}

    async def clean_food_name(state: GraphState):
        result = find_best_food_match(state["raw_name"])
        return {"food_name": result}

    def get_nutrition(state: GraphState):
        if state["food_name"] != "Non-Food":
            info = get_food_details(state["food_name"])
        else:
            info = {}
        return {"nutrition": info}
    
    builder = StateGraph(GraphState)

    builder.add_node("classify", classify_image)
    builder.add_node("get_name", get_food_name)
    builder.add_node("clean_name", clean_food_name)
    builder.add_node("get_nutrition", get_nutrition)

    builder.set_entry_point("classify")

    builder.add_edge("classify", "get_name")
    builder.add_edge("get_name", "clean_name")
    builder.add_edge("clean_name", "get_nutrition")
    builder.add_edge("get_nutrition", END)

    graph = builder.compile()
    result = await graph.ainvoke({"image_path": image_path})
    return result

# Create FastAPI app
app = FastAPI(title="VirtualFit API")

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Ensure upload directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/analyze-food")
async def analyze_food(file: UploadFile = File(...)):
    """
    Upload a food image and get nutrition information.
    """
    # Validate file is an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Save the uploaded file
    try:
        # Create a unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Process the image with our graph
        result = await process_image_graph(file_path)
        
        # Return the result
        return {
            "status": "success",
            "filename": file.filename,
            "classification": result.get("classification", ""),
            "food_name": result.get("food_name", ""),
            "nutrition": result.get("nutrition", {})
        }
    
    except Exception as e:
        # Clean up file if it exists
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.websocket("/chat")
async def chat_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for virtual fitness assistant chat.
    """
    await websocket_endpoint(websocket)

@app.get("/")
async def root():
    return {
        "message": "Welcome to the VirtualFit API",
        "endpoints": {
            "analyze_food": "POST /analyze-food - Upload and analyze a food image",
            "chat": "WebSocket /chat - Connect to the fitness assistant chatbot"
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)