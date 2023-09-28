import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getStory } from '@/actions/stories';
import { Shell } from '@/components/shell';

import { Story } from './story';

export const metadata: Metadata = {
  title: 'Storytime!',
};

export default async function StoryPage({
  params,
}: {
  params: { id: string };
}) {
  const story = await getStory(params.id);

  if (!story) {
    return notFound();
  }

  return (
    <Shell>
      <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]"></h1>
      <div className="h-full flex-col md:flex">
        <div className="grid gap-12">
          <Story story={story} />
        </div>
      </div>
    </Shell>
  );
}
