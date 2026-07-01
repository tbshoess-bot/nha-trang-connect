import { Resend } from "resend";
import webpush from "web-push";
import { supabaseAdmin } from "./supabase-admin";

let vapidConfigured = false;
function ensureVapid() {
  if (vapidConfigured) return;
  const subject = process.env.VAPID_EMAIL || "";
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  const priv = process.env.VAPID_PRIVATE_KEY || "";
  if (subject && pub && priv) {
    webpush.setVapidDetails(subject, pub, priv);
    vapidConfigured = true;
  }
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nha-trang-connect-ymm8.vercel.app";

export async function notifyUser({
  recipientUserId,
  title,
  body,
  url,
}: {
  recipientUserId: string;
  title: string;
  body: string;
  url: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    // Get recipient email + push subscriptions
    const [profileResult, subsResult] = await Promise.all([
      supabaseAdmin.from("profiles").select("email").eq("id", recipientUserId).single(),
      supabaseAdmin.from("push_subscriptions").select("*").eq("user_id", recipientUserId),
    ]);

    const email = profileResult.data?.email;
    const subs = subsResult.data ?? [];

    // Send email
    if (email) {
      await resend.emails.send({
        from: "Sri Lanka Connect <onboarding@resend.dev>",
        to: email,
        subject: title,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto">
            <div style="background:#8D153A;padding:20px;border-radius:12px 12px 0 0">
              <h1 style="color:white;margin:0;font-size:18px">🦁 Sri Lanka Connect</h1>
            </div>
            <div style="padding:24px;background:#fff;border:1px solid #EDE5D0;border-top:0;border-radius:0 0 12px 12px">
              <h2 style="margin:0 0 8px;font-size:16px;color:#1c1b18">${title}</h2>
              <p style="margin:0 0 20px;color:#33312c;font-size:14px">${body}</p>
              <a href="${APP_URL}${url}" style="background:#8D153A;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold">
                View post →
              </a>
            </div>
          </div>
        `,
      });
    }

    // Send push notifications
    ensureVapid();
    const pushPayload = JSON.stringify({ title, body, url: `${APP_URL}${url}` });
    await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          pushPayload
        ).catch((err) => {
          // Remove expired subscriptions
          if (err.statusCode === 410) {
            supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
          }
        })
      )
    );
  } catch (err) {
    console.error("notify error:", err);
  }
}
