import { handleUpload } from "@vercel/blob/client";
import { adminFromRequest, json } from "./_lib/db.js";
export default async function handler(req:any,res:any){
 if(req.method!=="POST"){res.setHeader("Allow","POST");return json(res,405,{error:"Metode tidak diizinkan."});}
 try{
  const admin=await adminFromRequest(req);
  if(!admin)return json(res,401,{error:"Login admin diperlukan untuk mengunggah berkas."});
  const body=req.body;
  const jsonResponse=await handleUpload({
   body, request:req,
   onBeforeGenerateToken:async(_pathname:string,clientPayload?:string)=>{
    const payload=clientPayload?JSON.parse(clientPayload):{};
    if(payload.kind!=="book-pdf")throw new Error("Jenis unggahan tidak diizinkan.");
    return {allowedContentTypes:["application/pdf"],maximumSizeInBytes:50*1024*1024,addRandomSuffix:true,access:"private"};
   },
   onUploadCompleted:async()=>{}
  } as any);
  return res.status(200).json(jsonResponse);
 }catch(error){console.error("blob upload failed",error);return json(res,400,{error:"Unggahan gagal. Pastikan Vercel Blob sudah terhubung dan ukuran PDF maksimal 50 MB."});}
}