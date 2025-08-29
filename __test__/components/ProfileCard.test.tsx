// __tests__/components/ProfileCard.test.tsx
import type React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import ProfileCard from "@/components/ProfileCard";

const theme = createTheme();

const mockProfile = {
  id: 1,
  name: "Test User",
  age: 25,
  image: "/test-image.jpg",
  bio: "Test bio",
  images: ["/test-image2.jpg"], // 👈 ya no duplicamos "/test-image.jpg"
};

const renderWithTheme = (component: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);

describe("ProfileCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders profile information", () => {
    renderWithTheme(<ProfileCard profile={mockProfile} />);

    expect(screen.getByText("Test User, 25")).toBeInTheDocument();
    expect(screen.getByText("Test bio")).toBeInTheDocument();
    expect(screen.getByAltText("Test User, 25")).toBeInTheDocument();
  });

  it("navigates images when clicking the right half", () => {
    renderWithTheme(<ProfileCard profile={mockProfile} />);

    const img = screen.getByAltText("Test User, 25");

    // Mock element size so left/right half clicks can be determined
    const rect = {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 200,
      width: 200,
      height: 400,
      toJSON: () => ({}),
    } as DOMRect;
    jest.spyOn(img, "getBoundingClientRect").mockReturnValue(rect);

    // Right click → go to next image
    fireEvent.click(img, { clientX: 160 });
    // Click again to ensure navigation logic doesn't crash
    fireEvent.click(img, { clientX: 160 });

    expect(img).toBeInTheDocument();
  });

  it("shows 'Profile unavailable' for invalid profile", () => {
    const invalid = { ...mockProfile, name: "", age: 0 };
    renderWithTheme(<ProfileCard profile={invalid as any} />);
    expect(screen.getByText("Profile unavailable")).toBeInTheDocument();
  });

  it("shows 'Image unavailable' on image error", async () => {
    renderWithTheme(<ProfileCard profile={mockProfile} />);
    const img = screen.getByAltText("Test User, 25");

    // Simulate load error
    fireEvent.error(img);

    await waitFor(() => {
      expect(screen.getByText("Image unavailable")).toBeInTheDocument();
    });
  });

  it("shows fallback on image error and still allows navigation", async () => {
    renderWithTheme(
      <ProfileCard
        profile={{
          id: 10,
          name: "X",
          age: 30,
          image: "/bad.jpg",
          bio: "b",
          images: ["/bad.jpg", "/good.jpg"],
        }}
      />
    );

    const img = screen.getByAltText("X, 30");
    fireEvent.error(img);

    expect(await screen.findByText(/Image unavailable/i)).toBeInTheDocument();

    // Click the fallback container to attempt switching images
    fireEvent.click(screen.getByText(/Image unavailable/i));

    // Card should still render fine
    expect(screen.getByText(/X, 30/)).toBeInTheDocument();
  });

  it("renders with disabled style without crashing", () => {
    renderWithTheme(<ProfileCard profile={mockProfile} disabled />);
    expect(screen.getByAltText("Test User, 25")).toBeInTheDocument();
  });

  it("navigates to the previous image when clicking the left half (wraps from first to last)", () => {
    renderWithTheme(<ProfileCard profile={mockProfile} />);

    const img = screen.getByAltText("Test User, 25") as HTMLImageElement;

    const rect = {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 200,
      width: 200,
      height: 400,
      toJSON: () => ({}),
    } as DOMRect;
    jest.spyOn(img, "getBoundingClientRect").mockReturnValue(rect);

    // From index 0, left click should wrap to the last image
    fireEvent.click(img, { clientX: 20 });

    expect(img.getAttribute("src")).toContain("/test-image2.jpg");
  });

  it("does not navigate when there is only one image", () => {
    const single = {
      ...mockProfile,
      images: undefined, // only the main image
    };
    renderWithTheme(<ProfileCard profile={single} />);

    const img = screen.getByAltText("Test User, 25") as HTMLImageElement;

    const rect = {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 200,
      width: 200,
      height: 400,
      toJSON: () => ({}),
    } as DOMRect;
    jest.spyOn(img, "getBoundingClientRect").mockReturnValue(rect);

    const before = img.getAttribute("src");

    // Clicking both sides should not change the image when there's only one
    fireEvent.click(img, { clientX: 160 });
    fireEvent.click(img, { clientX: 20 });

    const after = img.getAttribute("src");
    expect(after).toBe(before);
  });
  it("does not navigate when disabled=true", () => {
    renderWithTheme(<ProfileCard profile={mockProfile} disabled />);

    const img = screen.getByAltText("Test User, 25") as HTMLImageElement;

    // Mock de tamaño para detectar mitad derecha/izquierda
    const rect = {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 200,
      width: 200,
      height: 400,
      toJSON: () => ({}),
    } as DOMRect;
    jest.spyOn(img, "getBoundingClientRect").mockReturnValue(rect);

    const before = img.getAttribute("src");

    // Clicks a ambos lados NO deben cambiar la imagen si está disabled
    fireEvent.click(img, { clientX: 160 }); // derecha (next)
    fireEvent.click(img, { clientX: 20 }); // izquierda (prev)

    const after = img.getAttribute("src");
    expect(after).toBe(before);
  });

  it("recovers after an image error by navigating and loading the next image", async () => {
    renderWithTheme(<ProfileCard profile={mockProfile} />);

    // 1) Forzamos error en la imagen actual (índice 0)
    const img = screen.getByAltText("Test User, 25") as HTMLImageElement;
    fireEvent.error(img);

    // aparece el fallback
    expect(await screen.findByText(/Image unavailable/i)).toBeInTheDocument();

    // 2) Click en el fallback (no en el <img>) → mockeamos su rect para navegar a la derecha
    const fallbackBox = screen
      .getByText(/Image unavailable/i)
      .closest("div") as HTMLElement;

    const rect = {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 200,
      width: 200,
      height: 400,
      toJSON: () => ({}),
    } as DOMRect;
    jest.spyOn(fallbackBox, "getBoundingClientRect").mockReturnValue(rect);

    // click lado derecho → next image (índice 1)
    fireEvent.click(fallbackBox, { clientX: 160 });

    // 3) vuelve a renderizarse la CardMedia con la nueva imagen
    const imgAfter = await screen.findByAltText("Test User, 25");
    expect(imgAfter.getAttribute("src")).toContain("/test-image2.jpg");
  });
});
