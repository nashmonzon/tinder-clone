import { NextResponse } from "next/server";

type InteractionRequest = {
  fromUserId: string | number;
  toUserId: number;
  action: "like" | "dislike";
};

const likes = new Set<string>();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  await sleep(200);

  let body: InteractionRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 422 });
  }

  const { fromUserId, toUserId, action } = body || ({} as InteractionRequest);
  if (
    (typeof fromUserId !== "string" && typeof fromUserId !== "number") ||
    typeof toUserId !== "number" ||
    (action !== "like" && action !== "dislike")
  ) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 422 }
    );
  }

  if (action === "dislike") {
    return NextResponse.json({ match: false }, { status: 201 });
  }

  const key = `${fromUserId}->${toUserId}`;
  if (likes.has(key)) {
    return NextResponse.json({ error: "Duplicate like" }, { status: 409 });
  }
  likes.add(key);

  const reciprocal = `${toUserId}->${fromUserId}`;
  const isMatch = likes.has(reciprocal);

  return NextResponse.json({ match: isMatch }, { status: 201 });
}
