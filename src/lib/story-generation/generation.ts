import { Workflow } from '@/lib/workflow';

import * as prompts from './prompts';

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
