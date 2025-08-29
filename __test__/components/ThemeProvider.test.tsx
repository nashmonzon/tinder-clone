// __tests__/components/ThemeProvider.test.tsx
import { render, screen } from "@testing-library/react";
import ThemeProvider from "@/components/ThemeProvider";

describe("ThemeProvider", () => {
  it("renders children with theme applied", () => {
    render(
      <ThemeProvider>
        <div>themed child</div>
      </ThemeProvider>
    );
    expect(screen.getByText("themed child")).toBeInTheDocument();
  });
});
