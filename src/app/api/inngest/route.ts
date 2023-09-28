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
  { event: 'workflow.run' },
  async ({ event, step }) => {
    for (let workflowStep of StorytimeSteps) {
      await step.run('Run workflow step', async () => {
        let state: Partial<StorytimeState> | null = await kv.hgetall(
          event.data.id
        );

        if (!state) {
          throw Error('Invalid id');
        }

        state = await workflowStep(state);
        await kv.hset(event.data.id, state);
      });
    }
  }
);

export const { GET, POST, PUT } = serve(inngest, [workflowHandler]);
