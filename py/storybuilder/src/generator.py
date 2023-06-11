import pprint
from typing import List

from dotenv import load_dotenv
from modal import Image, Secret, Stub, web_endpoint
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
    Workflow,
    WorkflowState,
    WorkflowStep,
)

load_dotenv()

image = Image.debian_slim().pip_install_from_requirements("requirements.txt")
stub = Stub(image=image, name="storytime")


# this is an annoying workaround for the fact that guidance cannot do geneach in chat convo API due to OAI limitations
# so we have to manually parse the response. If gpt-3.5-turbo-instruct ever comes out it may be worth switching to for
# more power from guidance.
class SplitCharactersStep(WorkflowStep):
    def __init__(self):
        pass

    def execute(self, state: WorkflowState):
        characters = []

        characters_text = state.state["full_characters"]
        character_lines = list(
            filter(lambda x: x != "", characters_text.replace("\n", "").split("*"))
        )

        for line in character_lines:
            name, description = line.split(":")
            characters.append(
                {"name": name.strip(), "description": description.strip()}
            )

        state.state["full_characters"] = characters


class SplitStoryStep(WorkflowStep):
    def __init__(self):
        pass

    def execute(self, state: WorkflowState):
        state.state["paragraphs"] = list(
            filter(lambda x: x != "", state.state["story"].split("\n"))
        )


#### Handler Setup


class Character(BaseModel):
    name: str
    description: str


class StoryRequest(BaseModel):
    subject: str
    characters: List[Character]


@stub.function(secret=Secret.from_dotenv())
@web_endpoint(method="POST")
async def generate_story(story_request: StoryRequest):
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
