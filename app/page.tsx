import HeroSection from "@/components/landing/hero-section";
import FeaturesSection from "@/components/landing/features";
import IntegrationsSection from "@/components/landing/integrations";
import ContentSection from "@/components/landing/content";
import PricingSection from "@/components/landing/pricing";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <IntegrationsSection />
      <ContentSection />
      <PricingSection />
    </div>
  );
}
