import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { prompt } = await req.json();
  if (!prompt) return res.status(400).json({ error: "Prompt kosong" });

  try {
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });
    const imageUrl = result.data[0].url;
    res.status(200).json({ url: imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}