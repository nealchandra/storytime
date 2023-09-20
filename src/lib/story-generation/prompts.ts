export const GENERATE_STORY = `You are the beloved author of childrens story books. You are going to write a children's story based on some guidance I provide to you.

Please create an outline of a childrens' story consisting of around 10 plot points, each one concisely summarizing a page of the story.
The story should have an imaginative, fantasy-oriented theme.
Do not include a title.
Do not include page numbers or page headers.

Please include the following characters as main characters in the story:
CHARACTERS:
{{~#each characters}}
{{this.name}}: {{this.description}}
{{~/each}}

Please include the following subjects or events in the story:
SUBJECT DESCRIPTION: {{subject}}

OUTLINE:
{{gen 'outline'}}

Now, using the outline you provided above, fill in the details of the story.
Turn each sentence into 2-4 sentences.
Remember to make the story whimsical and fun, something a young child would find exciting to read.
Remember to include characters, subjects, and events from above where you can.
Try to make the story at least 5-10 paragraphs (longer is okay).

STORY:
{{gen 'story' max_tokens=2000}}

TITLE: {{gen 'title'}}
`;

export const CHARACTER_BIOS = `Your task is to read a story, and extract a list of characters from it. Some of these characters are known to us, so we will provide a short description of the character.

If a character is known, you should simply include the provided description. If the character was not provided, you should make up a short description/backstory (1 - 3 sentences). You can be imaginative as long as you don't contradict information from the story. Only include named characters.

Return the character descriptions in an unordered list format, with each list item following the pattern NAME: DESCRIPTION. Do not include anything else in your response.

KNOWN CHARACTERS:
{{~#each characters}}
{{ this.name }}: {{ this.description}}
{{~/each}}

STORY:
{{ story }}

ALL CHARACTERS:
{{#geneach 'full_characters' }}
{{ gen 'this.name' stop=':' }}:{{ gen 'this.description' stop='\n'}}
{{~/geneach}}
`;

export const CHARACTER_DESCRIPTORS = `Your task is to generate visual tags for a given character desciption. These characters tags will be fed into an AI image generator. Because this will be used to generate images, we just care about the characters visual appearance, not their personality or mindset.

You will be provided a list of characters, with a written description about the character. You should use this information to generate a set of visually descriptive tags. You should make up SPECIFIC visual details to make each character more unique. 

You should provide somewhere between 4-12 tags for each character, focusing ONLY on their physical description. Make sure the tags are specific and would identify a unique character. NEVER include proper nouns in the tags. NEVER include tags that describe anything other than the character's appearance.

Tags should be comma separated in a single sentence and all lowercase.

Example:

NAME: Alfredo
DECSCRIPTION: A charming and curious boy with curly hair. Eager for adventure and excitement
TAGS: young boy, 6 years old, glistening blue eyes, curly brown hair, freckles

Characters:

{{#geneach 'enriched_characters' num_iterations=len(characters)}}
{{ set 'this.name' characters[@index].name }}
{{ set 'this.description' characters[@index].description }}
NAME: {{characters[@index].name}}
DESCRIPTION: {{characters[@index].description}}
TAGS: {{gen 'this.tags' }}
{{/geneach}}
`;

export const GENERATE_IMAGE_PROMPT = `Your task is to generate a prompt for an image generation AI given the following characters:

CHARACTERS:

{{#each characters}}
{{ this.name }}: {{ this.tags }}
{{~/each}}

You will be given a list of characters and a short set of tags for each of then. We will then work through the story. For each paragraph, we want to try to generate an image prompt. If the paragraph doesn't reference events that can easily be made into an illustration, then simply return "SKIP". Otherwise, return a short and descriptive image prompt relevant to the paragraph content.

You should never refer to a character by name or include any proper nouns. Instead, use the provided character tags to _describe_ the character's appearance, focus especially on visually distinctive characteristics.

A good image prompt does not to be gramatically coherent or contain prepositions, just a short series of brief visual descriptions, comma separataed as needed but still returned in a single sentence. It should be VERY concise and it NEVER contains any proper nouns. 

STORY:

{{#geneach 'enriched_paragraphs' num_iterations=len(paragraphs)}}
{{ set 'this.content' paragraphs[@index]}}
{{ paragraphs[@index] }}
Image Prompt: {{gen 'this.prompt' max_tokens=200 stop='\n'}}

{{/geneach}}`;
