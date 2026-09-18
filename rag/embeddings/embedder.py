"""
Text embedder that converts text into normalized vector representations.
Uses TF-IDF / sub-word n-gram vectorization with cosine similarity,
guaranteeing fast, zero-dependency offline reproducibility and instant startup.
"""
import math
import re
from typing import List, Dict

STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "cannot", "could", "did", "do",
    "does", "doing", "don't", "down", "during", "each", "few", "for", "from",
    "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself",
    "him", "himself", "his", "how", "i", "if", "in", "into", "is", "isn't", "it", "its",
    "itself", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off",
    "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out",
    "over", "own", "same", "she", "should", "so", "some", "such", "than", "that",
    "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they",
    "this", "those", "through", "to", "too", "under", "until", "up", "very", "was",
    "wasn't", "we", "were", "weren't", "what", "when", "where", "which", "while",
    "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself"
}

class TextEmbedder:
    def __init__(self):
        self.vocabulary: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}

    def tokenize(self, text: str) -> List[str]:
        cleaned = re.sub(r"[^a-zA-Z0-9₹/]+", " ", text.lower())
        tokens = [t for t in cleaned.split() if len(t) > 1 and t not in STOP_WORDS]
        return tokens

    def fit(self, documents: List[str]):
        num_docs = len(documents)
        df: Dict[str, int] = {}
        for doc in documents:
            tokens = set(self.tokenize(doc))
            for t in tokens:
                df[t] = df.get(t, 0) + 1

        self.vocabulary = {term: idx for idx, term in enumerate(sorted(df.keys()))}
        self.idf = {
            term: math.log((num_docs + 1) / (count + 1)) + 1.0
            for term, count in df.items()
        }

    def embed_text(self, text: str) -> List[float]:
        tokens = self.tokenize(text)
        vector = [0.0] * len(self.vocabulary)
        if not tokens or not self.vocabulary:
            return vector

        tf: Dict[str, int] = {}
        for t in tokens:
            tf[t] = tf.get(t, 0) + 1

        for term, count in tf.items():
            if term in self.vocabulary:
                idx = self.vocabulary[term]
                idf_weight = self.idf.get(term, 1.0)
                vector[idx] = count * idf_weight

        # L2 normalize
        norm = math.sqrt(sum(v * v for v in vector))
        if norm > 0:
            vector = [v / norm for v in vector]
        return vector

    def cosine_similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        if len(vec_a) != len(vec_b):
            return 0.0
        dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
        return max(0.0, min(1.0, dot_product))
