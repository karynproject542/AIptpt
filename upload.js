import formidable from "formidable";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const form = formidable({ multiples: false, uploadDir: "/tmp", keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const file = files.file;
    if (!file) return res.status(400).json({ error: "File tidak ada" });

    const fileName = uuidv4() + path.extname(file.originalFilename);
    const filePath = path.join("/tmp", fileName);
    fs.renameSync(file.filepath, filePath);

    // Vercel: /tmp hanya sementara, pindahkan ke Cloudinary/S3 jika mau permanen
    const fileUrl = `/tmp/${fileName}`;
    res.status(200).json({ url: fileUrl });
  });
}