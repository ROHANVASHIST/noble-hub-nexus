export interface PaperSection {
  key: string;
  title: string;
  description: string;
  placeholder: string;
  minRows: number;
}

export interface PaperFormat {
  id: "research_paper" | "review_paper";
  name: string;
  tagline: string;
  sections: PaperSection[];
}

export const RESEARCH_PAPER_FORMAT: PaperFormat = {
  id: "research_paper",
  name: "Research Paper",
  tagline: "IMRaD format — original empirical study",
  sections: [
    {
      key: "title",
      title: "Title",
      description: "Concise, specific, ≤ 15 words. State the variable(s) and study type.",
      placeholder: "e.g. Effect of CRISPR-Cas9 knockout of TP53 on cell-cycle dynamics in HeLa cells",
      minRows: 2,
    },
    {
      key: "authors",
      title: "Authors & Affiliations",
      description: "Author names, ORCID iDs, institutions, and corresponding author email.",
      placeholder: "Jane Doe¹, John Smith²\n¹ Dept. of Biology, …\n* Corresponding: jane@…",
      minRows: 3,
    },
    {
      key: "abstract",
      title: "Abstract",
      description: "150–250 words. Background → Objective → Methods → Results → Conclusion.",
      placeholder: "Background: …\nObjective: …\nMethods: …\nResults: …\nConclusion: …",
      minRows: 6,
    },
    {
      key: "keywords",
      title: "Keywords",
      description: "4–8 indexable terms separated by semicolons.",
      placeholder: "CRISPR; cell cycle; tumor suppressor; HeLa; flow cytometry",
      minRows: 1,
    },
    {
      key: "introduction",
      title: "1. Introduction",
      description:
        "Funnel from broad context to specific gap. End with the hypothesis / research question and aim.",
      placeholder:
        "Context and significance…\nReview of prior work…\nKnowledge gap…\nHypothesis: …\nAims of this study: …",
      minRows: 8,
    },
    {
      key: "methods",
      title: "2. Materials & Methods",
      description:
        "Reproducible detail: study design, materials, procedures, instruments, statistical analysis, ethics & data availability.",
      placeholder:
        "2.1 Study design\n2.2 Materials & reagents\n2.3 Procedures\n2.4 Statistical analysis\n2.5 Ethics approval / data availability",
      minRows: 10,
    },
    {
      key: "results",
      title: "3. Results",
      description:
        "Report findings objectively in logical order. Reference figures/tables. No interpretation here.",
      placeholder:
        "3.1 …\nFigure 1 shows…\nTable 1 summarizes…\nThe difference was statistically significant (p = …).",
      minRows: 10,
    },
    {
      key: "discussion",
      title: "4. Discussion",
      description:
        "Interpret results, compare with prior literature, explain mechanisms, acknowledge limitations.",
      placeholder:
        "Principal findings…\nComparison with previous studies…\nProposed mechanism…\nLimitations…\nFuture work…",
      minRows: 10,
    },
    {
      key: "conclusion",
      title: "5. Conclusion",
      description: "1–2 paragraphs restating key findings and their significance.",
      placeholder: "This study demonstrates that…",
      minRows: 4,
    },
    {
      key: "acknowledgements",
      title: "Acknowledgements",
      description: "Funding sources, contributors who don't qualify for authorship.",
      placeholder: "Funded by grant #…  We thank … for …",
      minRows: 2,
    },
    {
      key: "references",
      title: "References",
      description: "Numbered list in journal style (e.g. Vancouver, APA, IEEE).",
      placeholder:
        "1. Smith J, et al. Title. Journal. 2024;12(3):45-60. doi:…\n2. …",
      minRows: 6,
    },
    {
      key: "appendices",
      title: "Appendices / Supplementary",
      description: "Supplementary tables, code, or extended protocols (optional).",
      placeholder: "Appendix A — full protocol…\nAppendix B — raw data summary…",
      minRows: 3,
    },
  ],
};

export const REVIEW_PAPER_FORMAT: PaperFormat = {
  id: "review_paper",
  name: "Review Paper",
  tagline: "Narrative / systematic review of the literature",
  sections: [
    {
      key: "title",
      title: "Title",
      description: "State that this is a review and the topic. ≤ 20 words.",
      placeholder:
        "e.g. mRNA Vaccine Platforms for Emerging Viral Diseases: A Systematic Review",
      minRows: 2,
    },
    {
      key: "authors",
      title: "Authors & Affiliations",
      description: "Author names, affiliations, ORCID iDs, corresponding author.",
      placeholder: "Jane Doe¹, John Smith²\n* Corresponding: jane@…",
      minRows: 3,
    },
    {
      key: "abstract",
      title: "Structured Abstract",
      description:
        "150–300 words. Background, Objectives, Methods (search strategy), Results (key themes), Conclusions.",
      placeholder:
        "Background: …\nObjectives: …\nMethods: Databases searched (PubMed, Scopus…), inclusion criteria…\nResults: …\nConclusions: …",
      minRows: 6,
    },
    {
      key: "keywords",
      title: "Keywords",
      description: "4–8 MeSH-style terms.",
      placeholder: "review; mRNA vaccine; SARS-CoV-2; immunology; …",
      minRows: 1,
    },
    {
      key: "introduction",
      title: "1. Introduction",
      description:
        "Establish topic importance, define scope, state review question and objectives.",
      placeholder:
        "Background and significance…\nScope of this review…\nResearch question / PICO…\nObjectives…",
      minRows: 6,
    },
    {
      key: "methods",
      title: "2. Methodology",
      description:
        "Search strategy, databases, date range, inclusion/exclusion criteria, screening process, PRISMA flow if systematic.",
      placeholder:
        "Databases: PubMed, Scopus, Web of Science (Jan 2010 – Dec 2024)\nSearch terms: (\"mRNA vaccine\" AND …)\nInclusion criteria: …\nExclusion criteria: …\nPRISMA flow: identified n=…, screened n=…, included n=…",
      minRows: 8,
    },
    {
      key: "thematic_sections",
      title: "3. Thematic Sections / Body",
      description:
        "Organize the literature thematically or chronologically. Each subsection synthesizes (not just summarizes) sources.",
      placeholder:
        "3.1 Theme A — Mechanism of action\n3.2 Theme B — Clinical efficacy\n3.3 Theme C — Manufacturing & cold chain\n3.4 Theme D — Safety profile",
      minRows: 12,
    },
    {
      key: "discussion",
      title: "4. Discussion & Synthesis",
      description:
        "Critical analysis: agreements, contradictions, methodological quality, gaps in the field.",
      placeholder:
        "Convergent findings…\nContradictions and controversies…\nMethodological strengths/weaknesses…\nIdentified knowledge gaps…",
      minRows: 8,
    },
    {
      key: "future_directions",
      title: "5. Future Directions",
      description: "Recommended research questions, methodologies, and applications.",
      placeholder:
        "Open questions…\nProposed studies…\nTranslational opportunities…",
      minRows: 4,
    },
    {
      key: "conclusion",
      title: "6. Conclusion",
      description: "Concise summary of the state of the field and key takeaways.",
      placeholder: "In summary, the literature suggests that…",
      minRows: 4,
    },
    {
      key: "acknowledgements",
      title: "Acknowledgements",
      description: "Funding, contributors, conflicts of interest.",
      placeholder: "Funded by …  Authors declare no conflicts of interest.",
      minRows: 2,
    },
    {
      key: "references",
      title: "References",
      description: "Full bibliography in journal style.",
      placeholder:
        "1. Author A, Author B. Title. Journal. Year;Vol(Issue):Pages. doi:…\n2. …",
      minRows: 6,
    },
  ],
};

export const PAPER_FORMATS: Record<string, PaperFormat> = {
  research_paper: RESEARCH_PAPER_FORMAT,
  review_paper: REVIEW_PAPER_FORMAT,
};
