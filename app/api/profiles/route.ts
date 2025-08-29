import { NextResponse } from "next/server";

type Profile = {
  id: number;
  name: string;
  age: number;
  image: string;
  bio: string;
  images?: string[];
  location?: string;
  interests?: string[];
};

const PROFILES: Profile[] = [
  {
    id: 1,
    name: "Sarah",
    age: 21,
    image: "/girl-1.jpg",
    bio: "Love hiking and coffee ☕",
    location: "2 miles away",
    interests: ["hiking", "coffee", "photography"],
  },
  {
    id: 2,
    name: "Jessica",
    age: 23,
    image: "/girl-2.png",
    images: ["/girl-24.png", "/girl-22.png", "/girl-23.png", "/girl-25.png"],
    bio: "Artist and dog lover 🎨🐕",
    location: "5 miles away",
    interests: ["art", "dogs", "music"],
  },
  {
    id: 3,
    name: "Emma",
    age: 25,
    image: "/girl-3.jpg",
    bio: "Yoga instructor and foodie 🧘‍♀️",
    location: "3 miles away",
    interests: ["yoga", "cooking", "travel"],
  },
  {
    id: 4,
    name: "Olivia",
    age: 24,
    image: "/girl-4.jpg",
    bio: "Marketing professional who loves weekend adventures",
    location: "1 mile away",
    interests: ["marketing", "adventure", "wine"],
  },
  {
    id: 5,
    name: "Sophia",
    age: 26,
    image: "/girl-5.jpg",
    bio: "Bookworm and coffee enthusiast",
    location: "4 miles away",
    interests: ["reading", "coffee", "writing"],
  },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET() {
  await sleep(300);
  if (PROFILES.length === 0) {
    return new NextResponse(null, { status: 204 });
  }
  return NextResponse.json({ data: PROFILES }, { status: 200 });
}
