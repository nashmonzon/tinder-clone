export interface Profile {
  id: number;
  name: string;
  age: number;
  image: string;
  bio?: string;
}

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: number;
}

export class NetworkError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageError";
  }
}

export const errorHandler = {
  logError: (error: Error, context?: string): void => {
    const errorInfo: AppError = {
      code: error.name,
      message: error.message,
      details: { context, stack: error.stack },
      timestamp: Date.now(),
    };
    console.error("App Error:", errorInfo);
  },

  withRetry: async <T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> => {
    let lastError: Error = new Error("Unknown error");
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (err) {
        lastError = err as Error;
        errorHandler.logError(lastError, `Attempt ${attempt}/${maxRetries}`);
        if (attempt === maxRetries) throw lastError;
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, attempt - 1))
        );
      }
    }
    throw lastError;
  },

  withTimeout: async <T>(
    operation: () => Promise<T>,
    timeoutMs = 10000
  ): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      );
    });
    return Promise.race([operation(), timeoutPromise]);
  },

  validateProfile: (profile: unknown): boolean => {
    if (!profile || typeof profile !== "object") {
      throw new ValidationError("Profile must be an object");
    }
    const p = profile as Partial<Profile>;

    if (!p.id || typeof p.id !== "number") {
      throw new ValidationError("Profile must have a valid ID", "id");
    }
    if (!p.name || typeof p.name !== "string" || p.name.trim().length === 0) {
      throw new ValidationError("Profile must have a valid name", "name");
    }
    if (!p.age || typeof p.age !== "number" || p.age < 18 || p.age > 100) {
      throw new ValidationError(
        "Profile must have a valid age (18-100)",
        "age"
      );
    }
    if (!p.image || typeof p.image !== "string") {
      throw new ValidationError("Profile must have a valid image URL", "image");
    }
    return true;
  },

  safeLocalStorage: {
    getItem: (key: string): string | null => {
      try {
        return localStorage.getItem(key);
      } catch {
        errorHandler.logError(
          new StorageError(`Failed to read from localStorage: ${key}`)
        );
        return null;
      }
    },
    setItem: (key: string, value: string): boolean => {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        errorHandler.logError(
          new StorageError(`Failed to write to localStorage: ${key}`)
        );
        return false;
      }
    },
    removeItem: (key: string): boolean => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch {
        errorHandler.logError(
          new StorageError(`Failed to remove from localStorage: ${key}`)
        );
        return false;
      }
    },
  },
};
