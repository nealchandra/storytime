import { headers } from 'next/headers';

import * as prompts from '@/lib/generation/prompts';
import { guidance, replicate } from '@/lib/generation/services';
import { WorkflowStep } from '@/lib/workflow';

export type StorytimeState = {
  id: string;
  story: string;
  title: string;
  subject: string;
  characters: { name: string; description: string; tags?: string }[];
  descriptors: string[];
  paragraphs: { content: string; prompt?: string; image?: string[] | null }[];
};

// NOTE: This hides away an annoying impl detail. We need to know the
// hostname of the server in order to make a request to ourselves for guidance.
//
// We can get this from the request headers (set via middleware.ts) but only in the
// server context.
const getOrigin = async () => {
  'use server';
  return headers().get('x-origin');
};

export const StorytimeSteps: WorkflowStep<StorytimeState>[] = [
  async (s) => {
    const { story, title } = await guidance(
      `${await getOrigin()}/api/py/guidance`,
      prompts.GENERATE_STORY,
      { characters: s.characters, subject: s.subject },
      ['title', 'story', 'outline']
    );

    const paragraphs = story.split('\n').filter((p: string) => p !== '');
    return { ...s, story, title, paragraphs };
  },
  async (s) => {
    const { full_characters } = await guidance(
      `${await getOrigin()}/api/py/guidance`,
      prompts.CHARACTER_BIOS,
      { characters: s.characters, story: s.story },
      ['full_characters']
    );

    return { ...s, characters: full_characters };
  },
  async (s) => {
    const { enriched_characters } = await guidance(
      `${await getOrigin()}/api/py/guidance`,
      prompts.CHARACTER_DESCRIPTORS,
      { characters: s.characters },
      ['enriched_characters']
    );

    return { ...s, characters: enriched_characters };
  },
  async (s) => {
    const { enriched_paragraphs } = await guidance(
      `${await getOrigin()}/api/py/guidance`,
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
];
