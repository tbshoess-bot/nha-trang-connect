import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { userId, subscription } = await req.json();
    if (!userId || !subscription?.endpoint) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    await supabaseAdmin.from("push_subscriptions").upsert({
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    }, { onConflict: "user_id,endpoint" });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
