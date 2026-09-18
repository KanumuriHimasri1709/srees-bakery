"""
Chat API route connecting to Sree's RAG Assistant.
"""
from fastapi import APIRouter
from backend.app.models.schemas import ChatRequest, ChatResponse
from backend.app.services.rag_service import process_chat_query

router = APIRouter(prefix="/api/chat", tags=["Chatbot & RAG"])

@router.post("", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    result = process_chat_query(request.message)
    return ChatResponse(
        answer=result.get("answer", ""),
        grounded=result.get("grounded", False),
        sources=result.get("sources", [])
    )
