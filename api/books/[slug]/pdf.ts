import { get } from "@vercel/blob";
import { pool, json, adminFromRequest } from "../../_lib/db.js";
export default async function handler(req:any,res:any){
 if(req.method!=="GET"){res.setHeader("Allow","GET");return json(res,405,{error:"Metode tidak diizinkan."});}
 try{
  const slug=String(req.query?.slug??"");const admin=await adminFromRequest(req);
  const found=await pool.query("SELECT title,pdf_blob_path,status FROM books WHERE slug=$1 AND ($2::boolean OR status='published')",[slug,!!admin]);
  const book=found.rows[0];if(!book)return json(res,404,{error:"PDF tidak ditemukan."});
  // Database versi awal menyimpan URL Blob lengkap; get() membutuhkan pathname Blob.
  const storedPath=String(book.pdf_blob_path??"");
  let blobPath=storedPath;
  if(/^https?:\/\//i.test(storedPath)){
   try{blobPath=decodeURIComponent(new URL(storedPath).pathname).replace(/^\/+/, "");}
   catch{ return json(res,500,{error:"Alamat PDF di database tidak valid."}); }
  }
  const result:any=await get(blobPath,{access:"private"});
  if(!result?.stream)return json(res,404,{error:"Berkas PDF tidak tersedia."});
  res.setHeader("Content-Type","application/pdf");res.setHeader("Content-Disposition",`inline; filename="${String(book.title).replace(/[^a-zA-Z0-9 _-]/g,"").slice(0,80)}.pdf"`);res.setHeader("Cache-Control","private, max-age=60");
  const stream=result.stream;
  if(typeof stream.pipe==="function")stream.pipe(res);else {const reader=stream.getReader();while(true){const {done,value}=await reader.read();if(done)break;res.write(value);}res.end();}
 }catch(error){console.error("PDF stream failed",error);return json(res,500,{error:"PDF belum dapat dibaca. Periksa konfigurasi Blob."});}
}