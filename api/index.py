import pprint
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel

from .utils.prompts import (
    CHARACTER_BIOS,
    CHARACTER_DESCRIPTORS,
    GENERATE_IMAGE_PROMPT,
    OUTLINE,
    STORY,
    TITLE,
)
from .utils.workflow import (
    GuidanceLLMListStep,
    GuidanceLLMStep,
    ReplicateImageGeneratorStep,
    SplitCharactersStep,
    SplitStoryStep,
    Workflow,
    WorkflowState,
)

load_dotenv()

app = FastAPI()


class Character(BaseModel):
    name: str
    description: str


class StoryRequest(BaseModel):
    subject: str
    characters: List[Character]


@app.post("/api/py/create-story")
async def create_story(story_request: StoryRequest):
    INITIAL_STATE = WorkflowState(
        state={"characters": story_request.characters, "subject": story_request.subject}
    )

    steps = [
        GuidanceLLMStep("outline", OUTLINE),
        GuidanceLLMStep("story", OUTLINE + STORY),
        GuidanceLLMStep("title", OUTLINE + STORY + TITLE),
        GuidanceLLMStep("full_characters", CHARACTER_BIOS),
        SplitCharactersStep(),
        GuidanceLLMStep("descriptors", CHARACTER_DESCRIPTORS),
        SplitStoryStep(),
        GuidanceLLMListStep(
            "paragraphs", "paragraph", "image_prompts", GENERATE_IMAGE_PROMPT
        ),
        ReplicateImageGeneratorStep(
            "image_prompts", "images", " in the style of a children's book illustration"
        ),
    ]

    workflow = Workflow(steps, initial_state=INITIAL_STATE)
    state = workflow.run()

    pprint.pprint(state)

    return {
        "title": state["title"],
        "paragraphs": [
            {
                "content": content,
                "image": image,
            }
            for content, image in list(zip(state["paragraphs"], state["images"]))
        ],
    }
