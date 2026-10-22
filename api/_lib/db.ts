import { Pool } from "pg";
import { createHash, randomBytes } from "node:crypto";
const globalForPool = globalThis as typeof globalThis & { ebookPool?: Pool };
export const pool = globalForPool.ebookPool ?? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });
if (process.env.NODE_ENV !== "production") globalForPool.ebookPool = pool;
export function json(res: any, status: number, payload: unknown) { res.status(status).setHeader("Content-Type", "application/json; charset=utf-8").end(JSON.stringify(payload)); }
export function methodNotAllowed(res: any, allow: string) { res.setHeader("Allow", allow); json(res, 405, { error: "Metode tidak diizinkan." }); }
export function hash(value: string) { return createHash("sha256").update(value).digest("hex"); }
export function newToken() { return randomBytes(32).toString("hex"); }
export function cookie(res: any, value: string, maxAge: number) { res.setHeader("Set-Cookie", `ebook_session=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`); }
export function clearCookie(res: any) { res.setHeader("Set-Cookie", "ebook_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"); }
export async function adminFromRequest(req: any) {
 const raw=String(req.headers.cookie??"").split(";").map((v:string)=>v.trim()).find((v:string)=>v.startsWith("ebook_session="))?.slice("ebook_session=".length);
 if(!raw)return null;
 const result=await pool.query("SELECT a.id,a.email FROM admin_sessions s JOIN admins a ON a.id=s.admin_id WHERE s.token_hash=$1 AND s.expires_at>NOW()",[hash(decodeURIComponent(raw))]);
 return result.rows[0]??null;
}
export function slugify(value:string){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,90)||"buku";}
export function cleanBook(row:any){const storedCover=String(row.cover_url??"");const cover=/\\.blob\\.vercel-storage\\.com\\//i.test(storedCover)?`/api/books/${encodeURIComponent(row.slug)}/cover`:storedCover;return {id:row.id,slug:row.slug,title:row.title,subtitle:row.subtitle,author:row.author,category:row.category,year:row.publication_year,description:row.description,cover,pages:row.page_count,status:row.status,featured:row.featured,createdAt:row.created_at,publishedAt:row.published_at};}
