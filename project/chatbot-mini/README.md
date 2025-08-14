# Chatbot Mini

A lightweight chatbot bubble that appears across all screens (bottom-right) and answers user questions using the local knowledge base (RAG) from the AI system. If an answer cannot be provided, it responds with a safe fallback message.

## Backend (API)
- Location: `project/chatbot-mini`
- Endpoint: `POST /chat` with JSON: `{ "message": string, "userId?": string }`
- Returns: `{ answer: string, sources: Array<{source: string}>, confidence: number }`
- Uses the AI system's local embeddings and knowledge base for retrieval.

### Development
```bash
cd project/chatbot-mini
npm ci
npm run dev
```

Ensure you have built embeddings:
```bash
cd ../ai-system/ai
npm run embeddings:build
```

## Frontend Integration
- Component: `project/frontend/ucost-discovery-hub/src/components/ChatbotBubble.tsx`
- Renders a glowing, color-changing bubble at bottom-right with hover effect; opens a chat panel.
- Configure API URL via env `VITE_CHATBOT_API_URL` (defaults to `http://localhost:4321`).

Add to `App.tsx`:
```tsx
import { ChatbotBubble } from './components/ChatbotBubble';

function App() {
  return (
    <>
      {/* existing app */}
      <ChatbotBubble />
    </>
  );
}
```

## Fallback Policy
If no relevant data or restricted content is detected, the bot replies:
"We’re not allowed to answer this or we have no data yet. Your request was recorded and we’ll update soon."