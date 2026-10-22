import bcrypt from "bcryptjs";
import { pool, json, methodNotAllowed, hash, newToken, cookie } from "../_lib/db.js";
export default async function handler(req:any,res:any){
 if(req.method!=="POST")return methodNotAllowed(res,"POST");
 try{
  const {email,password}=req.body??{};
  if(typeof email!=="string"||typeof password!=="string")return json(res,400,{error:"Email dan kata sandi wajib diisi."});
  const found=await pool.query("SELECT id,email,password_hash FROM admins WHERE email=$1",[email.toLowerCase()]);
  const admin=found.rows[0];
  if(!admin||!(await bcrypt.compare(password,admin.password_hash)))return json(res,401,{error:"Email atau kata sandi tidak sesuai."});
  const token=newToken();
  await pool.query("INSERT INTO admin_sessions(admin_id,token_hash,expires_at) VALUES($1,$2,NOW()+INTERVAL '7 days')",[admin.id,hash(token)]);
  await pool.query("UPDATE admins SET last_login_at=NOW() WHERE id=$1",[admin.id]);
  cookie(res,token,7*24*60*60);
  return json(res,200,{ok:true,admin:{email:admin.email}});
 }catch(error){console.error("admin login failed",error);return json(res,500,{error:"Login gagal. Periksa konfigurasi server."});}
}