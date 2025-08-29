import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "@/components/ErrorBoundary";

const BoomOnce: React.FC = () => {
  const [thrown, setThrown] = useState(false);
  if (!thrown) {
    // marcar que ya “tiramos” para el próximo render
    setThrown(true);
    throw new Error("boom");
  }
  return <div>Recovered child</div>;
};

describe("ErrorBoundary", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div>child ok</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("child ok")).toBeInTheDocument();
  });

  it("catches an error and shows the fallback UI", () => {
    render(
      <ErrorBoundary>
        <BoomOnce />
      </ErrorBoundary>
    );

    expect(
      screen.getByText(/Something went wrong|Oops! Something went wrong/i)
    ).toBeInTheDocument();
  });
});
