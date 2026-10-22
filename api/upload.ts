import { handleUpload } from "@vercel/blob/client";
import { adminFromRequest } from "./_lib/db.js";

export async function POST(request: Request): Promise<Response> {
  try {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const admin = await adminFromRequest({ headers: { cookie: cookieHeader } });
    if (!admin) return Response.json({ error: "Login admin diperlukan untuk mengunggah berkas." }, { status: 401 });
    const body = await request.json();
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname: string, clientPayload?: string) => {
        const payload = clientPayload ? JSON.parse(clientPayload) : {};
        if (payload.kind !== "book-pdf") throw new Error("Jenis unggahan tidak diizinkan.");
        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: 50 * 1024 * 1024,
          addRandomSuffix: true,
          access: "private",
        };
      },
      onUploadCompleted: async () => {},
    });
    return Response.json(jsonResponse);
  } catch (error) {
    console.error("blob upload failed", error);
    return Response.json({ error: "Unggahan gagal. Pastikan Vercel Blob sudah terhubung dan ukuran PDF maksimal 50 MB." }, { status: 400 });
  }
}
