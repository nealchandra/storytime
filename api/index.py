from typing import Dict, List

import guidance
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel

load_dotenv()

guidance.llm = guidance.llms.OpenAI("gpt-3.5-turbo-instruct")

app = FastAPI()


class GuidanceRequest(BaseModel):
    inputs: Dict[str, any]
    prompt_template: str
    outputs: List[str]

    class Config:
        arbitrary_types_allowed = True


@app.post("/api/py/guidance")
async def guidance_call(request: GuidanceRequest):
    fn = guidance(request.prompt_template)
    output = fn(**request.inputs)

    return {k: output[k] for k in request.outputs}
