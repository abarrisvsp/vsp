import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { getServices } from '@/lib/actions/services';

export default async function HomePage() {
  const services = await getServices();
  return (
    <>
      <Header active="/" />
      <main>
        <HeroSection />
        <ServicesSection services={services} />
      </main>
      <Footer />
    </>
  );
}
