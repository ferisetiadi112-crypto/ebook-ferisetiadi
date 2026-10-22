import { get } from "@vercel/blob";
import { pool, json, adminFromRequest } from "../../_lib/db.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Metode tidak diizinkan." });
  }
  try {
    const slug = String(req.query?.slug ?? "");
    const admin = await adminFromRequest(req);
    const found = await pool.query(
      "SELECT cover_url,status FROM books WHERE slug=$1 AND ($2::boolean OR status='published')",
      [slug, !!admin],
    );
    const book = found.rows[0];
    if (!book?.cover_url) return json(res, 404, { error: "Sampul tidak ditemukan." });

    const storedUrl = String(book.cover_url);
    let blobPath = storedUrl;
    if (/^https?:\/\//i.test(storedUrl)) {
      try {
        const parsed = new URL(storedUrl);
        if (!/\.blob\.vercel-storage\.com$/i.test(parsed.hostname)) {
          return json(res, 404, { error: "Sampul tidak tersimpan di Blob." });
        }
        blobPath = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
      } catch {
        return json(res, 500, { error: "Alamat sampul tidak valid." });
      }
    }

    const result: any = await get(blobPath, { access: "private" });
    if (!result?.stream) return json(res, 404, { error: "Berkas sampul tidak tersedia." });

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Disposition", "inline");
    if (book.status === "published") {
      res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
      res.setHeader("Vercel-CDN-Cache-Control", "public, s-maxage=2592000, stale-while-revalidate=604800");
    } else {
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("Vercel-CDN-Cache-Control", "no-store");
    }
    const stream = result.stream;
    if (typeof stream.pipe === "function") stream.pipe(res);
    else {
      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    }
  } catch (error) {
    console.error("book cover stream failed", error);
    return json(res, 500, { error: "Sampul belum dapat dibaca dari Blob." });
  }
}
