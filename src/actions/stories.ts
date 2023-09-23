'use server';

import { kv } from '@vercel/kv';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

import { guidance, replicate } from '@/lib/story-generation/generation';
import * as prompts from '@/lib/story-generation/prompts';
import { Workflow } from '@/lib/workflow';

type StorytimeState = {
  id: string;
  story: string;
  title: string;
  subject: string;
  characters: { name: string; description: string; tags?: string }[];
  descriptors: string[];
  paragraphs: { content: string; prompt?: string; image?: string[] | null }[];
};

type Payload = {
  characters: { name: string; description: string }[];
  subject: string;
};

export type StoryPayload = {
  workflow: {
    status: 'completed' | 'running';
  };
  state: StorytimeState;
};

export const getStory = async (id: string): Promise<StoryPayload | null> => {
  const state: StorytimeState | null = await kv.hgetall(id);

  if (!state) {
    return null;
  }

  // FIXME: maybe this should be in the actual state or formalized in some way.
  const completed =
    (state.paragraphs ?? []).filter((p) => !!p.image).length > 0;
  return {
    state,
    workflow: {
      status: completed ? 'completed' : 'running',
    },
  };
};

export const createStory = async (payload: Payload) => {
  const origin = headers().get('x-origin');
  const id = uuidv4();

  const save = (state: Partial<StorytimeState>) => {
    kv.hset(id, state);
  };

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
    { id, characters: payload.characters, subject: payload.subject },
    save
  );

  // this will save the initial state
  await workflow.init();

  // kick off the workflow
  workflow.run();

  redirect(`/builder/${id}`);
};
