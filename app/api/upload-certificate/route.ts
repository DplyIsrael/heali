import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "לא נבחר קובץ" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage
      .from("certificates")
      .upload(path, buffer, { contentType: file.type });

    if (uploadError) {
      console.error("Certificate upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = admin.storage.from("certificates").getPublicUrl(path);

    // Persist metadata so the document survives session abandonment and reloads
    // on onboarding resume. Best-effort — UI still functions if insert fails.
    const { data: profile } = await admin
      .from("practitioner_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      await admin.from("practitioner_documents").insert({
        practitioner_id: profile.id,
        file_url: publicUrl,
        file_name: file.name,
        file_type: ext,
      });
    }

    return NextResponse.json({ url: publicUrl, name: file.name });
  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json({ error: "שגיאה בהעלאת הקובץ" }, { status: 500 });
  }
}
