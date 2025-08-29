export type ProfilesResponse = { data: Profile[] };
export type InteractionRequest = {
  fromUserId: string | number;
  toUserId: number;
  action: "like" | "dislike";
};
export type InteractionResponse = { match: boolean };

export type Profile = {
  id: number;
  name: string;
  age: number;
  image: string;
  bio: string;
  images?: string[];
  location?: string;
  interests?: string[];
};

const base = process.env.NEXT_PUBLIC_API_BASE_URL || ""; // '' => /api local

export async function getProfiles(): Promise<ProfilesResponse> {
  const res = await fetch(`${base}/api/profiles`, { cache: "no-store" });
  if (res.status === 204) return { data: [] };
  if (!res.ok) throw new Error("Profiles fetch failed");
  return res.json();
}

export async function postInteraction(
  body: InteractionRequest
): Promise<InteractionResponse> {
  const res = await fetch(`${base}/api/interactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 409) throw new Error("Duplicate like");
    if (res.status === 422) throw new Error("Invalid request");
    throw new Error("Interaction failed");
  }
  return res.json();
}
