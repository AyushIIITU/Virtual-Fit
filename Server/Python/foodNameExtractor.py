import pandas as pd
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
# df_recipes = pd.read_csv("./Dataset/Food/RAW_recipes.csv")
model = SentenceTransformer("all-MiniLM-L6-v2")
# Load precomputed embeddings and dataset
recipes_df = pd.read_csv("./Dataset/Food/RAW_recipes.csv")
recipe_embeddings = np.load("./models/food_embeddings.npy")
with open("./models/food_names.pkl", "rb") as f:
    food_names = pickle.load(f)
    
def find_best_food_match(text_array):
    """Extract the most relevant food name by finding the closest match in recipe embeddings."""
    # Convert input list into a single meaningful string
    combined_text = " ".join(text_array)
    
    # Generate embedding for input text
    input_embedding = model.encode([combined_text], convert_to_numpy=True)

    # Compute cosine similarity with all recipes
    similarities = cosine_similarity(input_embedding, recipe_embeddings)[0]

    # Get the closest match
    best_match_idx = np.argmax(similarities)
    return recipes_df.iloc[best_match_idx]["name"]

# Example Input
text_array = [
    "Fish as food", "Salmon", "Dill",
    "Fish delivery in Alcamo | Order Online Now with Glovo",
    "Filet Meunière Images – Browse 514 Stock Photos, Vectors, and Video | Adobe Stock",
    "Nonveg Images – Browse 1,756 Stock Photos, Vectors, and Video | Adobe Stock",
    "Close Up of a Meat and Vegetable Plate 45689849 Stock Photo at Vecteezy",
    "A plate of salmon with a lemon and a lemon wedge | Premium AI-generated image"
]

# Get the most relevant food name
best_food_name = find_best_food_match(text_array)

