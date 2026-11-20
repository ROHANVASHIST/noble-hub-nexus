import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PaperLibraryPage from "./PaperLibraryPage";

const mocks = vi.hoisted(() => ({
  user: { id: "user-1" },
  papers: [{
    id: "saved-paper-42",
    external_id: "arxiv:1234.5678",
    source: "arXiv",
    title: "Quantum error correction",
    authors: ["R. Example"],
    year: 2025,
    abstract: "An abstract",
    url: "https://arxiv.org/abs/1234.5678",
    pdf_url: "https://arxiv.org/pdf/1234.5678",
    doi: null,
    venue: null,
    citations: null,
    status: "to_read",
    notes: "",
  }],
  update: { mutate: vi.fn() },
  remove: { mutate: vi.fn() },
}));

vi.mock("@/App", () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: vi.fn() } }));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: mocks.papers, isLoading: false }),
  useMutation: () => ({ ...mocks.update, ...mocks.remove }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));
vi.mock("@/frontend/components/layout/PageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/frontend/components/Seo", () => ({ default: () => null }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

describe("PaperLibraryPage", () => {
  afterEach(cleanup);

  it("links saved papers directly to their in-app reader and keeps the external link", () => {
    render(
      <MemoryRouter>
        <PaperLibraryPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: `Read ${mocks.papers[0].title} in reader` }))
      .toHaveAttribute("href", `/reader/${mocks.papers[0].id}`);
    expect(screen.getByRole("link", { name: "Open" }))
      .toHaveAttribute("href", mocks.papers[0].url);
  });
});