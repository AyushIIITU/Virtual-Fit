import os
import uuid
from fastapi import FastAPI, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from langgraph.graph import StateGraph, END
from typing import TypedDict
from searchFoodImage import get_food_name_from_google
from FoodClassifer import classify_image_file
from FoodNutients import get_food_details, find_best_food_match

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# State definition
class GraphState(TypedDict):
    image_path: str
    classification: str
    raw_name: str
    food_name: str
    nutrition: dict

# Clients to communicate with WebSocket
clients = {}

# LangGraph functions
async def classify_image(state: GraphState):
    await clients[state["session_id"]].send_text("Step: classify")
    image_type = await classify_image_file(state["image_path"])
    return {"classification": image_type["prediction"]}

async def get_food_name(state: GraphState):
    await clients[state["session_id"]].send_text("Step: get_name")
    if state["classification"] == "Food":
        name = get_food_name_from_google(state["image_path"])
    else:
        name = "Non-Food"
    return {"raw_name": name}

async def clean_food_name(state: GraphState):
    await clients[state["session_id"]].send_text("Step: clean_name")
    result = find_best_food_match(state["raw_name"])
    return {"food_name": result}

async def get_nutrition(state: GraphState):
    await clients[state["session_id"]].send_text("Step: get_nutrition")
    if state["food_name"] != "Non-Food":
        info = get_food_details(state["food_name"])
    else:
        info = {}
    return {"nutrition": info}

# Build LangGraph
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

# Upload endpoint
@app.post("/upload")
async def upload_image(file: UploadFile):
    session_id = str(uuid.uuid4())
    upload_dir = "static/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{session_id}_{file.filename}")
    
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    return {"session_id": session_id, "image_path": file_path}

# WebSocket for real-time updates
@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    clients[session_id] = websocket
    try:
        image_files = [f for f in os.listdir("static/uploads") if f.startswith(session_id)]
        if not image_files:
            await websocket.send_text("Image not found")
            return
        
        image_path = os.path.join("static/uploads", image_files[0])
        result = await graph.ainvoke({
            "image_path": image_path,
            "session_id": session_id  # extra field for WebSocket mapping
        })
        await websocket.send_json({"result": result})
    except WebSocketDisconnect:
        print(f"Client {session_id} disconnected")
    finally:
        clients.pop(session_id, None)
