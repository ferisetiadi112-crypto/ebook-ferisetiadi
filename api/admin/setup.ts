import bcrypt from "bcryptjs";
import { pool, json, methodNotAllowed } from "../_lib/db.js";
export default async function handler(req:any,res:any){
 if(req.method!=="POST")return methodNotAllowed(res,"POST");
 try{
  const count=await pool.query("SELECT COUNT(*)::int AS count FROM admins");
  if(count.rows[0].count>0)return json(res,409,{error:"Admin awal sudah dibuat. Gunakan halaman masuk."});
  const {setupKey,email,password}=req.body??{};
  if(!process.env.SETUP_SECRET||setupKey!==process.env.SETUP_SECRET)return json(res,403,{error:"Kunci setup tidak valid."});
  if(typeof email!=="string"||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof password!=="string"||password.length<12)return json(res,400,{error:"Email harus valid dan kata sandi minimal 12 karakter."});
  const passwordHash=await bcrypt.hash(password,12);
  await pool.query("INSERT INTO admins(email,password_hash) VALUES($1,$2)",[email.toLowerCase(),passwordHash]);
  return json(res,201,{ok:true,message:"Admin pertama berhasil dibuat. Hapus variabel SETUP_SECRET setelah login berhasil."});
 }catch(error){console.error("admin setup failed",error);return json(res,500,{error:"Setup admin gagal. Periksa konfigurasi server."});}
}