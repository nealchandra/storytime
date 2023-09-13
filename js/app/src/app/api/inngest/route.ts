import { EventSchemas, Inngest } from 'inngest';
import { serve } from 'inngest/next';

import { StorytimeService } from '@/app/api/stories';

type CreateStory = {
  data: {
    storyId: string;
    characters: string[];
    subjects: string[];
  };
};
type Events = {
  'stories.create': CreateStory;
};

export const inngest = new Inngest({
  name: 'Storytime',
  schemas: new EventSchemas().fromRecord<Events>(),
});

const createStoryHandler = inngest.createFunction(
  { name: 'Create Story' },
  { event: 'stories.create' },
  async ({ event }) => {
    const s = new StorytimeService();
    return s.createStory(event.data);
  }
);

export const { GET, POST, PUT } = serve(inngest, [createStoryHandler]);
