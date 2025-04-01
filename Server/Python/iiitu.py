import asyncio
import json
import os
from pathlib import Path

from langchain_community.document_loaders import PlaywrightURLLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate
from langchain_community.llms import Ollama
from langchain_core.runnables.graph import RunnableGraph


# Define embedding model and LLM
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
llm = Ollama(model="llama3.1:8b")

# Load URLs from a separate file (equivalent to Link.js)
with open("Link.json") as f:
    urls = json.load(f)

urls = [url for url in urls if isinstance(url, str)]
if not urls:
    raise ValueError("No valid URLs found in Link.json")

# Load documents asynchronously
def load_documents():
    loader = PlaywrightURLLoader(urls, timeout=300)
    return loader.load()

# Initialize vector store
async def initialize_vector_store():
    documents = load_documents()
    if not documents:
        raise ValueError("No documents loaded. Check URLs and network access.")
    
    print("Sample document content (first 100 chars):", documents[0].page_content[:100] if documents else "No content")
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=100, chunk_overlap=20)
    all_splits = text_splitter.split_documents(documents)
    if not all_splits:
        raise ValueError("No document splits found. Check document content and splitter settings.")
    
    vector_store = FAISS.from_documents(all_splits, embedding_model)
    index_path = Path("./faiss_index")
    vector_store.save_local(index_path)
    print("Vector store saved to disk at:", index_path)
    return vector_store

async def main():
    vector_store = await initialize_vector_store()
    loaded_vector_store = FAISS.load_local("./faiss_index", embedding_model)
    print("Vector store loaded from disk successfully.")

    human_template = """
    You are an assistant for an institute's website. 
    Use the following pieces of retrieved context to answer the question.
    If you don't know the answer, just say that you don't know.

    Question: {question}
    Context: {context}
    Answer:
    """
    prompt_template = PromptTemplate(template=human_template, input_variables=["question", "context"])

    async def retrieve(state):
        retrieved_docs = loaded_vector_store.similarity_search(state["question"], 4)
        return {"context": [doc.page_content for doc in retrieved_docs]}

    async def generate(state):
        docs_content = "\n".join(state["context"])
        messages = prompt_template.format(question=state["question"], context=docs_content)
        response = llm(messages)
        return {"answer": response}

    graph = RunnableGraph()
    graph.add_node("retrieve", retrieve)
    graph.add_node("generate", generate)
    graph.add_edge("__start__", "retrieve")
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", "__end__")
    graph.compile()

    inputs = {"question": "Give placement Statistics?"}
    result = await graph.invoke(inputs)
    print("Answer:", result["answer"])

if __name__ == "__main__":
    asyncio.run(main())
