import "./globals.css";
import { AuthProvider } from "../hooks/use-auth";
import { ToastProvider } from "../hooks/use-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export const metadata = {
  title: "AfterHours | The Night You Won't Forget — Aug 16, 2026",
  description: "AfterHours — premium nightlife event in Jaipur, Rajasthan. DJ nights, live music, dance floor, food & drinks. Book your tickets now.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col antialiased" style={{ background: "#080808", color: "#f1f5f9" }}>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
