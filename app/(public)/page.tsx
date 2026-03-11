import { Hero } from "./_sections/hero";
import { DomainsCarousel } from "./_sections/domains-carousel";
import { HowItWorks } from "./_sections/how-it-works";
import { PractitionersGrid } from "./_sections/practitioners-grid";
import { PackagesTeaser } from "./_sections/packages-teaser";
import { HelpBanner } from "./_sections/help-banner";
import { Testimonials } from "./_sections/testimonials";
import { ArticlesTeaser } from "./_sections/articles-teaser";
import { Faq } from "./_sections/faq";
import { Newsletter } from "./_sections/newsletter";

export default function HomePage() {
  return (
    <>
      {/* Section 6.2 — Hero */}
      <Hero />

      {/* Section 6.3 — Treatment Domains Carousel */}
      <DomainsCarousel />

      {/* Section 6.4 — How It Works */}
      <HowItWorks />

      {/* Section 6.5 — Featured Practitioners */}
      <PractitionersGrid />

      {/* Section 6.6 — Treatment Packages Teaser */}
      <PackagesTeaser />

      {/* Section 6.7 — Help Banner */}
      <HelpBanner />

      {/* Section 6.8 — Testimonials */}
      <Testimonials />

      {/* Section 6.9 — Articles Teaser */}
      <ArticlesTeaser />

      {/* Section 6.10 — FAQ */}
      <Faq />

      {/* Section 6.11 — Newsletter */}
      <Newsletter />
    </>
  );
}
