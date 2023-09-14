import { Metadata } from 'next';

import { RenderStoryView } from './view-story';

export const metadata: Metadata = {
  title: 'Storytime!',
};

export default async function StoryPage({
  params,
}: {
  params: { id: string };
}) {
  return <RenderStoryView storyId={params.id} />;
}
