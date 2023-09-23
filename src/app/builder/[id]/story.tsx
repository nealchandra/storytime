'use client';

import * as React from 'react';

import Image from 'next/image';

import { StoryPayload, getStory } from '@/actions/stories';
import { Skeleton } from '@/components/ui/skeleton';

export const Story: React.FC<{ story: StoryPayload }> = ({ story }) => {
  const [storyState, setStoryState] = React.useState<StoryPayload['state']>(
    story.state
  );
  const [isRunning, setIsRunning] = React.useState<boolean>(
    story.workflow.status !== 'completed'
  );
  const { state } = story;

  React.useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(async () => {
      const story = await getStory(state.id);
      setStoryState(story!.state);

      if (story!.workflow.status == 'completed') {
        setIsRunning(false);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isRunning, state.id]);

  if (isRunning) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-[500px]" />
        <Skeleton className="h-4 w-[400px]" />
        <Skeleton className="h-4 w-[500px]" />
        <Skeleton className="h-4 w-[400px]" />
        <Skeleton className="h-4 w-[500px]" />
        <Skeleton className="h-4 w-[400px]" />
        <Skeleton className="h-4 w-[500px]" />
        <Skeleton className="h-4 w-[400px]" />
      </div>
    );
  }

  console.log(story);

  return (
    <>
      {state.paragraphs.map((p, idx) => (
        <div key={idx} className="grid grid-cols-2">
          <p className="text-3xl">{p.content}</p>
          {p.image && p.image.length > 0 ? (
            <Image
              alt={p.prompt || ''}
              className="rounded-lg"
              src={p.image[0]}
            />
          ) : null}
        </div>
      ))}
    </>
  );
};
