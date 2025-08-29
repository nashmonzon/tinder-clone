// __tests__/api/profiles.test.ts
/**
 * Testea /api/profiles/route.ts
 * Cobertura: camino 200 + espera del sleep(300).
 * Nota: el branch 204 (sin datos) no es accesible sin poder mutar PROFILES
 * definido dentro del módulo. Si querés cubrirlo, después te paso una variante
 * exportando un setter sólo para tests o moviendo PROFILES a un módulo mockeable.
 */

jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      data,
    }),
  },
}));

import { GET } from "@/app/api/profiles/route";

describe("GET /api/profiles", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it("devuelve 200 y la lista de perfiles (respeta el delay)", async () => {
    // Llamamos sin avanzar timers: la promesa queda pendiente
    const pending = GET();

    // Avanzamos justo el delay del sleep para resolver
    jest.advanceTimersByTime(300);

    const res: any = await pending;

    expect(res.status).toBe(200);
    expect(res.data).toBeDefined();
    expect(Array.isArray(res.data.data)).toBe(true);

    const list = res.data.data;
    expect(list.length).toBeGreaterThan(0);

    // Chequeos básicos del primer item
    const first = list[0];
    expect(first).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      age: expect.any(Number),
      image: expect.any(String),
      bio: expect.any(String),
    });

    // Campos opcionales cuando existen
    if (first.location) {
      expect(typeof first.location).toBe("string");
    }
    if (first.interests) {
      expect(Array.isArray(first.interests)).toBe(true);
    }
    if (first.images) {
      expect(Array.isArray(first.images)).toBe(true);
    }
  });
});
