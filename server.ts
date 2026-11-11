import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const ai = new GoogleGenAI();

// API: Parse voice transcript using Gemini 3.8 Flash
app.post('/api/parse-voice', async (req, res) => {
  try {
    const { transcript, activeBuyer, activeRate } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const systemPrompt = `You are an expert assistant for a poultry farm (পোল্ট্রি খামার) weighing and sales app in Bangladesh.
The farm owner speaks while weighing chickens lot by lot (দাঁড়ি / খাঁচা অনুযায়ী ওজন).
Input will be a spoken Bengali phrase, such as:
- "নাইম ৩৫ কেজি ২০০ গ্রাম"
- "দাঁড়ি ৩ করিম ৪২ কেজি ৫০০ গ্রাম দর ১৬০"
- "বাবু ৩৮ কেজি"
- "৩৫ কেজি ৭৫০ গ্রাম"
- "খাঁচা ৪ নাইমরে দিলাম পঁয়ত্রিশ কেজি আড়াইশ গ্রাম দর ১৭০ টাকা"

Extract the structured details in JSON:
{
  "buyerName": string | null, // e.g., "নাইম", "করিম", "বাবু" or null if not mentioned
  "dariNumber": number | null, // e.g. 1, 2, 3... if mentioned
  "kg": number, // integer kg part (convert Bengali numerals or words like পঁয়ত্রিশ -> 35)
  "grams": number, // integer gram part, between 0 and 999 (e.g. আড়াইশ -> 250, পৌনে এক কেজি -> 750, etc.). If not mentioned, 0.
  "totalWeightKg": number, // total in kg with decimals, e.g. 35.2
  "ratePerKg": number | null, // price per kg if mentioned (দর / টাকা)
  "birdCount": number | null, // number of birds if mentioned (e.g. "১২ টা মুরগী" -> 12)
  "tareWeightKg": number | null, // empty crate tare deduction if mentioned
  "isWeighingEntry": boolean // true if this represents a chicken weighing entry
}

Current active buyer (fallback if not mentioned): "${activeBuyer || ''}"
Current active rate (fallback if not mentioned): ${activeRate || 'null'}

Output strictly valid JSON only. Do not add markdown backticks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Spoken transcript: "${transcript}"` }],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Clean up markdown fences if any
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error in /api/parse-voice:', err);
    return res.status(500).json({ error: err.message || 'Failed to parse voice' });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Poultry Farm Weighing App running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
