// __tests__/app/layout.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock usePathname used by the layout (to avoid Next runtime errors)
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

import RootLayout from "@/app/layout";

describe("RootLayout", () => {
  it("renders children inside the html/body without crashing", () => {
    render(
      <RootLayout>
        <div data-testid="layout-child">Hello from child</div>
      </RootLayout>
    );

    expect(screen.getByTestId("layout-child")).toBeInTheDocument();
    // sanity: ensure the html structure exists
    expect(document.querySelector("html")).toBeTruthy();
    expect(document.querySelector("body")).toBeTruthy();
  });
});
