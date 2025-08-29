# Tinder Clone ❤️🔥

A simplified Tinder-like app built with **Next.js 15**, **React**, **TypeScript**, and **Material UI (MUI)**.  
Includes swiping functionality, match modal, profile browsing, undo, refresh, and offline/online detection.

---

## 🚀 Features

- Browse and swipe profiles (like/dislike)
- **Match modal** when two profiles like each other
- **Undo last swipe** with snackbar
- **Profile details** with multiple images
- **Matches page** to see connections
- **Offline/online detection** with MUI alerts
- Fully tested with **Jest + React Testing Library**

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/), [React](https://react.dev/)
- **Styling**: [Material UI](https://mui.com/)
- **State Management**: React Context
- **Testing**: Jest + React Testing Library
- **Language**: TypeScript

---

## 📂 Project Structure

```text
app/                 # Next.js App Router
 ├── api/            # Mock API routes
 │   ├── interactions/route.ts
 │   └── profiles/route.ts
 ├── matches/        # Matches page
 ├── layout.tsx      # Root layout
 └── page.tsx        # Landing page

components/          # Reusable UI components
contexts/            # React Context (MatchContext)
hooks/               # Custom hooks
lib/                 # API utils + error handling
__tests__/           # Unit + integration tests
```

---

## 🧪 Testing

Run all tests with coverage:

```bash
npm test -- --coverage
```

Current coverage: ~94% ✅

## ▶️ Getting Started

Clone the repo

```bash
git clone https://github.com/<your-username>/tinder-clone.git
cd tinder-clone
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser 🎉

## 📜 License

This project is licensed under the MIT License.
