import { Metadata } from 'next';

import { Shell } from '@/components/shell';

import { StoryForm } from './story-form';

export const metadata: Metadata = {
  title: 'Storytime!',
};

export default async function BuilderPage() {
  return (
    <Shell>
      <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
        Build your story
      </h1>
      <div className="h-full flex-col md:flex">
        <div className="grid gap-12">
          <StoryForm />
        </div>
      </div>
    </Shell>
  );
}
