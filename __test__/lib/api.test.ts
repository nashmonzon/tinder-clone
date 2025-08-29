// __tests__/lib/api.test.ts
import { getProfiles, postInteraction } from "@/lib/api";

describe("API Functions", () => {
  const originalFetch = global.fetch;

  beforeAll(() => {
    // Asegura que fetch exista como jest.fn()
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterAll(() => {
    // Restaura el fetch original (por si tu runtime lo provee)
    global.fetch = originalFetch as any;
  });

  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  describe("getProfiles", () => {
    it("should fetch profiles successfully", async () => {
      const mockProfiles = { data: [{ id: 1, name: "Test", age: 25 }] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockProfiles,
      });

      const result = await getProfiles();
      expect(result).toEqual(mockProfiles);
      expect(global.fetch).toHaveBeenCalledWith("/api/profiles", {
        cache: "no-store",
      });
    });

    it("should handle empty profiles (204)", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await getProfiles();
      expect(result).toEqual({ data: [] });
    });

    it("should throw error on failed request", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getProfiles()).rejects.toThrow("Profiles fetch failed");
      expect(global.fetch).toHaveBeenCalledWith("/api/profiles", {
        cache: "no-store",
      });
    });
  });

  describe("postInteraction", () => {
    it("should post interaction successfully", async () => {
      const mockResponse = { match: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const result = await postInteraction({
        fromUserId: 1,
        toUserId: 2,
        action: "like",
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUserId: 1, toUserId: 2, action: "like" }),
      });
    });

    it("should handle duplicate like error", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
      });

      await expect(
        postInteraction({ fromUserId: 1, toUserId: 2, action: "like" })
      ).rejects.toThrow("Duplicate like");
    });

    it("should handle invalid request error", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
      });

      await expect(
        postInteraction({ fromUserId: 1, toUserId: 2, action: "like" })
      ).rejects.toThrow("Invalid request");
    });

    it("throws generic error when server returns 500", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(
        postInteraction({ fromUserId: 1, toUserId: 2, action: "like" })
      ).rejects.toThrow("Interaction failed");
      expect(global.fetch).toHaveBeenCalledWith("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUserId: 1, toUserId: 2, action: "like" }),
      });
    });
  });
});
