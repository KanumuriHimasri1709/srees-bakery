"""
Complete end-to-end RAG Pipeline for Sree's Home Bakery:
Verified Bakery Data -> Chunking & Embeddings -> Vector Store -> FAISS/Retriever -> Grounding & Synthesis via Groq / Local.
"""
import os
import re
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from rag.prompts import SYSTEM_PROMPT, FALLBACK_MESSAGE, EGGLESS_MESSAGE, format_rag_prompt
from rag.retriever import get_retriever

def deterministic_answer(query: str) -> Optional[str]:
    """
    High-precision fast-path answers for common bakery questions,
    matching verified business parameters.
    """
    q = query.lower()

    # Unsupported domains/topics that must strictly trigger fallback refusal
    unsupported_patterns = [
        r"\b(calorie|calories|nutrition|nutritional|macro|macros)\b",
        r"\b(shelf life|expiry date|shelf-life|how long does it last|preservative)\b",
        r"\b(gluten free|gluten-free|vegan|keto|diabetic|halal|kosher)\b",
        r"\b(recipe|how do you bake|how to make)\b",
        r"\b(delivery areas|which areas do you deliver|pin code|pincode)\b",
        r"\b(pizza|burger|sandwich|pasta|sushi|biryani)\b",
    ]
    for pat in unsupported_patterns:
        if re.search(pat, q):
            return FALLBACK_MESSAGE

    # Eggless rule (Strict compliance with user instructions)
    if "eggless" in q:
        return EGGLESS_MESSAGE

    # Cakes & prices
    if re.search(r"\b(what cakes|which cakes|cake flavours|cake flavors|cake menu|list of cakes)\b", q):
        return (
            "Sree’s Home Bakery offers the following cakes:\n"
            "• Vanilla: ½ kg ₹300 · 1 kg ₹550\n"
            "• Pineapple: ½ kg ₹350 · 1 kg ₹600\n"
            "• Strawberry: ½ kg ₹350 · 1 kg ₹600\n"
            "• Butterscotch: ½ kg ₹400 · 1 kg ₹700\n"
            "• Blueberry: ½ kg ₹400 · 1 kg ₹700\n"
            "• Chocolate: ½ kg ₹400 · 1 kg ₹750\n"
            "• Rasmalai: ½ kg ₹350 · 1 kg ₹600\n"
            "• Black Forest: ½ kg ₹400 · 1 kg ₹800\n"
            "• Red Velvet: ½ kg ₹400 · 1 kg ₹800\n"
            "• Tender Coconut: ½ kg ₹700 · 1 kg ₹1300\n"
            "Egg and eggless options are available. Cake orders should be placed 1 day before."
        )

    # Specific cake price checks
    if "chocolate cake" in q or ("price" in q and "chocolate" in q and "cake" in q):
        return "Chocolate Cake is priced at ½ kg ₹400 and 1 kg ₹750 at Sree’s Home Bakery."

    if "vanilla" in q and ("price" in q or "cost" in q):
        return "Vanilla Cake is priced at ½ kg ₹300 and 1 kg ₹550."

    if "black forest" in q and ("price" in q or "cost" in q):
        return "Black Forest Cake is priced at ½ kg ₹400 and 1 kg ₹800."

    if "red velvet" in q and ("price" in q or "cost" in q) and "cookie" not in q:
        return "Red Velvet Cake is priced at ½ kg ₹400 and 1 kg ₹800."

    if "tender coconut" in q and ("price" in q or "cost" in q):
        return "Tender Coconut Cake is priced at ½ kg ₹700 and 1 kg ₹1300."

    # Operating hours / timings
    if re.search(r"\b(time|timing|timings|open|opening|close|closing|hours)\b", q):
        return "Sree’s Home Bakery operating hours are 9:00 AM – 9:00 PM daily."

    # Phone / contact / location
    if re.search(r"\b(location|address|where are you|where located|where is the bakery)\b", q):
        return (
            "Sree’s Home Bakery is located at:\n"
            "Mega Residency 64-1h-5e/ff4, Janaki Ram Nagar, Treasury Colony, Pratap Nagar, Kakinada – 533004.\n"
            "Phone: 7981468535 / 8801121818."
        )

    if re.search(r"\b(phone|contact|call|number|reach|telephone|mobile)\b", q):
        return "You can reach Sree’s Home Bakery at 7981468535 or 8801121818."

    # Delivery & Rapido
    if re.search(r"\b(deliver|delivery|rapido|ship|shipping)\b", q):
        return "Home delivery is available through Rapido. Delivery charges are paid by the customer."

    # Payment
    if re.search(r"\b(payment|pay|phonepe|upi|gpay|cash|card)\b", q):
        return "Payment is accepted via PhonePe."

    # Offers / Instagram discount
    if re.search(r"\b(offer|discount|deal|first order|10%|instagram)\b", q):
        return "First-order offer: Follow the bakery Instagram page and share it to receive 10% OFF on your first order."

    # Customization & Lead time
    if re.search(r"\b(custom|customiz|theme cake|brownie cake|upload|cake design|photo cake|reference photo)\b", q):
        return (
            "Yes, customized cakes, theme cakes, customized chocolates, and brownie cake customization are available! "
            "You can upload your reference cake photo directly on our Custom Cakes page. "
            "Please place cake orders 1 day before."
        )

    # Scoped dietary claim (Millet cookies only)
    if "sugar" in q or "maida" in q or "millet" in q:
        return (
            "Only Millet Cookies are explicitly confirmed as having no sugar and no maida. "
            "This dietary claim applies exclusively to Millet Cookies and not to other products."
        )

    return None

class RAGPipeline:
    def __init__(self):
        self.retriever = get_retriever()

    def query(self, user_message: str) -> Dict[str, Any]:
        user_message = user_message.strip()
        if not user_message:
            return {"answer": FALLBACK_MESSAGE, "grounded": False, "sources": []}

        # Step 1: Check deterministic fast-path for exact verification
        fast_answer = deterministic_answer(user_message)
        if fast_answer:
            if fast_answer == FALLBACK_MESSAGE:
                return {
                    "answer": FALLBACK_MESSAGE,
                    "grounded": False,
                    "sources": []
                }
            return {
                "answer": fast_answer,
                "grounded": True,
                "sources": ["verified-bakery-data"],
                "fast_path": True
            }

        # Step 2: Vector retrieval from vector store
        chunks = self.retriever.retrieve(user_message, top_k=3, threshold=0.10)

        # Step 3: If no context retrieved, strictly return fallback (anti-hallucination)
        if not chunks:
            return {
                "answer": FALLBACK_MESSAGE,
                "grounded": False,
                "sources": []
            }

        context_texts = [c["text"] for c in chunks]
        sources = list(set(c["source"] for c in chunks))

        # Step 4: Subject verification: ensure query entities exist in verified context
        common_query_words = {
            "what", "which", "where", "when", "tell", "show", "give", "price", "prices",
            "cost", "costs", "rate", "rates", "menu", "have", "does", "much", "many",
            "available", "order", "want", "like", "please", "with", "from", "good", "best",
            "some", "about", "your", "item", "items", "food", "product", "products"
        }
        query_words = [
            w for w in re.sub(r"[^a-zA-Z0-9]+", " ", user_message.lower()).split()
            if len(w) > 3 and w not in common_query_words
        ]
        all_context_lower = " ".join(context_texts).lower()
        unmatched_specifics = [w for w in query_words if w not in all_context_lower]
        if unmatched_specifics and len(unmatched_specifics) >= max(1, len(query_words) // 2):
            return {
                "answer": FALLBACK_MESSAGE,
                "grounded": False,
                "sources": []
            }

        # Step 5: Try Groq LLM grounded synthesis
        groq_answer = self._call_groq(user_message, context_texts)
        if groq_answer:
            return {
                "answer": groq_answer,
                "grounded": True,
                "sources": sources,
                "engine": "groq"
            }

        # Step 6: Fall back to local clean grounded synthesis
        top_chunk = chunks[0]["text"]
        synthesized = self._clean_chunk_response(user_message, top_chunk)
        return {
            "answer": synthesized,
            "grounded": True,
            "sources": sources,
            "engine": "local-grounded"
        }

    def _call_groq(self, query: str, context_texts: List[str]) -> Optional[str]:
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            return None

        try:
            from groq import Groq
            client = Groq(api_key=groq_api_key)
            prompt = format_rag_prompt(query, context_texts)

            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=500
            )
            ans = completion.choices[0].message.content.strip()
            return ans if ans else None
        except Exception:
            return None

    def _clean_chunk_response(self, query: str, top_chunk: str) -> str:
        """Format verified chunk cleanly for customer presentation."""
        lines = [line.strip() for line in top_chunk.split("\n") if line.strip() and not line.startswith("===")]
        return "\n".join(lines)

_pipeline_instance = None

def get_rag_pipeline() -> RAGPipeline:
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = RAGPipeline()
    return _pipeline_instance
