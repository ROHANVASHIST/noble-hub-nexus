import { motion } from "framer-motion";
import { BookOpenCheck } from "lucide-react";
import PageLayout from "@/frontend/components/layout/PageLayout";
import PaperFormatEditor from "@/frontend/components/papers/PaperFormatEditor";
import { REVIEW_PAPER_FORMAT } from "@/frontend/components/papers/paperFormats";

const ReviewPaperPage = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest mb-2">
              <BookOpenCheck className="h-4 w-4" />
              Scholar OS · Paper Builder
            </div>
            <h1 className="font-display text-4xl font-bold">
              {REVIEW_PAPER_FORMAT.name}
            </h1>
            <p className="mt-2 text-muted-foreground max-w-2xl">
              {REVIEW_PAPER_FORMAT.tagline}. Fill each section, save drafts to
              your dashboard, and export a polished PDF or Word document.
            </p>
          </div>
        </motion.header>

        <PaperFormatEditor format={REVIEW_PAPER_FORMAT} />
      </div>
    </PageLayout>
  );
};

export default ReviewPaperPage;
