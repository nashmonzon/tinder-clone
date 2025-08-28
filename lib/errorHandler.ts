export interface AppError {
  code: string;
  message: string;
  details?: any;
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
  // Log errors to console and external service
  logError: (error: Error, context?: string) => {
    const errorInfo: AppError = {
      code: error.name,
      message: error.message,
      details: { context, stack: error.stack },
      timestamp: Date.now(),
    };

    console.error("App Error:", errorInfo);

    // In production, send to error reporting service
    if (process.env.NODE_ENV === "production") {
      // reportToService(errorInfo)
    }
  },

  withRetry: async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        errorHandler.logError(lastError, `Attempt ${attempt}/${maxRetries}`);

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, attempt - 1))
        );
      }
    }

    throw lastError!;
  },

  withTimeout: async <T>(
    operation: () => Promise<T>,
    timeoutMs: number = 10000
  ): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      );
    });

    return Promise.race([operation(), timeoutPromise]);
  },
  validateProfile: (profile: any): boolean => {
    if (!profile || typeof profile !== "object") {
      throw new ValidationError("Profile must be an object");
    }

    if (!profile.id || typeof profile.id !== "number") {
      throw new ValidationError("Profile must have a valid ID", "id");
    }

    if (
      !profile.name ||
      typeof profile.name !== "string" ||
      profile.name.trim().length === 0
    ) {
      throw new ValidationError("Profile must have a valid name", "name");
    }

    if (
      !profile.age ||
      typeof profile.age !== "number" ||
      profile.age < 18 ||
      profile.age > 100
    ) {
      throw new ValidationError(
        "Profile must have a valid age (18-100)",
        "age"
      );
    }

    if (!profile.image || typeof profile.image !== "string") {
      throw new ValidationError("Profile must have a valid image URL", "image");
    }

    return true;
  },
  safeLocalStorage: {
    getItem: (key: string): string | null => {
      try {
        return localStorage.getItem(key);
      } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
        errorHandler.logError(
          new StorageError(`Failed to remove from localStorage: ${key}`)
        );
        return false;
      }
    },
  },
};
