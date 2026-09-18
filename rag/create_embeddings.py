"""
Script to prepare documents, chunk them, generate embeddings,
and store the vector index in vector_store/.
"""
import os
import sys
import json
import re
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from rag.embeddings.embedder import TextEmbedder

DOCUMENTS_DIR = Path(__file__).resolve().parent / "documents"
VECTOR_STORE_DIR = Path(__file__).resolve().parent.parent / "vector_store"
INDEX_FILE = VECTOR_STORE_DIR / "index.json"

def chunk_text(text: str, source_name: str) -> list[dict]:
    """
    Split document text into clean, coherent chunks by headings/paragraphs.
    """
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    chunks = []
    current_block = []
    
    for line in lines:
        # Check if line looks like a major section boundary
        if line.startswith("---") or line.startswith("==="):
            if current_block:
                chunk_str = "\n".join(current_block)
                if len(chunk_str) > 20:
                    chunks.append(chunk_str)
                current_block = []
            continue
            
        current_block.append(line)
        # If block gets large enough, flush it
        if len("\n".join(current_block)) > 250:
            chunks.append("\n".join(current_block))
            current_block = []

    if current_block:
        chunk_str = "\n".join(current_block)
        if len(chunk_str) > 20:
            chunks.append(chunk_str)

    chunk_objects = []
    for idx, c_text in enumerate(chunks):
        chunk_objects.append({
            "id": f"{Path(source_name).stem}-{idx + 1}",
            "source": source_name,
            "text": c_text
        })
    return chunk_objects

def build_vector_store():
    VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
    all_chunks = []
    
    print(f"[RAG] Reading verified documents from {DOCUMENTS_DIR}...")
    for doc_path in sorted(DOCUMENTS_DIR.glob("*.txt")):
        with open(doc_path, "r", encoding="utf-8") as f:
            content = f.read()
        doc_chunks = chunk_text(content, doc_path.name)
        all_chunks.extend(doc_chunks)
        print(f"  Loaded {len(doc_chunks)} chunks from {doc_path.name}")

    embedder = TextEmbedder()
    chunk_texts = [c["text"] for c in all_chunks]
    embedder.fit(chunk_texts)

    print(f"[RAG] Generating embeddings for {len(all_chunks)} chunks...")
    for c in all_chunks:
        c["vector"] = embedder.embed_text(c["text"])

    store_data = {
        "vocabulary": embedder.vocabulary,
        "idf": embedder.idf,
        "chunks": all_chunks
    }

    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        json.dump(store_data, f, indent=2)

    print(f"[RAG] Vector store index successfully saved to {INDEX_FILE}")
    print(f"[RAG] Vocabulary size: {len(embedder.vocabulary)} terms | Chunks indexed: {len(all_chunks)}")
    return store_data

if __name__ == "__main__":
    build_vector_store()
