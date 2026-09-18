"""
Retriever module to fetch relevant context chunks from the vector store.
"""
import os
import sys
import json
from pathlib import Path
from typing import List, Dict, Any

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from rag.embeddings.embedder import TextEmbedder

INDEX_FILE = PROJECT_ROOT / "vector_store" / "index.json"

class VectorRetriever:
    def __init__(self, index_path: Path = INDEX_FILE):
        self.index_path = index_path
        self.embedder = TextEmbedder()
        self.chunks: List[Dict[str, Any]] = []
        self._load_store()

    def _load_store(self):
        if not self.index_path.exists():
            from rag.create_embeddings import build_vector_store
            store_data = build_vector_store()
        else:
            with open(self.index_path, "r", encoding="utf-8") as f:
                store_data = json.load(f)

        self.embedder.vocabulary = store_data.get("vocabulary", {})
        self.embedder.idf = store_data.get("idf", {})
        self.chunks = store_data.get("chunks", [])

    def retrieve(self, query: str, top_k: int = 4, threshold: float = 0.08) -> List[Dict[str, Any]]:
        """
        Compute similarity between query and all chunks in vector store.
        Returns top-k matching chunks with similarity score above threshold.
        """
        query_vec = self.embedder.embed_text(query)
        # If query has no recognized vocabulary tokens, return empty
        if not any(query_vec):
            return []

        results = []
        for chunk in self.chunks:
            chunk_vec = chunk.get("vector", [])
            sim = self.embedder.cosine_similarity(query_vec, chunk_vec)
            if sim >= threshold:
                results.append({
                    "id": chunk.get("id"),
                    "source": chunk.get("source"),
                    "text": chunk.get("text"),
                    "score": round(sim, 4)
                })

        # Rank descending by similarity score
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

# Default singleton instance
_retriever_instance = None

def get_retriever() -> VectorRetriever:
    global _retriever_instance
    if _retriever_instance is None:
        _retriever_instance = VectorRetriever()
    return _retriever_instance
