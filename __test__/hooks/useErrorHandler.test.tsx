// __tests__/hooks/useErrorHandler.test.ts
import { renderHook, act } from "@testing-library/react";
import { useErrorHandler } from "@/hooks/useErrorHandler";

// 👇 Mock explícito de errorHandler con las funciones que usa el hook
jest.mock("@/lib/errorHandler", () => {
  return {
    errorHandler: {
      logError: jest.fn(),
      withRetry: jest.fn((operation: any) => operation()),
      withTimeout: jest.fn((operation: any, ms?: number) => operation()),
      validateProfile: jest.fn(() => true),
      safeLocalStorage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
    },
    NetworkError: class NetworkError extends Error {
      statusCode?: number;
      constructor(msg?: string, statusCode?: number) {
        super(msg);
        this.statusCode = statusCode;
      }
    },
    ValidationError: class ValidationError extends Error {},
    StorageError: class StorageError extends Error {},
  };
});

// Importamos el objeto mockeado ya que arriba lo definimos
import {
  errorHandler,
  ValidationError,
  NetworkError,
  StorageError,
} from "@/lib/errorHandler";

describe("useErrorHandler", () => {
  const mockEH = errorHandler as jest.Mocked<typeof errorHandler>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with no error and not loading", () => {
    const { result } = renderHook(() => useErrorHandler());
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle successful async operations", async () => {
    const { result } = renderHook(() => useErrorHandler());
    const mockOperation = jest.fn().mockResolvedValue("success");

    let value: any;
    await act(async () => {
      value = await result.current.handleAsync(mockOperation);
    });

    expect(value).toBe("success");
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle failed async operations", async () => {
    const { result } = renderHook(() => useErrorHandler());

    const mockError = new Error("Test error");
    const mockOperation = jest.fn().mockRejectedValue(mockError);

    let value: any;
    await act(async () => {
      value = await result.current.handleAsync(mockOperation);
    });

    expect(value).toBeNull();
    expect(result.current.error).toBe("Test error");
    expect(result.current.isLoading).toBe(false);
    expect(mockEH.logError).toHaveBeenCalledWith(mockError);
  });

  it("should handle async operations with retry", async () => {
    const { result } = renderHook(() => useErrorHandler());

    const operation = jest.fn().mockResolvedValue("success");
    mockEH.withRetry.mockResolvedValueOnce("success" as any);

    let value: any;
    await act(async () => {
      value = await result.current.handleAsyncWithRetry(operation, 3);
    });

    expect(value).toBe("success");
    expect(mockEH.withRetry).toHaveBeenCalledWith(operation, 3);
  });

  it("should clear errors", async () => {
    const { result } = renderHook(() => useErrorHandler());

    // Provocamos un error primero
    const mockOperation = jest.fn().mockRejectedValue(new Error("Boom"));
    await act(async () => {
      await result.current.handleAsync(mockOperation);
    });
    expect(result.current.error).toBe("Boom");

    // Ahora limpiamos el error
    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  it("should set loading state during async operations", async () => {
    const { result } = renderHook(() => useErrorHandler());

    const mockOperation = jest.fn(
      () => new Promise((resolve) => setTimeout(() => resolve("ok"), 100))
    );

    act(() => {
      result.current.handleAsync(mockOperation);
    });
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });

    expect(result.current.isLoading).toBe(false);
  });

  // --------------------
  // EXTRA CASES
  // --------------------

  it("maps ValidationError to its message", async () => {
    const { result } = renderHook(() => useErrorHandler());
    await act(async () => {
      await result.current.handleAsync(() =>
        Promise.reject(new ValidationError("Campos inválidos"))
      );
    });
    expect(result.current.error).toBe("Campos inválidos");
  });

  it("maps NetworkError with statusCode to 'Error de red (XXX)...'", async () => {
    const { result } = renderHook(() => useErrorHandler());
    const err = new NetworkError("net fail", 504);
    await act(async () => {
      await result.current.handleAsync(() => Promise.reject(err));
    });
    expect(result.current.error).toBe(
      "Error de red (504). Intenta nuevamente."
    );
  });

  it("maps NetworkError without statusCode to generic network message", async () => {
    const { result } = renderHook(() => useErrorHandler());
    await act(async () => {
      await result.current.handleAsync(() =>
        Promise.reject(new NetworkError("down"))
      );
    });
    expect(result.current.error).toBe("Error de red. Intenta nuevamente.");
  });

  it("maps StorageError to friendly message", async () => {
    const { result } = renderHook(() => useErrorHandler());
    await act(async () => {
      await result.current.handleAsync(() =>
        Promise.reject(new StorageError("ls error"))
      );
    });
    expect(result.current.error).toBe(
      "No pudimos guardar los datos en tu dispositivo."
    );
  });

  it("keeps the timeout error message as-is", async () => {
    const { result } = renderHook(() => useErrorHandler());
    await act(async () => {
      await result.current.handleAsync(() =>
        Promise.reject(new Error("Timed out after 1000ms"))
      );
    });
    expect(result.current.error).toBe("Timed out after 1000ms");
  });

  it("honors clearPrevError=false (does not clear previous error before success)", async () => {
    const { result } = renderHook(() => useErrorHandler());

    // 1) forzamos un error previo
    await act(async () => {
      await result.current.handleAsync(() =>
        Promise.reject(new Error("Prev error"))
      );
    });
    expect(result.current.error).toBe("Prev error");

    // 2) operación exitosa pero SIN limpiar el error previo
    await act(async () => {
      await result.current.handleAsync(async () => "ok", {
        clearPrevError: false,
      });
    });
    // el error previo persiste
    expect(result.current.error).toBe("Prev error");
  });

  it("calls errorHandler.withTimeout when timeoutMs is provided", async () => {
    const { result } = renderHook(() => useErrorHandler());
    const mockOp = jest.fn().mockResolvedValue("done");

    let out: any;
    await act(async () => {
      out = await result.current.handleAsync(mockOp, { timeoutMs: 1234 });
    });

    expect(out).toBe("done");
    expect((errorHandler.withTimeout as jest.Mock).mock.calls[0][1]).toBe(1234);
  });

  it("fires onSuccess and onError callbacks", async () => {
    const { result } = renderHook(() => useErrorHandler());

    const onSuccess = jest.fn();
    const onError = jest.fn();

    // success path
    await act(async () => {
      await result.current.handleAsync(async () => "ok", { onSuccess });
    });
    expect(onSuccess).toHaveBeenCalledWith("ok");

    // error path
    const e = new Error("Boom");
    await act(async () => {
      await result.current.handleAsync(
        async () => {
          throw e;
        },
        { onError }
      );
    });
    expect(onError).toHaveBeenCalledWith(e);
  });
});
