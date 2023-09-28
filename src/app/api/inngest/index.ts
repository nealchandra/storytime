import { EventSchemas, Inngest } from 'inngest';

type Events = {
  'workflow.run': {
    data: {
      id: string;
    };
  };
};

export const inngest = new Inngest({
  name: 'Storytime',
  schemas: new EventSchemas().fromRecord<Events>(),
});
