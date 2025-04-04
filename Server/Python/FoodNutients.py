import pandas as pd
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer
df_recipes = pd.read_csv("./Dataset/Food/RAW_recipes.csv")
model = SentenceTransformer("all-MiniLM-L6-v2")
# Load saved embeddings and food names
food_embeddings = np.load("./models/food_embeddings.npy")

with open("./models/food_names.pkl", "rb") as f:
    food_names = pickle.load(f)

print("Embeddings loaded successfully!")
from sklearn.metrics.pairwise import cosine_similarity

def find_best_match(query):
    query_embedding = model.encode([query])
    similarities = cosine_similarity(query_embedding, food_embeddings)
    best_idx = np.argmax(similarities)
    return food_names[best_idx]
def get_food_details(food_name):
    """Get food details from the DataFrame."""
    food_details = df_recipes[df_recipes["name"] == food_name]
    if not food_details.empty:
        return food_details.to_dict(orient="records")[0]
    else:
        return None
def find_best_food_match(text_array):
    """Extract the most relevant food name by finding the closest match in recipe embeddings."""
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
