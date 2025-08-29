// __tests__/components/MatchModal.test.tsx
import type React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import MatchModal from "@/components/MatchModal";

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

const profile = {
  id: 7,
  name: "Alice",
  age: 28,
  image: "/alice.jpg",
  bio: "Coffee lover",
  images: ["/a1.jpg", "/a2.jpg"],
};

describe("MatchModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("does not render when profile is null", () => {
    const { container } = renderWithTheme(
      <MatchModal open={true} profile={null} onClose={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders when open with a profile", () => {
    renderWithTheme(
      <MatchModal open={true} profile={profile} onClose={jest.fn()} />
    );

    // Title can be "It's a Match!" (with typographic apostrophe). Use flexible regex.
    expect(screen.getByText(/It.?s a Match!/i)).toBeInTheDocument();
    expect(
      screen.getByText(/You and Alice liked each other/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Alice, 28")).toBeInTheDocument();
    expect(screen.getByText("Coffee lover")).toBeInTheDocument();

    // Let the intro animation timer run so it doesn't hang tests
    act(() => {
      jest.advanceTimersByTime(2100);
    });
  });

  it("calls onSendMessage(profile) and onClose when clicking 'Send Message'", () => {
    const onClose = jest.fn();
    const onSendMessage = jest.fn();

    renderWithTheme(
      <MatchModal
        open={true}
        profile={profile}
        onClose={onClose}
        onSendMessage={onSendMessage}
      />
    );

    const sendBtn = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(sendBtn);

    expect(onSendMessage).toHaveBeenCalledTimes(1);
    expect(onSendMessage).toHaveBeenCalledWith(profile);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking 'Keep Swiping'", () => {
    const onClose = jest.fn();
    renderWithTheme(
      <MatchModal open={true} profile={profile} onClose={onClose} />
    );

    const keepBtn = screen.getByRole("button", { name: /keep swiping/i });
    fireEvent.click(keepBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when clicking the close icon button", () => {
    const onClose = jest.fn();
    renderWithTheme(
      <MatchModal open={true} profile={profile} onClose={onClose} />
    );

    // The top-right close icon is an IconButton without name, but it still has role=button
    // Grab the first button that is not the action buttons.
    const buttons = screen.getAllByRole("button");
    // Heuristic: the first button rendered is usually the close icon inside the Dialog
    fireEvent.click(buttons[0]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render when open is false", () => {
    renderWithTheme(
      <MatchModal open={false} profile={profile} onClose={jest.fn()} />
    );
    // Title should not be present
    expect(screen.queryByText(/It.?s a Match!/i)).not.toBeInTheDocument();
  });
});
