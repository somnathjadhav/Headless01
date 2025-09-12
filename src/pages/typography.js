import TypographyShowcase from '../components/ui/TypographyShowcase';
import Head from 'next/head';
import { useGlobalTypography } from '../hooks/useGlobalTypography';

export default function TypographyPage() {
  // Apply global typography
  useGlobalTypography();

  return (
    <>
      <Head>
        <title>Typography System | Eternitty Headless WordPress</title>
        <meta name="description" content="Dynamic typography system powered by WordPress" />
      </Head>
      
      <TypographyShowcase />
    </>
  );
}
