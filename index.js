import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import formidable from 'formidable';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ===== Generate AI =====
export async function POST(req) {
  const body = await req.json();
  const prompt = body.prompt;
  if (!prompt) return new Response(JSON.stringify({ error: "Prompt kosong" }), { status: 400 });

  try {
    const res = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: "1024x1024",
    });
    const imageUrl = res.data[0].url;
    return new Response(JSON.stringify({ url: imageUrl }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// ===== Upload File =====
export const config = { api: { bodyParser: false } };

export async function PUT(req) { // gunakan PUT untuk upload
  const form = formidable({ multiples: false, uploadDir: '/tmp', keepExtensions: true });
  
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return resolve(new Response(JSON.stringify({ error: err.message }), { status: 500 }));
      const file = files.file;
      if (!file) return resolve(new Response(JSON.stringify({ error: "File tidak ada" }), { status: 400 }));

      const fileName = uuidv4() + path.extname(file.originalFilename);
      const filePath = path.join('/tmp', fileName);
      fs.renameSync(file.filepath, filePath);

      // di Vercel, gunakan URL publik sesuai deploy / atau pindahkan ke Cloudinary/S3
      const fileUrl = `/tmp/${fileName}`; 
      resolve(new Response(JSON.stringify({ url: fileUrl }), { status: 200 }));
    });
  });
}