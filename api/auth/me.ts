import { pool, json, methodNotAllowed, adminFromRequest, clearCookie, hash } from "../_lib/db.js";
export default async function handler(req:any,res:any){
 if(req.method==="GET"){try{const admin=await adminFromRequest(req);return json(res,200,{authenticated:!!admin,admin:admin?{email:admin.email}:null});}catch{return json(res,500,{error:"Tidak dapat memeriksa sesi."});}}
 if(req.method==="DELETE"){const raw=String(req.headers.cookie??"").split(";").map((v:string)=>v.trim()).find((v:string)=>v.startsWith("ebook_session="))?.slice("ebook_session=".length);if(raw)await pool.query("DELETE FROM admin_sessions WHERE token_hash=$1",[hash(decodeURIComponent(raw))]).catch(()=>undefined);clearCookie(res);return json(res,200,{ok:true});}
 return methodNotAllowed(res,"GET, DELETE");
}