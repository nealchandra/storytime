import { EventSchemas, Inngest } from 'inngest';

type Events = {
  'workflow.start': {
    data: {
      id: string;
    };
  };
};

export const inngest = new Inngest({
  name: 'Storytime',
  schemas: new EventSchemas().fromRecord<Events>(),
});
