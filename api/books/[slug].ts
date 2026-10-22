import { pool, json, methodNotAllowed, adminFromRequest, cleanBook } from "../_lib/db.js";
export default async function handler(req:any,res:any){
 try{
  const admin=await adminFromRequest(req);if(!admin)return json(res,401,{error:"Silakan login sebagai admin."});
  const slug=String(req.query?.slug??"");
  if(req.method==="PATCH"){
   const b=req.body??{};const status=b.status==="published"?"published":"draft";
   const r=await pool.query(`UPDATE books SET title=COALESCE($2,title),subtitle=COALESCE($3,subtitle),author=COALESCE($4,author),category=COALESCE($5,category),publication_year=COALESCE($6,publication_year),description=COALESCE($7,description),cover_url=COALESCE($8,cover_url),status=$9,featured=COALESCE($10,featured),published_at=CASE WHEN $9='published' THEN COALESCE(published_at,NOW()) ELSE NULL END,updated_at=NOW() WHERE slug=$1 RETURNING *`,[slug,b.title??null,b.subtitle??null,b.author??null,b.category??null,b.year?Number(b.year):null,b.description??null,b.cover??null,status,b.featured===undefined?null:Boolean(b.featured)]);
   if(!r.rowCount)return json(res,404,{error:"Buku tidak ditemukan."});return json(res,200,{book:cleanBook(r.rows[0])});
  }
  if(req.method==="DELETE"){const r=await pool.query("DELETE FROM books WHERE slug=$1 RETURNING id",[slug]);if(!r.rowCount)return json(res,404,{error:"Buku tidak ditemukan."});return json(res,200,{ok:true});}
  return methodNotAllowed(res,"PATCH, DELETE");
 }catch(error){console.error("book update failed",error);return json(res,500,{error:"Perubahan buku gagal."});}
}