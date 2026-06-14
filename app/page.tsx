import HeroSection from "@/components/landing/hero-section";
import FeaturesSection from "@/components/landing/features";
import IntegrationsSection from "@/components/landing/integrations";
import ContentSection from "@/components/landing/content";
import PricingSection from "@/components/landing/pricing";
import FAQsSection from "@/components/landing/faqs";
import CallToActionSection from "@/components/landing/call-to-action";
import FooterSection from "@/components/landing/footer";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <IntegrationsSection />
      <ContentSection />
      <PricingSection />
      <FAQsSection />
      <CallToActionSection />
      <FooterSection />
    </div>
  );
}
