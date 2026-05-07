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
    const path = `${user.id}/avatar.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage
      .from("avatars")
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = admin.storage.from("avatars").getPublicUrl(path);

    // Persist the URL to whichever profile table the user has. The
    // route is shared between patients and practitioners, so we write
    // to both — only the row that exists for this user is updated.
    await admin
      .from("patient_profiles")
      .update({ profile_photo_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    await admin
      .from("practitioner_profiles")
      .update({ profile_photo_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("Avatar upload route error:", err);
    return NextResponse.json({ error: "שגיאה בהעלאת התמונה" }, { status: 500 });
  }
}
