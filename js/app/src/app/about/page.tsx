import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About | Storytime!',
};

export default async function AboutPage() {
  return (
    <>
      <h1>About</h1>
      <p>
        Storytime is an experiment by Theo's Dad using generative AI to augment
        the innate but generally pretty weak storytelling capabilities of tired
        parents. Storytime gives you silly song superpowers.
      </p>
      <p>
        <Link href="/">Go home</Link>
      </p>
    </>
  );
}
