import Link from "next/link";
import Layout from "../components/Layout";

const AboutPage = () => (
  <Layout title="About | Storytime!">
    <h1>About</h1>
    <p>
      Storytime is an experiment by Theo's Dad using generative AI to augment
      the innate but generally pretty weak storytelling capabilities of tired
      parents. Storytime gives you silly song superpowers.
    </p>
    <p>
      <Link href="/">Go home</Link>
    </p>
  </Layout>
);

export default AboutPage;
