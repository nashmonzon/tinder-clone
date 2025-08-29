// __tests__/app/page.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mock SwipeInterface to avoid pulling all its logic into this page test
jest.mock("@/components/SwipeInterface", () => {
  const Mock: React.FC = () => <div data-testid="swipe-mock">Swipe mock</div>;
  (Mock as any).displayName = "SwipeInterfaceMock";
  return Mock;
});

import HomePage from "@/app/page";

const theme = createTheme();

describe("HomePage", () => {
  it("renders title, subtitle and SwipeInterface placeholder", () => {
    render(
      <ThemeProvider theme={theme}>
        <HomePage />
      </ThemeProvider>
    );

    expect(screen.getByText("Tinder Clone")).toBeInTheDocument();
    expect(screen.getByText("Find your perfect match")).toBeInTheDocument();
    expect(screen.getByTestId("swipe-mock")).toBeInTheDocument();
  });
});
