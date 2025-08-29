// __tests__/lib/errorHandler.test.ts
import { errorHandler, ValidationError } from "@/lib/errorHandler";

describe("errorHandler", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("logError writes to console without crashing", () => {
    const err = new Error("boom");
    errorHandler.logError(err, "ctx");
    expect(console.error).toHaveBeenCalled();
  });

  it("validateProfile: valid profile passes; invalid fields throw ValidationError", () => {
    const ok = { id: 1, name: "Ana", age: 25, image: "/img.png" };
    expect(errorHandler.validateProfile(ok)).toBe(true);

    // invalid name
    expect(() => errorHandler.validateProfile({ ...ok, name: "" })).toThrow(
      ValidationError
    );
    // invalid age range
    expect(() => errorHandler.validateProfile({ ...ok, age: 10 })).toThrow(
      ValidationError
    );
    // invalid image type
    expect(() => errorHandler.validateProfile({ ...ok, image: 123 })).toThrow(
      ValidationError
    );
  });

  it("validateProfile: invalid id throws ValidationError", () => {
    const bad = { id: "x", name: "Ana", age: 25, image: "/img.png" } as any;
    expect(() => errorHandler.validateProfile(bad)).toThrow(ValidationError);
  });

  it("safeLocalStorage set/get/remove work and capture errors", () => {
    const store = new Map<string, string>();

    const getSpy = jest
      .spyOn(global.localStorage, "getItem")
      .mockImplementation((k: string) => (store.has(k) ? store.get(k)! : null));

    const setSpy = jest
      .spyOn(global.localStorage, "setItem")
      .mockImplementation((k: string, v: string) => {
        store.set(k, v);
      });

    const rmSpy = jest
      .spyOn(global.localStorage, "removeItem")
      .mockImplementation((k: string) => {
        store.delete(k);
      });

    // happy path
    expect(errorHandler.safeLocalStorage.setItem("k", "v")).toBe(true);
    expect(errorHandler.safeLocalStorage.getItem("k")).toBe("v");
    expect(errorHandler.safeLocalStorage.removeItem("k")).toBe(true);

    // error case: setItem throws -> returns false and logs
    setSpy.mockImplementationOnce(() => {
      throw new Error("ls-set-error");
    });
    expect(errorHandler.safeLocalStorage.setItem("k", "v")).toBe(false);
    expect(console.error).toHaveBeenCalled();

    // error case: getItem throws -> returns null and logs
    getSpy.mockImplementationOnce(() => {
      throw new Error("ls-get-error");
    });
    expect(errorHandler.safeLocalStorage.getItem("k")).toBeNull();
    expect(console.error).toHaveBeenCalled();

    // error case: removeItem throws -> returns false and logs
    rmSpy.mockImplementationOnce(() => {
      throw new Error("ls-rm-error");
    });
    expect(errorHandler.safeLocalStorage.removeItem("k")).toBe(false);
    expect(console.error).toHaveBeenCalled();

    // cleanup
    getSpy.mockRestore();
    setSpy.mockRestore();
    rmSpy.mockRestore();
  });

  it("withTimeout resolves within time and rejects when exceeding the limit", async () => {
    jest.useFakeTimers();

    // resolves (wins the race)
    const resultPromise = errorHandler.withTimeout(
      () => Promise.resolve("ok"),
      1000
    );
    await expect(resultPromise).resolves.toBe("ok");

    // times out
    const never = new Promise<string>(() => {});
    const timeoutPromise = errorHandler.withTimeout(() => never, 100);
    jest.advanceTimersByTime(150);
    await expect(timeoutPromise).rejects.toThrow(/timed out/i);

    jest.useRealTimers();
  });

  it("withRetry retries and eventually resolves", async () => {
    let attempts = 0;
    const op = jest.fn().mockImplementation(async () => {
      attempts++;
      if (attempts < 3) throw new Error("fail");
      return "done";
    });

    const res = await errorHandler.withRetry(op, 3, 1); // small base delay (ms)
    expect(res).toBe("done");
    expect(op).toHaveBeenCalledTimes(3);
  });

  it("withRetry retries and finally rejects after max retries", async () => {
    const op = jest.fn().mockRejectedValue(new Error("always-fail"));
    await expect(errorHandler.withRetry(op, 2, 1)).rejects.toThrow(
      "always-fail"
    );
    expect(op).toHaveBeenCalledTimes(2);
    // también loguea en cada intento
    expect(console.error).toHaveBeenCalled();
  });
});
