import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM = `"ระบบ AI-Ready BU" <${process.env.GMAIL_USER}>`;
const APPROVER_EMAIL = process.env.GMAIL_USER!;

export async function sendSubmissionNotification(opts: {
  refId: string;
  facultyName: string;
  programName: string;
  ownerName: string;
  ownerEmail: string;
}) {
  await transporter.sendMail({
    from: FROM,
    to: APPROVER_EMAIL,
    subject: `[AI-Ready] มีการยื่นขอประเมินใหม่ — ${opts.refId}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; color: #14202e;">
        <div style="background:#1a4f8a; padding:24px 32px; border-radius:8px 8px 0 0;">
          <h1 style="margin:0; color:#fff; font-size:20px;">การยื่นขอประเมิน AI-Ready ใหม่</h1>
        </div>
        <div style="background:#f6f8fb; padding:24px 32px; border-radius:0 0 8px 8px; border:1px solid #dde3eb;">
          <p style="margin:0 0 16px;">มีการยื่นขอประเมินความพร้อมด้าน AI เข้ามาในระบบ กรุณาตรวจสอบและดำเนินการพิจารณา</p>
          <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
            <tr><td style="padding:8px 0; color:#677889; width:140px;">เลขที่อ้างอิง</td><td style="padding:8px 0; font-weight:600;">${opts.refId}</td></tr>
            <tr><td style="padding:8px 0; color:#677889;">คณะ</td><td style="padding:8px 0;">${opts.facultyName}</td></tr>
            <tr><td style="padding:8px 0; color:#677889;">หลักสูตร</td><td style="padding:8px 0;">${opts.programName}</td></tr>
            <tr><td style="padding:8px 0; color:#677889;">ผู้รับผิดชอบ</td><td style="padding:8px 0;">${opts.ownerName}</td></tr>
            <tr><td style="padding:8px 0; color:#677889;">อีเมลผู้ยื่น</td><td style="padding:8px 0;">${opts.ownerEmail}</td></tr>
          </table>
          <p style="margin:0; font-size:12px; color:#8b99a8;">อีเมลนี้ส่งโดยระบบ AI-Ready Bangkok University อัตโนมัติ</p>
        </div>
      </div>
    `,
  });
}

export async function sendDecisionNotification(opts: {
  refId: string;
  facultyName: string;
  programName: string;
  action: "approve" | "changes" | "reject";
  comment?: string;
  recipientEmail: string;
  recipientName: string;
}) {
  const actionLabel = {
    approve: "อนุมัติ",
    changes: "ขอแก้ไข",
    reject: "ไม่อนุมัติ",
  }[opts.action];

  const actionColor = {
    approve: "#137a4a",
    changes: "#a86a14",
    reject: "#b53030",
  }[opts.action];

  const actionBg = {
    approve: "#e6f4ec",
    changes: "#fcf3e1",
    reject: "#fdeaea",
  }[opts.action];

  await transporter.sendMail({
    from: FROM,
    to: opts.recipientEmail,
    subject: `[AI-Ready] ผลการพิจารณา ${opts.refId} — ${actionLabel}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; color: #14202e;">
        <div style="background:#1a4f8a; padding:24px 32px; border-radius:8px 8px 0 0;">
          <h1 style="margin:0; color:#fff; font-size:20px;">ผลการพิจารณาคำขอประเมิน AI-Ready</h1>
        </div>
        <div style="background:#f6f8fb; padding:24px 32px; border-radius:0 0 8px 8px; border:1px solid #dde3eb;">
          <p style="margin:0 0 16px;">เรียน ${opts.recipientName}</p>
          <p style="margin:0 0 16px;">คณะกรรมการได้พิจารณาคำขอประเมินความพร้อมด้าน AI ของท่านแล้ว</p>
          <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
            <tr><td style="padding:8px 0; color:#677889; width:140px;">เลขที่อ้างอิง</td><td style="padding:8px 0; font-weight:600;">${opts.refId}</td></tr>
            <tr><td style="padding:8px 0; color:#677889;">คณะ</td><td style="padding:8px 0;">${opts.facultyName}</td></tr>
            <tr><td style="padding:8px 0; color:#677889;">หลักสูตร</td><td style="padding:8px 0;">${opts.programName}</td></tr>
          </table>
          <div style="background:${actionBg}; border-left:4px solid ${actionColor}; padding:12px 16px; border-radius:0 6px 6px 0; margin-bottom:${opts.comment ? "16px" : "24px"};">
            <span style="font-weight:700; color:${actionColor}; font-size:15px;">ผล: ${actionLabel}</span>
          </div>
          ${opts.comment ? `
          <div style="background:#fff; border:1px solid #dde3eb; border-radius:6px; padding:12px 16px; margin-bottom:24px;">
            <p style="margin:0 0 6px; font-size:12px; font-weight:600; color:#677889; text-transform:uppercase; letter-spacing:0.05em;">ความเห็นคณะกรรมการ</p>
            <p style="margin:0; white-space:pre-wrap;">${opts.comment}</p>
          </div>
          ` : ""}
          <p style="margin:0; font-size:12px; color:#8b99a8;">อีเมลนี้ส่งโดยระบบ AI-Ready Bangkok University อัตโนมัติ</p>
        </div>
      </div>
    `,
  });
}
