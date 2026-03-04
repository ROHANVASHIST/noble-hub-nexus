import PageLayout from "@/frontend/components/layout/PageLayout";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const TermsPage = () => (
  <PageLayout>
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground">Terms of Service</h1>
          <p className="mt-3 text-muted-foreground">Last updated: March 4, 2026</p>
        </div>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using NobelHub, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the platform.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">2. Account Responsibilities</h2>
            <p>You are responsible for maintaining the security of your account credentials. You must provide accurate information when creating an account and keep your details up to date. You may not share your account with others.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">3. Acceptable Use</h2>
            <p>You may use NobelHub for personal and academic research purposes. You must not attempt to circumvent security measures, scrape data at scale, or use the platform for any unlawful purpose.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">4. Intellectual Property</h2>
            <p>Nobel Prize data is sourced from public APIs and academic records. The NobelHub platform, its design, and original content are protected by copyright. You may not reproduce or distribute platform content without permission.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">5. Content & Data</h2>
            <p>While we strive for accuracy, NobelHub provides information "as is" and does not guarantee the completeness or accuracy of all data. For official Nobel Prize information, please refer to nobelprize.org.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">6. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time through your profile settings.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">7. Limitation of Liability</h2>
            <p>NobelHub is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform, including but not limited to data loss or service interruptions.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">8. Contact</h2>
            <p>For questions about these terms, contact us at <span className="text-primary font-semibold">legal@nobelhub.com</span>.</p>
          </section>
        </div>
      </motion.div>
    </div>
  </PageLayout>
);

export default TermsPage;
