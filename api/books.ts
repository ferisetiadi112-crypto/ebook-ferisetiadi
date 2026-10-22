import { pool, json, methodNotAllowed, adminFromRequest, cleanBook, slugify } from "./_lib/db.js";
export default async function handler(req:any,res:any){
 try{
  if(req.method==="GET"){const admin=await adminFromRequest(req);const result=admin?await pool.query("SELECT * FROM books ORDER BY created_at DESC"):await pool.query("SELECT * FROM books WHERE status='published' ORDER BY featured DESC,published_at DESC NULLS LAST,created_at DESC");return json(res,200,{books:result.rows.map(cleanBook)});}
  if(req.method!=="POST")return methodNotAllowed(res,"GET, POST");
  const admin=await adminFromRequest(req);if(!admin)return json(res,401,{error:"Silakan login sebagai admin."});
  const b=req.body??{};const title=String(b.title??"").trim();const pdfUrl=String(b.pdfUrl??"").trim();
  if(!title||!pdfUrl||!pdfUrl.startsWith("https://"))return json(res,400,{error:"Judul dan PDF yang sudah diunggah wajib diisi."});
  const category=String(b.category||"Umum").trim();let slug=slugify(String(b.slug||title));const existing=await pool.query("SELECT slug,category FROM books WHERE slug=$1 LIMIT 1",[slug]);if(existing.rowCount){if(String(existing.rows[0].category||"").trim().toLocaleLowerCase()===category.toLocaleLowerCase())return json(res,409,{error:"Judul dengan kategori ini sudah ada. Jika kategorinya berbeda, pilih kategori lain."});const categorySlug=slugify(title+"-"+category);slug=categorySlug;let suffix=2;while((await pool.query("SELECT 1 FROM books WHERE slug=$1 LIMIT 1",[slug])).rowCount){slug=categorySlug+"-"+suffix++;}}const status=b.status==="published"?"published":"draft";
  const result=await pool.query(`INSERT INTO books(slug,title,subtitle,author,category,publication_year,description,cover_url,pdf_blob_path,page_count,status,featured,published_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,CASE WHEN $11='published' THEN NOW() ELSE NULL END) RETURNING *`,[slug,title,String(b.subtitle??""),String(b.author||"Feri Setiadi"),category,Number(b.year)||new Date().getFullYear(),String(b.description??""),String(b.cover??""),pdfUrl,Math.max(0,Number(b.pages)||0),status,Boolean(b.featured)]);
  return json(res,201,{book:cleanBook(result.rows[0])});
 }catch(error:any){console.error("books API failed",error);if(error?.code==="23505")return json(res,409,{error:"Slug buku sudah digunakan. Ubah slug atau judul."});return json(res,500,{error:"Gagal menyimpan buku."});}
}