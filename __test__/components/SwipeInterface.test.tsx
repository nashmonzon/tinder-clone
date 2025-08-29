// __tests__/components/SwipeInterface.test.tsx
import type React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  within, // 👈 agregado
} from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import SwipeInterface from "@/components/SwipeInterface";
import { MatchProvider, useMatches } from "@/contexts/MatchContext";
import { getProfiles, postInteraction } from "@/lib/api";
import * as nextNav from "next/navigation";
import { useEffect, Fragment } from "react";

jest.mock("@/lib/api");

// Router: lo mockeamos una sola vez y sobrescribimos su retorno en beforeEach
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const theme = createTheme();

const mockProfiles = [
  { id: 1, name: "Sarah", age: 21, image: "/girl-1.jpg", bio: "Love hiking" },
  { id: 2, name: "Jessica", age: 23, image: "/girl-2.png", bio: "Artist" },
  { id: 3, name: "Emma", age: 25, image: "/girl-3.jpg", bio: "Yoga" },
];

// Render helper
const renderWithProviders = (component: React.ReactElement) =>
  render(
    <ThemeProvider theme={theme}>
      <MatchProvider>{component}</MatchProvider>
    </ThemeProvider>
  );

// Seed helper para crear N matches dentro del provider real
const SeedMatches: React.FC<{ count: number }> = ({ count }) => {
  const { addMatch } = useMatches();
  useEffect(() => {
    for (let i = 0; i < count; i++) {
      addMatch({
        id: 10_000 + i,
        name: `Seed ${i}`,
        age: 30,
        image: "/seed.jpg",
        bio: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);
  return null;
};

describe("SwipeInterface", () => {
  const mockGetProfiles = getProfiles as jest.MockedFunction<
    typeof getProfiles
  >;
  const mockPostInteraction = postInteraction as jest.MockedFunction<
    typeof postInteraction
  >;

  const pushMock = jest.fn();
  const backMock = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    // router mocked aquí
    (nextNav.useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
      back: backMock,
    });

    mockGetProfiles.mockResolvedValue({ data: mockProfiles });
    mockPostInteraction.mockResolvedValue({ match: false });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("shows loading initially", () => {
    renderWithProviders(<SwipeInterface />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("displays profiles after loading", async () => {
    renderWithProviders(<SwipeInterface />);
    await waitFor(() =>
      expect(screen.getByText(/Sarah, 21/)).toBeInTheDocument()
    );
    expect(mockGetProfiles).toHaveBeenCalledTimes(1);
  });

  it("handles like and shows match modal", async () => {
    renderWithProviders(<SwipeInterface />);
    await screen.findByText(/Sarah, 21/);

    fireEvent.click(screen.getByTestId("like-btn"));

    expect(await screen.findByText(/It.?s a Match!/i)).toBeInTheDocument();
  });

  it("handles dislike and moves to next profile", async () => {
    renderWithProviders(<SwipeInterface />);
    await screen.findByText(/Sarah, 21/);

    fireEvent.click(screen.getByTestId("dislike-btn"));
    await act(async () => {
      jest.advanceTimersByTime(220); // avanza el setTimeout(200)
    });

    expect(await screen.findByText(/Jessica, 23/)).toBeInTheDocument();
  });

  it("shows no more profiles when exhausted", async () => {
    renderWithProviders(<SwipeInterface />);

    await waitFor(() =>
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
    );

    while (screen.queryByLabelText(/dislike/i)) {
      fireEvent.click(screen.getByLabelText(/dislike/i));
      await act(async () => {
        jest.runAllTimers();
      });
      await Promise.resolve();
    }

    expect(await screen.findByText(/No more profiles/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/go-to-matches/i)).toBeInTheDocument();
  }, 15000);

  it("handles undo", async () => {
    renderWithProviders(<SwipeInterface />);
    await screen.findByText(/Sarah, 21/);

    fireEvent.click(screen.getByLabelText(/dislike/i));
    await act(async () => {
      jest.advanceTimersByTime(220);
    });

    fireEvent.click(await screen.findByLabelText(/undo/i));
    expect(await screen.findByText(/Last swipe undone/i)).toBeInTheDocument();
  });

  it("handles refresh", async () => {
    renderWithProviders(<SwipeInterface />);
    await waitFor(() =>
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText(/refresh/i));

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    await waitFor(() => expect(mockGetProfiles).toHaveBeenCalledTimes(2));
  });

  it("shows API error gracefully", async () => {
    mockGetProfiles.mockRejectedValueOnce(new Error("API Error"));
    renderWithProviders(<SwipeInterface />);

    expect(
      await screen.findByText("Failed to load profiles. Please try again.")
    ).toBeInTheDocument();
  });

  it("handles empty profiles response", async () => {
    mockGetProfiles.mockResolvedValueOnce({ data: [] });
    renderWithProviders(<SwipeInterface />);
    expect(await screen.findByText("No more profiles")).toBeInTheDocument();
  });

  it("shows undo snackbar and updates 'profiles remaining' counter", async () => {
    renderWithProviders(<SwipeInterface />);
    await screen.findByText(/Sarah, 21/);

    expect(screen.getByText(/3 profiles remaining/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("dislike-btn"));
    await act(async () => {
      jest.advanceTimersByTime(220);
    });

    expect(
      await screen.findByText(/2 profiles remaining/i)
    ).toBeInTheDocument();

    fireEvent.click(await screen.findByLabelText(/undo/i));
    expect(await screen.findByText(/Last swipe undone/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/3 profiles remaining/i)
    ).toBeInTheDocument();
  });

  it("filters out matched profiles after like & close modal", async () => {
    renderWithProviders(<SwipeInterface />);
    await screen.findByText(/Sarah, 21/);

    fireEvent.click(screen.getByTestId("like-btn"));
    await screen.findByText(/It.?s a Match!/i);

    fireEvent.click(screen.getByText(/Keep Swiping/i)); // cierra modal y agrega match

    await waitFor(() => {
      expect(screen.getByText(/Jessica, 23/)).toBeInTheDocument();
    });
    expect(screen.queryByText(/It.?s a Match!/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sarah, 21/)).not.toBeInTheDocument();
  });

  // ---------- Cobertura extra: FAB y "99+" ----------

  // it("after adding a match the FAB appears and navigates to /matches", async () => {
  //   renderWithProviders(<SwipeInterface />);
  //   await screen.findByText(/Sarah, 21/);

  //   // Like → modal → Keep Swiping (agrega match y cierra)
  //   fireEvent.click(screen.getByTestId("like-btn"));
  //   await screen.findByText(/It.?s a Match!/i);
  //   fireEvent.click(screen.getByText(/Keep Swiping/i));

  //   // ahora debería aparecer el FAB
  //   const fab = await screen.findByLabelText(/open-matches/i);
  //   fireEvent.click(fab);

  //   expect(pushMock).toHaveBeenCalledWith("/matches");
  // });

  // it("shows '99+' when matchCount exceeds 99", async () => {
  //   render(
  //     <ThemeProvider theme={theme}>
  //       <MatchProvider>
  //         <>
  //           <SeedMatches count={120} />
  //           <SwipeInterface />
  //         </>
  //       </MatchProvider>
  //     </ThemeProvider>
  //   );

  //   // No dependemos del FAB; esperamos directamente el texto "99+"
  //   const badge = await screen.findByText(
  //     (_, el) => el?.textContent?.trim() === "99+"
  //   );
  //   expect(badge).toBeInTheDocument();
  // });

  it("navigates to /matches on 'Send Message' in the match modal", async () => {
    renderWithProviders(<SwipeInterface />);
    await screen.findByText(/Sarah, 21/);

    fireEvent.click(screen.getByTestId("like-btn"));
    await screen.findByText(/It.?s a Match!/i);

    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/matches");
    });
  });
});
