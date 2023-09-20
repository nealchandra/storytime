import Replicate from 'replicate';

import { Workflow } from '@/lib/workflow';

import * as prompts from './prompts';

const replicate_client = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export const guidance = async (
  api_url: string,
  prompt_template: typeof prompts[keyof typeof prompts],
  inputs: Object,
  outputs: string[]
) => {
  const resp = await fetch(api_url, {
    method: 'POST',
    body: JSON.stringify({
      inputs,
      outputs,
      prompt_template,
    }),
    headers: {
      'content-type': 'application/json',
    },
  });

  return resp.json();
};

export const replicate = async (prompt: string) => {
  return await replicate_client.run(
    'stability-ai/sdxl:8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f',
    {
      input: {
        prompt: `${prompt}, children's book style, disney, cinematic`,
      },
    }
  );
};
