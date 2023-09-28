'use server';

import { kv } from '@vercel/kv';
import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

import { inngest } from '@/app/api/inngest';
import { StorytimeState } from '@/lib/generation/storytime-workflow';

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
  const id = uuidv4();

  await kv.hset(id, {
    id,
    characters: payload.characters,
    subject: payload.subject,
  });

  await inngest.send({
    name: 'workflow.run',
    data: {
      id,
    },
  });

  redirect(`/${id}`);
};
