from abc import abstractmethod
from dataclasses import dataclass, field
from typing import Dict, List, Optional

import guidance

guidance.llm = guidance.llms.OpenAI("gpt-3.5-turbo")

#### Workflow Framework

"""
This is a very basic implementation of a "workflow". It's just a linear series of steps that run in order, without 
any parallelization or tracking of dependencies.

I'd like to find/write a simple lib to model and run workflows as more of a directed graph structure, but that's not
really required atm.
"""


@dataclass
class WorkflowState:
    state: Dict[str, any] = field(default_factory=dict)


class WorkflowStep:
    @abstractmethod
    def __init__(self, id, *args, **kwargs):
        pass

    @abstractmethod
    def execute(self, state: WorkflowState) -> None:
        pass


class Workflow:
    state: WorkflowState = WorkflowState()
    steps: List[WorkflowStep]

    def __init__(
        self, steps: List[WorkflowStep], initial_state: Optional[WorkflowState] = None
    ):
        if initial_state:
            self.state = initial_state
        self.steps = steps

    def run(self):
        for step in self.steps:
            step.execute(self.state)
        return self.state.state


#### Generic Workflow Steps


class GuidanceLLMStep(WorkflowStep):
    def __init__(self, output_key: str, prompt_template: str):
        self.output_key = output_key
        self.prompt_template = prompt_template

    def execute(self, state: WorkflowState):
        fn = guidance(self.prompt_template)
        output = fn(**state.state)

        state.state[self.output_key] = output[self.output_key]


# runs guidance on a _list_ of inputs, returning a _list_ of their outputs (i.e. many calls to the LLM)
class GuidanceLLMListStep(WorkflowStep):
    def __init__(
        self, input_key: str, elem_name: str, output_key: str, prompt_template: str
    ):
        self.input_key = input_key
        self.elem_name = elem_name
        self.output_key = output_key
        self.prompt_template = prompt_template

    def execute(self, state: WorkflowState):
        result = []
        inputs = state.state[self.input_key]

        for input in inputs:
            fn = guidance(self.prompt_template)
            args = {**state.state}
            args[self.elem_name] = input
            output = fn(**args)
            result.append(output[self.output_key])

        state.state[self.output_key] = result


class ReplicateImageGeneratorStep(WorkflowStep):
    def __init__(
        self, input_key: str, output_key: str, prompt_suffix: Optional[str] = None
    ):
        self.input_key = input_key
        self.output_key = output_key
        self.prompt_suffix = prompt_suffix

    def execute(self, state):
        import replicate

        input = state.state[self.input_key]
        prompts = input if isinstance(input, list) else [input]

        result = []

        for prompt in prompts:
            # bit of a hack, this is not very generalized...
            if prompt == "SKIP":
                result.append(None)
                continue

            res = replicate.run(
                "stability-ai/sdxl:2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2",
                input={
                    "prompt": f"{prompt}{self.prompt_suffix if self.prompt_suffix else ''}"
                },
            )
            result.append(res)

        state.state[self.output_key] = result


#### Storytime Steps
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
