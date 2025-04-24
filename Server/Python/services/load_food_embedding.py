import pandas as pd
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer
# Load data and models
df_recipes = pd.read_csv("./Dataset/Food/RAW_recipes.csv")
model = SentenceTransformer("all-MiniLM-L6-v2")

# Load saved embeddings and food names
food_embeddings = np.load("./models/food_embeddings.npy")
with open("./models/food_names.pkl", "rb") as f:
    food_names = pickle.load(f)

print("Embeddings loaded successfully!")