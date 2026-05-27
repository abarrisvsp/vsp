import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';

export default async function HomePage() {
  return (
    <>
      <Header active="/" />
      <main>
        <HeroSection />
      </main>
      <Footer />
    </>
  );
}
