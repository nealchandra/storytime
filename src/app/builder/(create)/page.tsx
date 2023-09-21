import { Metadata } from 'next';
import Link from 'next/link';

import { Shell } from '@/components/shell';

import { StoryForm } from './story-form';

export const metadata: Metadata = {
  title: 'About | Storytime!',
};

export default async function AboutPage() {
  return (
    <Shell>
      <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
        Build your story
      </h1>
      <div className="hidden h-full flex-col md:flex">
        <div className="grid gap-12 grid-cols-2">
          <StoryForm />
        </div>
      </div>
    </Shell>
  );
}
