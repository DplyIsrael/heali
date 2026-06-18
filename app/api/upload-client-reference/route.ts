import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

// PRIVATE bucket — must exist in Supabase with "public: false". Client
// references contain real patient names and phone numbers, so we never
// want public URLs in storage.
const BUCKET = "client-documents";
const SUBPATH = "references";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "לא נבחר קובץ" }, { status: 400 });

    const ext = (file.name.split(".").pop() ?? "jpg")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const path = `${SUBPATH}/${user.id}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type });

    if (uploadError) {
      console.error("[upload-client-reference] storage upload failed:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Return the storage PATH — not a public URL. The path is persisted to
    // practitioner_client_references.file_url. Display sites resolve it to a
    // short-lived signed URL via getSignedClientDocumentUrl.
    return NextResponse.json({ path, name: file.name });
  } catch (err) {
    console.error("[upload-client-reference] route threw:", err);
    return NextResponse.json({ error: "שגיאה בהעלאת הקובץ" }, { status: 500 });
  }
}
