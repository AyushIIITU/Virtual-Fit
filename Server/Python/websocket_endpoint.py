import json
import uuid
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect
import logging
import traceback
import asyncio

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import the async invoke_chain function
from llm_chain import invoke_chain

# Store active connections
active_connections = {}

async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for the VirtualFit chat functionality with streaming support
    """
    # Log connection attempt
    client_host = websocket.client.host if hasattr(websocket, 'client') else 'unknown'
    logger.info(f"New connection attempt from {client_host}")
    
    try:
        await websocket.accept()
        logger.info(f"Connection accepted from {client_host}")
        
        # Generate a unique session ID for this connection
        session_id = str(uuid.uuid4())
        active_connections[session_id] = websocket
        
        # Send connection confirmation
        await websocket.send_json({
            "type": "connection_established",
            "session_id": session_id,
            "message": "Connected to VirtualFit assistant"
        })
        logger.info(f"Session {session_id} established")
        
        # Main message loop
        while True:
            # Receive message from client
            logger.info(f"Waiting for message from session {session_id}")
            data = await websocket.receive_text()
            logger.info(f"Received message from session {session_id}")
            
            try:
                # Parse the message
                message_data = json.loads(data)
                logger.info(f"Message from {session_id}: {message_data.get('message_type', 'unknown type')}")
                
                # Check if it's a text message or image analysis request
                if "message_type" in message_data:
                    if message_data["message_type"] == "text":
                        # Text message processing
                        user_message = message_data.get("text", "")
                        user_data = message_data.get("user_data", {})
                        
                        logger.info(f"Processing text message: '{user_message[:20]}...' for user data: {user_data.get('name', 'unknown')}")
                        
                        if not user_message:
                            await websocket.send_json({
                                "type": "error",
                                "message": "Empty message received"
                            })
                            continue
                        
                        # Build the input for the LLM chain
                        chain_input = {
                            "session_id": session_id,
                            "user_id": message_data.get("user_id", "anonymous"),
                            "user_input": user_message,
                            "user_profile": user_data
                        }
                        
                        # Process the message with our LLM chain - with streaming
                        try:
                            logger.info(f"Invoking language model with streaming for session {session_id}")
                            
                            # First, send a "thinking" message
                            await websocket.send_json({
                                "type": "thinking",
                                "message": "Thinking...",
                            })
                            
                            # Start the streaming response
                            async_response = await invoke_chain(chain_input, stream=True)
                            
                            # Initialize the full response for later
                            full_response = ""
                            
                            # Stream chunks back to the client
                            async for chunk in async_response:
                                full_response += chunk
                                await websocket.send_json({
                                    "type": "stream",
                                    "chunk": chunk,
                                    "timestamp": datetime.utcnow().isoformat()
                                })
                            
                            # Send the complete response at the end
                            await websocket.send_json({
                                "type": "text_response",
                                "text": full_response,
                                "timestamp": datetime.utcnow().isoformat()
                            })
                            logger.info(f"Complete response sent to session {session_id}")
                        
                        except Exception as e:
                            logger.error(f"Error in LLM processing: {str(e)}")
                            logger.error(traceback.format_exc())
                            await websocket.send_json({
                                "type": "error",
                                "message": f"Error processing message: {str(e)}"
                            })
                    
                    elif message_data["message_type"] == "image":
                        # Inform the client that image processing happens via the REST API
                        await websocket.send_json({
                            "type": "info",
                            "message": "Please use the /analyze-food endpoint to upload and analyze food images"
                        })
                        logger.info(f"Image request redirected for session {session_id}")
                
                else:
                    logger.warning(f"Message missing message_type: {data[:100]}")
                    await websocket.send_json({
                        "type": "error",
                        "message": "Missing message_type in request"
                    })
            
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON from session {session_id}: {data[:100]}")
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON format"
                })
            
            except Exception as e:
                logger.error(f"Unexpected error handling message: {str(e)}")
                logger.error(traceback.format_exc())
                await websocket.send_json({
                    "type": "error",
                    "message": f"Server error: {str(e)}"
                })
    
    except WebSocketDisconnect:
        logger.info(f"Client disconnected from session {session_id}")
        # Remove connection from active connections
        if session_id in active_connections:
            del active_connections[session_id]
    
    except Exception as e:
        logger.error(f"WebSocket handling error: {str(e)}")
        logger.error(traceback.format_exc())