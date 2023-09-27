'use client';

import * as React from 'react';

import { range } from 'lodash';

import { StoryPayload, getStory } from '@/actions/stories';
import { Skeleton } from '@/components/ui/skeleton';

export const Story: React.FC<{ story: StoryPayload }> = ({ story }) => {
  const [state, setStoryState] = React.useState<StoryPayload['state']>(
    story.state
  );
  const [isRunning, setIsRunning] = React.useState<boolean>(
    story.workflow.status !== 'completed'
  );

  React.useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(async () => {
      const curr = await getStory(story.state.id);
      setStoryState(curr!.state);

      if (curr!.workflow.status == 'completed') {
        setIsRunning(false);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, story.state.id]);

  if (isRunning) {
    return (
      <div className="space-y-4">
        {range(5).map((idx) => (
          <React.Fragment key={idx}>
            <Skeleton className="h-4 w-[100%]" />
            <Skeleton className="h-4 w-[95%]" />
          </React.Fragment>
        ))}
      </div>
    );
  }

  console.log(state);

  return (
    <>
      <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
        {state.title}
      </h1>
      {(state.paragraphs ?? []).map((p, idx) => (
        <div key={idx} className="grid grid-cols-2 gap-10 my-10">
          <p className="text-3xl">{p.content}</p>
          {p.image && p.image.length > 0 ? (
            <img alt={p.prompt || ''} className="rounded-lg" src={p.image[0]} />
          ) : null}
        </div>
      ))}
    </>
  );
};
