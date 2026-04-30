from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.llm_factory import get_llm_factory, LLMFactory
from app.services.translation_service import get_translation_service, TranslationService
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

router = APIRouter()

class ToolRequest(BaseModel):
    text: str
    target_language: str = "Spanish" # Default for translation
    tone: str = "professional" # Default for rephrase

class ToolResponse(BaseModel):
    result: str

@router.post("/rephrase", response_model=ToolResponse)
async def rephrase_text(
    request: ToolRequest,
    factory: LLMFactory = Depends(get_llm_factory)
):
    llm = factory.get_tooling_model()
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert editor. Rephrase the following text to be more {tone}. Return ONLY the rephrased text."),
        ("human", "{text}")
    ])
    chain = prompt | llm | StrOutputParser()
    result = await chain.ainvoke({"text": request.text, "tone": request.tone})
    return ToolResponse(result=result)

@router.post("/summarize", response_model=ToolResponse)
async def summarize_text(
    request: ToolRequest,
    factory: LLMFactory = Depends(get_llm_factory)
):
    llm = factory.get_tooling_model()
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Summarize the following text concisely. Return ONLY the summary."),
        ("human", "{text}")
    ])
    chain = prompt | llm | StrOutputParser()
    result = await chain.ainvoke({"text": request.text})
    return ToolResponse(result=result)

@router.post("/translate", response_model=ToolResponse)
async def translate_text(
    request: ToolRequest,
    service: TranslationService = Depends(get_translation_service)
):
    result = await service.translate(request.text, request.target_language)
    return ToolResponse(result=result)