import type { Metadata } from "next";
import { Sarabun, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sarabun",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI-Ready Curriculum · มหาวิทยาลัยกรุงเทพ",
  description:
    "ระบบบริหารหลักสูตร AI-Ready ของมหาวิทยาลัยกรุงเทพ — ยื่นขออนุมัติสมรรถนะ AI-Ready และจัดทำ Curriculum Mapping",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} ${ibmPlexSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
