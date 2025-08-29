// __tests__/components/MatchesList.test.tsx
import React from "react";
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import MatchesList from "@/components/MatchesList";

// mock ONLY the hook
jest.mock("@/contexts/MatchContext", () => ({
  useMatches: jest.fn(),
}));

import { useMatches } from "@/contexts/MatchContext";

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>);

describe("MatchesList", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when there are no matches", () => {
    (useMatches as jest.Mock).mockReturnValue({
      matches: [],
      unmatch: jest.fn(),
    });

    renderWithTheme(<MatchesList />);

    expect(screen.getByText(/No matches yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Start swiping to find your perfect matches/i)
    ).toBeInTheDocument();
  });

  it("renders a match when context has one", () => {
    (useMatches as jest.Mock).mockReturnValue({
      matches: [
        {
          id: "m1",
          isUnmatched: false,
          lastMessage: null,
          profile: {
            id: 1,
            name: "Sarah",
            age: 21,
            image: "/girl-1.jpg",
            bio: "Love hiking",
          },
        },
      ],
      unmatch: jest.fn(),
    });

    renderWithTheme(<MatchesList />);

    // match content (avoid relying on role="list" which may vary with MUI)
    expect(screen.getByText(/Your Matches/i)).toBeInTheDocument();
    expect(screen.getByText(/Sarah/i)).toBeInTheDocument();
    expect(screen.queryByText(/No matches yet/i)).not.toBeInTheDocument();
  });

  it("shows '✨ New Match', prefixes 'You:' when lastMessage.fromUser=true and prints minutes", () => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000; // 5m
    (useMatches as jest.Mock).mockReturnValue({
      matches: [
        {
          id: "m1",
          matchedAt: fiveMinAgo,
          isUnmatched: false,
          lastMessage: { text: "Hi!", fromUser: true },
          profile: {
            id: 1,
            name: "Sarah",
            age: 21,
            image: "/girl-1.jpg",
            bio: "",
          },
        },
      ],
      unmatch: jest.fn(),
    });

    renderWithTheme(<MatchesList />);

    // Chip for <24h
    expect(screen.getByText(/New Match/i)).toBeInTheDocument();
    // "You: " prefix
    expect(screen.getByText(/^You:\s*Hi!$/)).toBeInTheDocument();
    // "5m ago"
    expect(screen.getByText(/5m ago/)).toBeInTheDocument();
  });

  it("opens the unmatch dialog via menu button and confirms the unmatch", async () => {
    const unmatch = jest.fn();
    (useMatches as jest.Mock).mockReturnValue({
      matches: [
        {
          id: "m1",
          matchedAt: Date.now(),
          isUnmatched: false,
          lastMessage: null,
          profile: {
            id: 1,
            name: "Sarah",
            age: 21,
            image: "/girl-1.jpg",
            bio: "",
          },
        },
      ],
      unmatch,
    });

    const { container } = renderWithTheme(<MatchesList />);

    // Scope to the card to avoid grabbing other buttons (like "Message")
    const card = screen
      .getByText(/Sarah,\s*21/)
      .closest(".MuiCard-root") as HTMLElement;
    const buttons = within(card).getAllByRole("button");
    // The first IconButton in the card is the "More" menu (no accessible name)
    fireEvent.click(buttons[0]);

    // Dialog appears
    expect(await screen.findByText(/Unmatch Sarah\?/i)).toBeInTheDocument();

    // Confirm unmatch
    fireEvent.click(screen.getByRole("button", { name: /Unmatch/i }));

    expect(unmatch).toHaveBeenCalledTimes(1);
    expect(unmatch).toHaveBeenCalledWith("m1");

    // Dialog closes
    await waitFor(() => {
      expect(screen.queryByText(/Unmatch Sarah\?/i)).not.toBeInTheDocument();
    });
  });

  it("pluralizes header and shows hours/days formatting", () => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000; // 2h
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000; // 3d

    (useMatches as jest.Mock).mockReturnValue({
      matches: [
        {
          id: "m1",
          matchedAt: twoHoursAgo,
          isUnmatched: false,
          lastMessage: null,
          profile: { id: 1, name: "Alice", age: 22, image: "/a.jpg", bio: "" },
        },
        {
          id: "m2",
          matchedAt: threeDaysAgo,
          isUnmatched: false,
          lastMessage: null,
          profile: { id: 2, name: "Bea", age: 23, image: "/b.jpg", bio: "" },
        },
      ],
      unmatch: jest.fn(),
    });

    renderWithTheme(<MatchesList />);

    // Pluralization
    expect(
      screen.getByText(/2 connections waiting for you/i)
    ).toBeInTheDocument();

    // Time formats
    expect(screen.getByText(/2h ago/)).toBeInTheDocument();
    expect(screen.getByText(/3d ago/)).toBeInTheDocument();
  });

  it("renders default message hint when there is no lastMessage", () => {
    (useMatches as jest.Mock).mockReturnValue({
      matches: [
        {
          id: "m1",
          matchedAt: Date.now(),
          isUnmatched: false,
          lastMessage: null,
          profile: { id: 1, name: "Carl", age: 24, image: "/c.jpg", bio: "" },
        },
      ],
      unmatch: jest.fn(),
    });

    renderWithTheme(<MatchesList />);

    expect(
      screen.getByText(/Say hello to your new match!/i)
    ).toBeInTheDocument();
  });
  it("opens the unmatch dialog and cancels without calling unmatch", async () => {
    const unmatch = jest.fn();
    (useMatches as jest.Mock).mockReturnValue({
      matches: [
        {
          id: "m1",
          matchedAt: Date.now(),
          isUnmatched: false,
          lastMessage: null,
          profile: {
            id: 1,
            name: "Sarah",
            age: 21,
            image: "/girl-1.jpg",
            bio: "",
          },
        },
      ],
      unmatch,
    });

    renderWithTheme(<MatchesList />);

    const card = screen
      .getByText(/Sarah,\s*21/)
      .closest(".MuiCard-root") as HTMLElement;
    const buttons = within(card).getAllByRole("button");
    fireEvent.click(buttons[0]); // abre diálogo

    expect(await screen.findByText(/Unmatch Sarah\?/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(unmatch).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByText(/Unmatch Sarah\?/i)).not.toBeInTheDocument()
    );
  });
});
