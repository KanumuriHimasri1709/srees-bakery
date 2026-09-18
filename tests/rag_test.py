"""
Automated unit tests for Sree's Home Bakery RAG retrieval and pipeline.
"""
import sys
from pathlib import Path

# Force UTF-8 stdout for Windows consoles
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from rag.rag_pipeline import get_rag_pipeline, FALLBACK_MESSAGE, EGGLESS_MESSAGE
from rag.retriever import get_retriever

def test_delivery_context_retrieval():
    retriever = get_retriever()
    chunks = retriever.retrieve("Do you deliver and how are charges handled?", top_k=3)
    assert len(chunks) > 0, "Should retrieve delivery chunks"
    combined_text = " ".join(c["text"] for c in chunks)
    assert "Rapido" in combined_text, "Delivery context must mention Rapido"
    assert "paid by the customer" in combined_text.lower(), "Delivery charges must specify customer payment"

def test_scoped_millet_cookie_claim():
    pipeline = get_rag_pipeline()
    response = pipeline.query("Do you have no sugar and no maida cookies?")
    assert response["grounded"] is True
    assert "Only Millet Cookies" in response["answer"], "Claim must be scoped strictly to Millet Cookies"
    assert "other products" in response["answer"].lower(), "Must warn against generalizing the claim"

def test_unsupported_question_fallback():
    pipeline = get_rag_pipeline()
    response = pipeline.query("What are the calories and shelf life of your cakes?")
    assert response["answer"] == FALLBACK_MESSAGE, "Unsupported query must return exact fallback"
    assert response["grounded"] is False
    assert "7981468535" in response["answer"], "Fallback must provide bakery phone number"

def test_cake_flavours_and_pricing():
    pipeline = get_rag_pipeline()
    response = pipeline.query("What cakes do you have?")
    assert response["grounded"] is True
    assert "Vanilla" in response["answer"]
    assert "₹300" in response["answer"]

def test_eggless_rule():
    pipeline = get_rag_pipeline()
    response = pipeline.query("What eggless flavours are available?")
    assert response["grounded"] is True
    assert "Eggless cake options are available" in response["answer"]
    assert "does not specify which individual flavours" in response["answer"]

def test_unknown_product_pricing():
    pipeline = get_rag_pipeline()
    response = pipeline.query("What is the price of a pepperoni pizza?")
    assert response["answer"] == FALLBACK_MESSAGE or response["grounded"] is False

if __name__ == "__main__":
    test_delivery_context_retrieval()
    print("[PASS] test_delivery_context_retrieval")
    test_scoped_millet_cookie_claim()
    print("[PASS] test_scoped_millet_cookie_claim")
    test_unsupported_question_fallback()
    print("[PASS] test_unsupported_question_fallback")
    test_cake_flavours_and_pricing()
    print("[PASS] test_cake_flavours_and_pricing")
    test_eggless_rule()
    print("[PASS] test_eggless_rule")
    test_unknown_product_pricing()
    print("[PASS] test_unknown_product_pricing")
    print("\nAll RAG unit tests PASSED successfully!")
