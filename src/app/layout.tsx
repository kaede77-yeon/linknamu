import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { profile } from "@/data/profile";

// 가변 폰트 하나로 100~900 굵기를 모두 처리한다
const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: `${profile.name} | 링크나무`,
  description: profile.bio,
};

// 첫 페인트 전에 테마를 적용해 깜빡임을 막는다
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark = stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen font-sans text-stone-800 antialiased dark:text-stone-100">
        {children}
      </body>
    </html>
  );
}
