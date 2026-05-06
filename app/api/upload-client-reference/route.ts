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
    const path = `client-references/${user.id}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const admin = createAdminClient();
    const { error: uploadError } = await admin.storage
      .from("certificates")
      .upload(path, buffer, { contentType: file.type });

    if (uploadError) {
      console.error("Client reference upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = admin.storage.from("certificates").getPublicUrl(path);

    return NextResponse.json({ url: publicUrl, name: file.name });
  } catch (err) {
    console.error("Upload client reference route error:", err);
    return NextResponse.json({ error: "שגיאה בהעלאת הקובץ" }, { status: 500 });
  }
}
