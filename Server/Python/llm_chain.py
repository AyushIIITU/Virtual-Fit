from langchain_ollama import ChatOllama
from langchain.prompts import SystemMessagePromptTemplate, HumanMessagePromptTemplate, ChatPromptTemplate
from langchain.callbacks import AsyncIteratorCallbackHandler
import json
import uuid
from datetime import datetime
import logging
import traceback
import asyncio
from typing import AsyncIterator

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Default model name if not specified
DEFAULT_MODEL = "Goosedev/luna:latest"

async def create_llm_chain(model_name: str, user_data_json: dict):
    """
    Initialize the LangChain pipeline with the Ollama model and system prompt.
    Returns an async function that can be called to generate responses.
    """
    try:
        # Initialize the Ollama model with async capabilities
        logger.info(f"Initializing Async Ollama model: {model_name}")
        
        # Sanitize the user data to ensure it's valid
        sanitized_user_data = {}
        if isinstance(user_data_json, dict):
            # Copy only values that can be safely serialized
            for key, value in user_data_json.items():
                if isinstance(value, (str, int, float, bool, list, dict)) or value is None:
                    sanitized_user_data[key] = value
        
        # Convert user data to a readable text format instead of JSON
        # This helps avoid JSON parsing issues in the prompt
        profile_text = "User Profile:\n"
        for key, value in sanitized_user_data.items():
            if isinstance(value, list):
                value_str = ", ".join(map(str, value))
            else:
                value_str = str(value)
            profile_text += f"- {key}: {value_str}\n"
        
        if not profile_text or profile_text == "User Profile:\n":
            profile_text = "User Profile: No detailed information provided."
        
        # Create the system prompt template
        system_prompt = """
You are a virtual fitness assistant for the VirtualFit app. Your job is to help users with their fitness and nutrition questions.

When responding to user queries, consider their profile information:

{user_profile}

Guidelines:
- If the user asks about diet or nutrition, provide advice based on their profile data.
- If the user asks about workouts or exercise, suggest activities suitable for their fitness level.
- For general questions, be helpful and informative.
- Keep your tone friendly and motivating.
- If the profile lacks relevant information for the question, provide general best practices.
- If the user asks about food nutrition, suggest they use the image analysis feature in the app.

When responding about diet plans:
1. Consider their dietary restrictions, allergies, and foods to avoid
2. Align with their calorie/protein needs and goals
3. Keep recommendations practical and realistic

When responding about exercise:
1. Match intensity to their current fitness level
2. Consider any medical conditions or limitations
3. Structure recommendations based on their available days per week
"""
        
        # Create prompt templates using proper variable formatting
        system_template = SystemMessagePromptTemplate.from_template(system_prompt)
        human_template = HumanMessagePromptTemplate.from_template("{user_input}")
        
        # Create the chat prompt template
        chat_prompt = ChatPromptTemplate.from_messages([
            system_template,
            human_template
        ])
        
        # Return an async function that will process the input and support streaming
        async def chain_function(user_input, stream=False):
            # Validate and clean user input
            if not isinstance(user_input, str):
                user_input = str(user_input) if hasattr(user_input, "__str__") else "I need fitness advice"
            
            # Limit input length to prevent issues
            user_input = user_input[:1000].strip()
            
            try:
                # Format the messages with our prepared profile text
                formatted_messages = chat_prompt.format_messages(
                    user_profile=profile_text,
                    user_input=user_input
                )
                
                if stream:
                    # Set up streaming with callback handler
                    callback_handler = AsyncIteratorCallbackHandler()
                    
                    # Create a model instance with the callback handler
                    streaming_llm = ChatOllama(
                        model=model_name,
                        callbacks=[callback_handler]
                    )
                    
                    # Start generating in the background
                    task = asyncio.create_task(
                        streaming_llm.ainvoke(formatted_messages)
                    )
                    
                    # Return an async generator that yields chunks as they arrive
                    async def response_generator():
                        try:
                            async for chunk in callback_handler.aiter():
                                yield chunk
                        except Exception as e:
                            logger.error(f"Error in streaming: {str(e)}")
                            yield "\nError: Streaming interrupted."
                        finally:
                            # Make sure we gather the task at the end
                            await task
                    
                    return response_generator()
                else:
                    # For non-streaming, use regular async invocation
                    llm = ChatOllama(model=model_name)
                    response = await llm.ainvoke(formatted_messages)
                    return response.content
                    
            except Exception as e:
                logger.error(f"Error in chain function: {str(e)}")
                logger.error(traceback.format_exc())
                return "I'm having trouble processing your request right now."
        
        logger.info("Async LLM chain created successfully")
        return chain_function
        
    except Exception as e:
        logger.error(f"Error creating LLM chain: {str(e)}")
        logger.error(traceback.format_exc())
        
        # Return a fallback async function
        async def error_chain(user_input, stream=False):
            if stream:
                async def error_generator():
                    yield "Sorry, I'm having trouble connecting to the language model."
                return error_generator()
            return "Sorry, I'm having trouble connecting to the language model."
        
        return error_chain

async def invoke_chain(input_data, stream=False):
    """
    Invoke the LangChain pipeline with user input and return the response.
    If stream=True, returns an async generator that yields response chunks.
    """
    try:
        # Extract user input and profile
        user_input = input_data.get("user_input", "")
        user_profile = input_data.get("user_profile", {})
        session_id = input_data.get("session_id", str(uuid.uuid4()))
        
        logger.info(f"Creating async LLM chain for session {session_id}")
        
        # Validate user profile
        if not isinstance(user_profile, dict):
            logger.warning(f"Invalid user_profile type: {type(user_profile)}, using empty dict")
            user_profile = {}
        
        # Create a new LLM chain for this invocation
        llm_chain = await create_llm_chain(model_name=DEFAULT_MODEL, user_data_json=user_profile)
        
        if not llm_chain:
            logger.error("LLM chain creation failed")
            if stream:
                async def error_stream():
                    yield "Sorry, I'm unable to process your request at the moment."
                return error_stream()
            return "Sorry, I'm unable to process your request at the moment."
        
        # Generate a response
        logger.info(f"Generating response for user input: {user_input[:50]}...")
        try:
            return await llm_chain(user_input, stream=stream)
        except Exception as chain_error:
            logger.error(f"Error calling LLM chain: {str(chain_error)}")
            logger.error(traceback.format_exc())
            if stream:
                async def error_stream():
                    yield "I'm having trouble processing your request. Could you try asking in a different way?"
                return error_stream()
            return "I'm having trouble processing your request. Could you try asking in a different way?"
    
    except Exception as e:
        logger.error(f"Error invoking chain: {str(e)}")
        logger.error(traceback.format_exc())
        if stream:
            async def error_stream():
                yield f"Sorry, I encountered an error while processing your request."
            return error_stream()
        return f"Sorry, I encountered an error while processing your request."