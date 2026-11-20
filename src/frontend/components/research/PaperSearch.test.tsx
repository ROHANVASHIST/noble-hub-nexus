import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { cleanup, render } from "@testing-library/react";
import PaperSearch from "./PaperSearch";

const mocks = vi.hoisted(() => ({
  user: null as { id: string } | null,
  papers: [] as Array<{ external_id: string }>,
  insert: vi.fn(),
  invalidate: vi.fn(),
  getUser: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("@/App", () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock("@/frontend/hooks/useSavedPapers", () => ({
  useSavedPapers: () => ({ papers: mocks.papers }),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: mocks.getUser, getSession: mocks.getSession },
    from: () => ({ insert: mocks.insert }),
  },
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mocks.invalidate }),
}));
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}));

const paper = {
  id: "arxiv:1234.5678",
  source: "arXiv",
  title: "Quantum error correction",
  authors: ["R. Example"],
  year: 2025,
  abstract: "A study of quantum error correction.",
  url: "https://arxiv.org/abs/1234.5678",
  pdfUrl: "https://arxiv.org/pdf/1234.5678",
  doi: null,
  venue: null,
  citations: null,
};

const mockSearchResults = () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      query: "quantum error correction",
      count: 1,
      bySource: { arxiv: [paper] },
      errors: [],
      results: [paper],
    }),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const searchForPaper = async () => {
  fireEvent.change(screen.getByPlaceholderText(/Search papers/), {
    target: { value: "quantum error correction" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  await screen.findByText(paper.title);
};

describe("PaperSearch save feedback", () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.user = { id: "user-1" };
    mocks.papers = [];
    mocks.insert.mockReset();
    mocks.insert.mockImplementation(async (payload: { external_id: string }) => {
      mocks.papers.push({ external_id: payload.external_id });
      return { error: null };
    });
    mocks.invalidate.mockReset();
    mocks.invalidate.mockResolvedValue(undefined);
    mocks.getUser.mockResolvedValue({ data: { user: mocks.user } });
    mocks.getSession.mockResolvedValue({ data: { session: null } });
    mockSearchResults();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("marks a successfully saved paper and refreshes the signed-in library", async () => {
    const { rerender } = render(<PaperSearch />);
    await searchForPaper();

    fireEvent.click(screen.getByRole("button", { name: `Save ${paper.title}` }));

    await waitFor(() => expect(mocks.invalidate).toHaveBeenCalledWith({
      queryKey: ["saved-papers", "user-1"],
    }));
    rerender(<PaperSearch />);

    expect(screen.getByRole("button", { name: `Saved ${paper.title}` })).toBeDisabled();
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({
      external_id: paper.id,
      pdf_url: paper.pdfUrl,
    }));
  });

  it("shows papers already in the account as saved without inserting again", async () => {
    mocks.papers = [{ external_id: paper.id }];
    render(<PaperSearch />);
    await searchForPaper();

    expect(screen.getByRole("button", { name: `Saved ${paper.title}` })).toBeDisabled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("treats a duplicate response as saved and refreshes the library", async () => {
    mocks.insert.mockResolvedValueOnce({ error: { code: "23505" } });
    render(<PaperSearch />);
    await searchForPaper();

    fireEvent.click(screen.getByRole("button", { name: `Save ${paper.title}` }));

    expect(await screen.findByRole("button", { name: `Saved ${paper.title}` })).toBeDisabled();
    expect(mocks.invalidate).toHaveBeenCalledWith({ queryKey: ["saved-papers", "user-1"] });
  });

  it("keeps failed saves retryable", async () => {
    mocks.insert
      .mockResolvedValueOnce({ error: new Error("temporary failure") })
      .mockImplementationOnce(async (payload: { external_id: string }) => {
        mocks.papers.push({ external_id: payload.external_id });
        return { error: null };
      });
    render(<PaperSearch />);
    await searchForPaper();

    fireEvent.click(screen.getByRole("button", { name: `Save ${paper.title}` }));
    await waitFor(() => expect(screen.getByRole("button", { name: `Save ${paper.title}` })).toBeEnabled());
    expect(mocks.invalidate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: `Save ${paper.title}` }));
    await waitFor(() => expect(mocks.invalidate).toHaveBeenCalled());
    expect(mocks.insert).toHaveBeenCalledTimes(2);
  });

  it("labels guest saves as device-only and persists them locally", async () => {
    mocks.user = null;
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    render(<PaperSearch />);
    await searchForPaper();

    fireEvent.click(screen.getByRole("button", { name: `Save ${paper.title}` }));

    expect(await screen.findByRole("button", { name: `Saved on this device: ${paper.title}` })).toBeDisabled();
    expect(JSON.parse(localStorage.getItem("nobelhub:saved-papers") || "[]")).toEqual([paper]);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("loads more using the original query and source selection", async () => {
    const fetchMock = mockSearchResults();
    render(<PaperSearch />);
    fireEvent.click(screen.getByRole("button", { name: "DBLP" }));
    await searchForPaper();

    fireEvent.change(screen.getByPlaceholderText(/Search papers/), {
      target: { value: "a different topic" },
    });
    fireEvent.click(screen.getByRole("button", { name: "DBLP" }));
    fireEvent.click(screen.getByRole("button", { name: "Load more results" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const firstRequest = new URL(fetchMock.mock.calls[0][0] as string);
    const nextRequest = new URL(fetchMock.mock.calls[1][0] as string);
    expect(firstRequest.searchParams.get("q")).toBe("quantum error correction");
    expect(nextRequest.searchParams.get("q")).toBe("quantum error correction");
    expect(nextRequest.searchParams.get("sources")).toBe(firstRequest.searchParams.get("sources"));
    expect(nextRequest.searchParams.get("sources")).not.toContain("dblp");
    expect(nextRequest.searchParams.get("offset")).toBe("25");
  });
});