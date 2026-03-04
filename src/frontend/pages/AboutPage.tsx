import PageLayout from "@/frontend/components/layout/PageLayout";
import { motion } from "framer-motion";
import { Award, Users, Globe, BookOpen } from "lucide-react";

const AboutPage = () => (
  <PageLayout>
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Award className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground">About NobelHub</h1>
          <p className="mt-3 text-lg text-muted-foreground">The world's leading platform for Nobel Prize research and knowledge discovery.</p>
        </div>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            NobelHub is dedicated to making the rich history of the Nobel Prize accessible to researchers, students, and curious minds around the world. We aggregate data on laureates, lectures, and research papers spanning over 125 years of groundbreaking achievements.
          </p>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <Users className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold font-display text-foreground">900+</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">Laureates</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <Globe className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold font-display text-foreground">6</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">Categories</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <BookOpen className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold font-display text-foreground">125+</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">Years of History</p>
            </div>
          </div>

          <h2 className="font-display text-xl font-bold text-foreground pt-4">Our Mission</h2>
          <p>
            We believe that the stories behind Nobel Prize-winning discoveries deserve to be told and explored. Our platform provides tools for deep research, personalized feeds, and analytics to help you understand the trends and patterns behind the world's most prestigious award.
          </p>

          <h2 className="font-display text-xl font-bold text-foreground pt-4">Data Sources</h2>
          <p>
            NobelHub leverages the official Nobel Prize API and curated academic databases to provide accurate, up-to-date information. All laureate data, lecture recordings, and research papers are sourced from verified academic and institutional records.
          </p>

          <h2 className="font-display text-xl font-bold text-foreground pt-4">Contact</h2>
          <p>
            Have questions or feedback? Reach out to us at <span className="text-primary font-semibold">hello@nobelhub.com</span>. We'd love to hear from you.
          </p>
        </div>
      </motion.div>
    </div>
  </PageLayout>
);

export default AboutPage;
