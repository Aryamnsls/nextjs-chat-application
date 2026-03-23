# Chat Nova - Next.js Production Grade Chat Application

A sleek, responsive, and robust Next.js Chat Application built from scratch following modern design principles. It features a custom glassmorphism UI, a dynamic typing indicator, and smooth animations without relying on heavy external CSS frameworks (developed with Vanilla CSS properties).

## Features

- ⚛️ **Next.js App Router**: Utilizing the latest React Server Components and Client Components structure.
- 🎨 **Custom Vanilla CSS System**: A highly optimized styling system with fluid responsive layouts and no external bloated CSS libraries. Built-in support for multiple color schemes including a premium Dark Mode.
- 💬 **Interactive Chat Interface**: Mimics production-grade AI applications with dedicated user/assistant message bubbles, avatar indicators, and auto-scroll to latest messages.
- ⏳ **Simulated AI Processing**: Includes dynamic loading/typing animations using pure CSS keyframes with simulated latency mimicking API network requests.
- 📱 **Mobile Responsive Layouts**: Carefully crafted to adapt across various screen sizes.

## Project Structure

```bash
src/
├── app/
│   ├── layout.tsx     # The Root Application Layout 
│   ├── page.tsx       # The Core Interactive Chat Interface (Client Component)
│   ├── globals.css    # Premium Custom Design Definitions (CSS Variables, Typography, Glassmorphism, Animations)
│   └── api/
│       └── chat/      # API Routes infrastructure prepared for LLM integrations (e.g. Gemini, OpenAI)
```

## Getting Started

1. **Install dependencies:**
```bash
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Future Enhancements & AI Integration (Vercel AI SDK)

To upgrade the simulated responses into real LLM integrations (like Google Gemini):
1. Install the Vercel AI SDK: `npm i ai @ai-sdk/google`
2. Create `src/app/api/chat/route.ts` to securely handle the API key:
```typescript
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: google('gemini-1.5-pro-latest'),
    messages,
  });
  return result.toDataStreamResponse();
}
```
3. Update `page.tsx` to handle the streaming hooks.
