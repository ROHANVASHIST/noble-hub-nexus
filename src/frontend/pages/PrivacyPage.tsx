import PageLayout from "@/frontend/components/layout/PageLayout";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const PrivacyPage = () => (
  <PageLayout>
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground">Privacy Policy</h1>
          <p className="mt-3 text-muted-foreground">Last updated: March 4, 2026</p>
        </div>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">1. Information We Collect</h2>
            <p>When you create an account, we collect your email address and display name. We also collect usage data such as pages viewed, searches performed, and bookmarks saved to personalize your experience.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>We use your information to provide and improve the NobelHub platform, personalize your research feed, and communicate important updates about your account. We never sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">3. Data Storage & Security</h2>
            <p>Your data is stored securely with encryption at rest and in transit. We implement row-level security policies to ensure you can only access your own personal data. Authentication is handled through industry-standard protocols.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">4. Cookies & Analytics</h2>
            <p>We use essential cookies for authentication and session management. We may use anonymized analytics to understand how the platform is used and to improve our services.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">5. Third-Party Services</h2>
            <p>We integrate with the Nobel Prize API to fetch laureate data. When you search for laureates, your search query is sent to this external API. No personal information is shared with third-party services.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">6. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal data at any time through your profile settings. You may also request a copy of your data by contacting us at <span className="text-primary font-semibold">privacy@nobelhub.com</span>.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">7. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any significant changes through the platform or via email.</p>
          </section>
        </div>
      </motion.div>
    </div>
  </PageLayout>
);

export default PrivacyPage;
