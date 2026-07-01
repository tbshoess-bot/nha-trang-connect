import { NextRequest, NextResponse } from "next/server";
import { notifyUser } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const { recipientUserId, title, body, url } = await req.json();
    if (!recipientUserId || !title) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    await notifyUser({ recipientUserId, title, body, url });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
