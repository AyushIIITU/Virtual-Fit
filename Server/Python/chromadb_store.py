import chromadb
from chromadb.config import Settings
import uuid
from datetime import datetime

class ChromaDBStore:
    def __init__(self, collection_name: str = "chat_history"):
        """
        Initialize ChromaDB client and collection.
        """
        self.client = chromadb.PersistentClient(path="./chroma_db", settings=Settings())
        self.collection = self.client.get_or_create_collection(name=collection_name)

    def store_message(self, session_id: str, user_id: str, message: str, response: str):
        """
        Store a user message and bot response in ChromaDB.
        """
        try:
            message_id = str(uuid.uuid4())
            timestamp = datetime.utcnow().isoformat()
            self.collection.add(
                documents=[f"User: {message}\nBot: {response}"],
                metadatas=[{
                    "session_id": session_id,
                    "user_id": user_id,
                    "timestamp": timestamp
                }],
                ids=[message_id]
            )
            return True
        except Exception as e:
            print(f"Error storing message: {str(e)}")
            return False

    def get_session_history(self, session_id: str, limit: int = 5) -> list:
        """
        Retrieve recent conversation history for a session.
        """
        try:
            results = self.collection.query(
                query_texts=[""],  # Empty query to get all documents
                where={"session_id": session_id},
                n_results=limit
            )
            history = [doc for doc in results["documents"][0]]
            return history
        except Exception as e:
            print(f"Error retrieving session history: {str(e)}")
            return []