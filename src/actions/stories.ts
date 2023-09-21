'use server';

import { headers } from 'next/headers';
import * as z from 'zod';

import { guidance, replicate } from '@/lib/story-generation/generation';
import * as prompts from '@/lib/story-generation/prompts';
import { Workflow } from '@/lib/workflow';

type StorytimeState = {
  story: string;
  title: string;
  subject: string;
  characters: { name: string; description: string; tags?: string }[];
  descriptors: string[];
  paragraphs: { content: string; prompt?: string; image?: Object | null }[];
};

type Payload = {
  characters: { name: string; description: string }[];
  subject: string;
};

export const createStory = async (payload: Payload) => {
  const origin = headers().get('x-origin');
  const workflow = new Workflow<StorytimeState>(
    [
      async (s) => {
        const { story, title } = await guidance(
          `${origin}/api/py/guidance`,
          prompts.GENERATE_STORY,
          { characters: s.characters, subject: s.subject },
          ['title', 'story', 'outline']
        );

        const paragraphs = story.split('\n').filter((p: string) => p !== '');
        return { ...s, story, title, paragraphs };
      },
      async (s) => {
        const { full_characters } = await guidance(
          `${origin}/api/py/guidance`,
          prompts.CHARACTER_BIOS,
          { characters: s.characters, story: s.story },
          ['full_characters']
        );

        return { ...s, characters: full_characters };
      },
      async (s) => {
        const { enriched_characters } = await guidance(
          `${origin}/api/py/guidance`,
          prompts.CHARACTER_DESCRIPTORS,
          { characters: s.characters },
          ['enriched_characters']
        );

        return { ...s, characters: enriched_characters };
      },
      async (s) => {
        const { enriched_paragraphs } = await guidance(
          `${origin}/api/py/guidance`,
          prompts.GENERATE_IMAGE_PROMPT,
          { characters: s.characters, paragraphs: s.paragraphs },
          ['enriched_paragraphs']
        );

        return { ...s, paragraphs: enriched_paragraphs };
      },
      async (s) => {
        const newState = { ...s };
        const promises = [];

        await Promise.all(
          s.paragraphs!.map(async (p, i) => {
            if (p.prompt !== 'SKIP') {
              newState.paragraphs![i].image = await replicate(p.prompt!);
            } else {
              newState.paragraphs![i].image = null;
            }

            return null;
          })
        );

        return newState;
      },
    ],
    { characters: payload.characters, subject: payload.subject }
  );

  return await workflow.run();
};
