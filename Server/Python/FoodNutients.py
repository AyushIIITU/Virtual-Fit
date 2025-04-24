import pandas as pd
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer
from services.load_food_embedding import df_recipes, food_embeddings, food_names, model
from sklearn.metrics.pairwise import cosine_similarity

def find_best_match(query:str)->str:
    """Find the best match for a given query in the food names.
    Args:
        query (str): The input query to find the best match for.
    Returns:
        str: The food name that best matches the query.
    """
    # Ensure the query is a string
    if not isinstance(query, str):
        raise ValueError("Query must be a string")
    query_embedding = model.encode([query])
    similarities = cosine_similarity(query_embedding, food_embeddings)
    best_idx = np.argmax(similarities)
    return food_names[best_idx]
def get_food_details(food_name:str)->dict:
    """Get food details from the DataFrame.
    Args:
        food_name (str): The name of the food to retrieve details for.
    Returns:
        dict: A dictionary containing the food details, or None if not found.
    """
    food_details = df_recipes[df_recipes["name"] == food_name]
    if not food_details.empty:
        return food_details.to_dict(orient="records")[0]
    else:
        return None
def find_best_food_match(text_array:list[str])->str:
    """Extract the most relevant food name by finding the closest match in recipe embeddings.
    Args:
        text_array (list[str]): A list of strings to find the best food match for.
    Returns:
        str: The food name that best matches the input text array.
    Raises:
        ValueError: If the input is not a list of strings.
    """
    # Convert input list into a single meaningful string
    combined_text = " ".join(text_array)
    
    # Generate embedding for input text
    input_embedding = model.encode([combined_text], convert_to_numpy=True)

    # Compute cosine similarity with all recipes
    similarities = cosine_similarity(input_embedding, food_embeddings)[0]

    # Get the closest match index
    best_match_idx = np.argmax(similarities)
    
    # Access food name directly if food_names is a list
    return food_names[best_match_idx]  # Replace .iloc with direct indexing for lists


# user_input = "roti"
# best_match = find_best_match(user_input)

# print(f"Best match found: {best_match}")
# print(df_recipes[df_recipes["name"] == best_match])
