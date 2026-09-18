"""
RAG Service that delegates questions to the rag pipeline.
"""
from typing import Dict, Any
from rag.rag_pipeline import get_rag_pipeline

def process_chat_query(message: str) -> Dict[str, Any]:
    pipeline = get_rag_pipeline()
    return pipeline.query(message)
