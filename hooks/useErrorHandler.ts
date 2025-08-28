"use client";
import { useState, useCallback } from "react";
import {
  errorHandler,
  NetworkError,
  ValidationError,
  StorageError,
} from "@/lib/errorHandler";

interface UseErrorHandlerReturn {
  error: string | null;
  isLoading: boolean;
  clearError: () => void;
  handleAsync: <T>(
    operation: () => Promise<T>,
    opts?: {
      timeoutMs?: number;
      onSuccess?: (data: T) => void;
      onError?: (e: Error) => void;
      clearPrevError?: boolean;
    }
  ) => Promise<T | null>;
  handleAsyncWithRetry: <T>(
    operation: () => Promise<T>,
    maxRetries?: number,
    opts?: {
      timeoutMs?: number;
      onSuccess?: (data: T) => void;
      onError?: (e: Error) => void;
      clearPrevError?: boolean;
    }
  ) => Promise<T | null>;
}

function toUserMessage(err: Error): string {
  if (err instanceof ValidationError) return err.message || "Datos inválidos.";
  if (err instanceof NetworkError) {
    const sc = (err as NetworkError).statusCode;
    return sc
      ? `Error de red (${sc}). Intenta nuevamente.`
      : "Error de red. Intenta nuevamente.";
  }
  if (err instanceof StorageError)
    return "No pudimos guardar los datos en tu dispositivo.";
  // Timeout genérico
  if (/timed out/i.test(err.message)) return err.message;
  return err.message || "Ocurrió un error. Intenta nuevamente.";
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  const _run = useCallback(
    async <T>(
      runner: () => Promise<T>,
      opts?: {
        timeoutMs?: number;
        onSuccess?: (data: T) => void;
        onError?: (e: Error) => void;
        clearPrevError?: boolean;
      }
    ): Promise<T | null> => {
      const {
        timeoutMs,
        onSuccess,
        onError,
        clearPrevError = true,
      } = opts || {};
      try {
        setIsLoading(true);
        if (clearPrevError) setError(null);

        const op = timeoutMs
          ? () => errorHandler.withTimeout(runner, timeoutMs)
          : runner;
        const result = await op();

        onSuccess?.(result);
        return result;
      } catch (e) {
        const err = e as Error;
        errorHandler.logError(err);
        const msg = toUserMessage(err);
        setError(msg);
        onError?.(err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleAsync = useCallback(
    async <T>(
      operation: () => Promise<T>,
      opts?: {
        timeoutMs?: number;
        onSuccess?: (data: T) => void;
        onError?: (e: Error) => void;
        clearPrevError?: boolean;
      }
    ) => _run(operation, opts),
    [_run]
  );

  const handleAsyncWithRetry = useCallback(
    async <T>(
      operation: () => Promise<T>,
      maxRetries = 3,
      opts?: {
        timeoutMs?: number;
        onSuccess?: (data: T) => void;
        onError?: (e: Error) => void;
        clearPrevError?: boolean;
      }
    ) => {
      return _run<T>(() => errorHandler.withRetry(operation, maxRetries), opts);
    },
    [_run]
  );

  return { error, isLoading, clearError, handleAsync, handleAsyncWithRetry };
}
