import { Metadata } from 'next';

import { CreateStoryPage } from './create-story';

export const metadata: Metadata = {
  title: 'Storytime!',
};

export default async function IndexPage() {
  return <CreateStoryPage />;
}
