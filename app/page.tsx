import HeroSection from "@/components/landing/hero-section";
import FeaturesSection from "@/components/landing/features";
import IntegrationsSection from "@/components/landing/integrations";
import ContentSection from "@/components/landing/content";
import PricingSection from "@/components/landing/pricing";
import FAQsSection from "@/components/landing/faqs";
import CallToActionSection from "@/components/landing/call-to-action";
import FooterSection from "@/components/landing/footer";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await currentUser();
  if (user) {
    redirect("/dashboard");
  }

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
