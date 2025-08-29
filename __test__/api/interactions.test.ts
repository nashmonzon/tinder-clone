// __tests__/api/interactions.test.ts
/**
 * Testea /api/interactions/route.ts
 * Cubrimos: dislike (201/false), like (201/false), like duplicado (409),
 * like recíproco (201/true) e inválidos (422).
 */

jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      data,
    }),
  },
}));

// ⚠️ Como la ruta guarda estado en un Set a nivel módulo, reseteamos módulos
// entre tests para empezar con un Set limpio.
const importRoute = async () => {
  jest.resetModules();
  const mod = await import("@/app/api/interactions/route");
  return mod.POST as (req: any) => Promise<{ status: number; data: any }>;
};

const req = (body: any) => ({ json: async () => body });
const badJsonReq = () => ({
  json: async () => {
    throw new Error("bad json");
  },
});

describe("POST /api/interactions", () => {
  it("dislike -> 201 { match:false }", async () => {
    const POST = await importRoute();
    const res = await POST(
      req({ fromUserId: 1, toUserId: 2, action: "dislike" })
    );
    expect(res.status).toBe(201);
    expect(res.data).toEqual({ match: false });
  });

  it("primer like (A->B) -> 201 { match:false }", async () => {
    const POST = await importRoute();
    const res = await POST(req({ fromUserId: 1, toUserId: 2, action: "like" }));
    expect(res.status).toBe(201);
    expect(res.data).toEqual({ match: false });
  });

  it("like duplicado (A->B dos veces) -> 409 Duplicate like", async () => {
    const POST = await importRoute();
    await POST(req({ fromUserId: 1, toUserId: 2, action: "like" }));
    const res2 = await POST(
      req({ fromUserId: 1, toUserId: 2, action: "like" })
    );
    expect(res2.status).toBe(409);
    expect(res2.data).toHaveProperty("error", "Duplicate like");
  });

  it("like recíproco (A->B luego B->A) -> 201 { match:true }", async () => {
    const POST = await importRoute();
    await POST(req({ fromUserId: 1, toUserId: 2, action: "like" })); // A->B
    const res = await POST(req({ fromUserId: 2, toUserId: 1, action: "like" })); // B->A
    expect(res.status).toBe(201);
    expect(res.data).toEqual({ match: true });
  });

  it("request con JSON inválido -> 422 Invalid JSON", async () => {
    const POST = await importRoute();
    const res = await POST(badJsonReq());
    expect(res.status).toBe(422);
    expect(res.data).toHaveProperty("error", "Invalid JSON");
  });

  it("body inválido (campos faltantes/acción inválida) -> 422 Invalid request body", async () => {
    const POST = await importRoute();
    const res = await POST(
      req({ fromUserId: 1, toUserId: 2, action: "foo" as any })
    );
    expect(res.status).toBe(422);
    expect(res.data).toHaveProperty("error", "Invalid request body");
  });
});
