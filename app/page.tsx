import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { PressSection } from '@/components/home/PressSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { StatsSection } from '@/components/home/StatsSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { RecentPostsSection } from '@/components/home/RecentPostsSection';
import { ProcessSection } from '@/components/home/ProcessSection';
import { CtaBand } from '@/components/shared/CtaBand';
import { getServices } from '@/lib/actions/services';
import { getTestimonials } from '@/lib/actions/testimonials';
import { getPressLogos } from '@/lib/actions/press';
import { getRecentPublishedPosts } from '@/lib/actions/blog';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [services, testimonials, pressLogos, recentPosts] = await Promise.all([
    getServices(),
    getTestimonials(),
    getPressLogos(),
    getRecentPublishedPosts(3),
  ]);

  return (
    <>
      <Header active="/" />
      <main>
        <HeroSection />
        <PressSection logos={pressLogos} />
        <ServicesSection services={services} />
        <StatsSection />
        <RecentPostsSection posts={recentPosts} />
        <TestimonialsSection testimonials={testimonials} />
        <ProcessSection />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
