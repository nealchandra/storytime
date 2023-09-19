import { NextRequest, NextResponse } from 'next/server';

import { guidance } from '@/lib/story-generation/generation';
import * as prompts from '@/lib/story-generation/prompts';
import { Workflow } from '@/lib/workflow';

type StorytimeState = {
  outline: string;
  story: string;
  title: string;
  subject: string;
  characters: { name: string; description: string }[];
  descriptors: string[];
  image_prompts: string[];
};

export const GET = async (req: NextRequest) => {
  const CHARACTERS = [
    {
      name: 'Neal',
      description:
        'An young indian man with a pleasant and charming demeanor and a sharp intellect',
    },
    {
      name: 'Cori',
      description:
        "Neal's dog, a golden brown toy poodle with lots of energy and an eagerness for adventure",
    },
  ];

  const SUBJECT =
    'Neal and Cori are walking through San Francisco when Cori discovers a magical portal. The two step through the portal and find adventure and tasty snacks.';

  const workflow = new Workflow<StorytimeState>(
    [
      async (s) => {
        const { story, title } = await guidance(
          `${req.nextUrl.origin}/api/py/guidance`,
          prompts.GENERATE_STORY,
          { characters: s.characters, subject: s.subject },
          ['title', 'story', 'outline']
        );

        const paragraphs = story.split('\n');
        return { ...s, story, title, paragraphs };
      },
    ],
    { characters: CHARACTERS, subject: SUBJECT }
  );

  const z = await workflow.run();
  return NextResponse.json(z, { status: 200 });
};
