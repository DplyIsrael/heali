import { Hero } from "./_sections/hero";
import { DomainsCarousel } from "./_sections/domains-carousel";
import { PractitionersGrid } from "./_sections/practitioners-grid";
import { PackagesTeaser } from "./_sections/packages-teaser";
import { HelpBanner } from "./_sections/help-banner";
import { Testimonials } from "./_sections/testimonials";
import { Faq } from "./_sections/faq";
import { Newsletter } from "./_sections/newsletter";

export default function HomePage() {
  return (
    <>
      {/* Section 6.2 — Hero */}
      <Hero />

      {/* Section 6.3 — Treatment Domains Carousel */}
      <DomainsCarousel />

      {/* Section 6.4 — Practitioners Grid */}
      <PractitionersGrid />

      {/* Section 6.5 — Treatment Packages Teaser */}
      <PackagesTeaser />

      {/* Section 6.6 — Help Banner */}
      <HelpBanner />

      {/* Section 6.7 — Testimonials */}
      <Testimonials />

      {/* Section 6.8 — FAQ */}
      <Faq />

      {/* Section 6.9 — Newsletter */}
      <Newsletter />
    </>
  );
}
