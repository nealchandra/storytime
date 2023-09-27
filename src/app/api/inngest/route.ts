import { inngest } from '.';
import { kv } from '@vercel/kv';
import { serve } from 'inngest/next';

import {
  StorytimeState,
  StorytimeSteps,
} from '@/lib/generation/storytime-workflow';
import { Workflow } from '@/lib/workflow';

const workflowHandler = inngest.createFunction(
  { name: 'Run Workflow' },
  { event: 'workflow.start' },
  async ({ event }) => {
    const state: Partial<StorytimeState> | null = await kv.hgetall(
      event.data.id
    );

    if (!state) {
      throw Error('Invalid id');
    }

    const save = (state: Partial<StorytimeState>) => {
      kv.hset(event.data.id, state);
    };

    const workflow = new Workflow<StorytimeState>(StorytimeSteps, state, save);
    await workflow.run();
  }
);

export const { GET, POST, PUT } = serve(inngest, [workflowHandler]);
