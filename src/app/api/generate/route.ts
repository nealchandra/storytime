import { NextRequest, NextResponse } from 'next/server';

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

export const GET = async (req: NextRequest) => {
  const CHARACTERS = [
    {
      name: 'Neal',
      description:
        'A young indian man with glasses, a pleasant and charming demeanor and a sharp intellect',
    },
    {
      name: 'Cori',
      description:
        'A male golden brown toy poodle with lots of energy and an eagerness for adventure',
    },
  ];

  const SUBJECT =
    "Neal and Cori are walking through San Francisco when Cori hears a whine in a dark alleyway. Despite Neal's initial caution, Cori courageously rushes to the sound. They eventually discover a white toy poodle dog who Cori helps and befriends. Afterwards, they leave the alley and go play together in the grass on a relaxing summer day";

  const workflow = new Workflow<StorytimeState>(
    [
      async (s) => {
        const { story, title } = await guidance(
          `${req.nextUrl.origin}/api/py/guidance`,
          prompts.GENERATE_STORY,
          { characters: s.characters, subject: s.subject },
          ['title', 'story', 'outline']
        );

        const paragraphs = story.split('\n').filter((p: string) => p !== '');
        return { ...s, story, title, paragraphs };
      },
      async (s) => {
        const { full_characters } = await guidance(
          `${req.nextUrl.origin}/api/py/guidance`,
          prompts.CHARACTER_BIOS,
          { characters: s.characters, story: s.story },
          ['full_characters']
        );

        return { ...s, characters: full_characters };
      },
      async (s) => {
        const { enriched_characters } = await guidance(
          `${req.nextUrl.origin}/api/py/guidance`,
          prompts.CHARACTER_DESCRIPTORS,
          { characters: s.characters },
          ['enriched_characters']
        );

        return { ...s, characters: enriched_characters };
      },
      async (s) => {
        const { enriched_paragraphs } = await guidance(
          `${req.nextUrl.origin}/api/py/guidance`,
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
    { characters: CHARACTERS, subject: SUBJECT }
  );

  const z = await workflow.run();
  return NextResponse.json(z, { status: 200 });
};
