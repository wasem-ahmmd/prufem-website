import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabaseServer } from "@/lib/supabaseClient";

export async function POST() {
  try {
    const { data, error } = await supabaseServer
      .from("admin_banners")
      .select("image,color,title,\"isActive\"")
      .eq("isActive", true)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Supabase error fetching active banner:", error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ ok: false, error: "No active banner to export" }, { status: 400 });
    }

    const sql = `-- Seed an initial active banner (auto-export)\n\ninsert into public.admin_banners (image, color, title, "isActive")\nvalues (\n  '${data.image.replace(/'/g, "''")}',\n  '${data.color.replace(/'/g, "''")}',\n  '${data.title.replace(/'/g, "''")}',\n  true\n)\non conflict do nothing;\n`;

    const seedDir = path.join(process.cwd(), "supabase", "seeds");
    const seedPath = path.join(seedDir, "0001_seed_admin_banner.sql");
    await fs.promises.mkdir(seedDir, { recursive: true });
    await fs.promises.writeFile(seedPath, sql, "utf8");

    return NextResponse.json({ ok: true, path: seedPath });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}