// __tests__/app/matches.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mock MatchesList so we don't depend on its internal behavior here
jest.mock("@/components/MatchesList", () => {
  const Mock: React.FC = () => (
    <div data-testid="matches-list">Matches list mock</div>
  );
  (Mock as any).displayName = "MatchesListMock";
  return Mock;
});
// Mock router to capture back()
const back = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    back,
  }),
}));

import MatchesPage from "@/app/matches/page";

const theme = createTheme();

describe("MatchesPage", () => {
  beforeEach(() => {
    back.mockClear();
  });

  it("renders header and the matches list", () => {
    render(
      <ThemeProvider theme={theme}>
        <MatchesPage />
      </ThemeProvider>
    );

    expect(screen.getByText("Your Matches")).toBeInTheDocument();
    expect(screen.getByTestId("matches-list")).toBeInTheDocument();
  });

  it("calls router.back() when the back IconButton is clicked", () => {
    render(
      <ThemeProvider theme={theme}>
        <MatchesPage />
      </ThemeProvider>
    );

    // The page has a single IconButton (the back arrow), so this is safe
    const backButton = screen.getByRole("button");
    fireEvent.click(backButton);

    expect(back).toHaveBeenCalledTimes(1);
  });
});
