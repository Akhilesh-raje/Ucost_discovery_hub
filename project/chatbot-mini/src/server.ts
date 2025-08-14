import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { LocalHashEmbeddingProvider } from '../../ai-system/ai/src/embedding/EmbeddingProvider';
import { LocalVectorStore } from '../../ai-system/ai/src/vector/LocalVectorStore';
import { AI_CONFIG } from '../../ai-system/ai/src/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 4321);

// Initialize embedding + stores
const embedder = new LocalHashEmbeddingProvider(256);
const exhibitStore = new LocalVectorStore<{ type: string }>(256, path.join(process.cwd(), 'project', 'ai-system', 'ai', AI_CONFIG.embeddingsDir, 'exhibit_vectors.json'));
const kbStore = new LocalVectorStore<{ type: string; path: string }>(256, path.join(process.cwd(), 'project', 'ai-system', 'ai', AI_CONFIG.embeddingsDir, 'kb_vectors.json'));

function sanitize(text: string): string {
  return (text || '').replace(/\s+/g, ' ').trim();
}

app.post('/chat', async (req, res) => {
  try {
    const message: string = req.body?.message || '';
    if (!message || message.length < 2) {
      return res.json({ answer: 'Please provide a question.', sources: [], confidence: 0 });
    }

    const [qvec] = await embedder.embed([message]);

    // Search both stores
    const exhibitHits = await exhibitStore.search(qvec, AI_CONFIG.exhibitTopK);
    const kbHits = await kbStore.search(qvec, AI_CONFIG.kbTopK);

    const topExhibit = exhibitHits[0];
    const topKb = kbHits[0];

    if (!topExhibit && !topKb) {
      return res.json({
        answer: 'We’re not allowed to answer this or we have no data yet. Your request was recorded and we’ll update soon.',
        sources: [],
        confidence: 0
      });
    }

    const top = [topExhibit, topKb].filter(Boolean).sort((a: any, b: any) => b.score - a.score)[0] as any;
    const answer = `Based on our data, here’s what we found related to your question. ${sanitize(top?.meta?.path || top?.id || '')}`.trim();

    res.json({
      answer: answer || 'We’re not allowed to answer this or we have no data yet. Your request was recorded and we’ll update soon.',
      sources: [
        ...exhibitHits.slice(0, 3).map(h => ({ source: h.id })),
        ...kbHits.slice(0, 3).map(h => ({ source: h.id }))
      ],
      confidence: Math.max(0, Math.min(1, (top?.score ?? 0)))
    });
  } catch (err) {
    res.json({
      answer: 'We’re not allowed to answer this or we have no data yet. Your request was recorded and we’ll update soon.',
      sources: [],
      confidence: 0
    });
  }
});

app.listen(PORT, () => {
  console.log(`Chatbot Mini listening on http://localhost:${PORT}`);
});