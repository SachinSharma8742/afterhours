import "./globals.css";
import { AuthProvider } from "../hooks/use-auth";
import { ToastProvider } from "../hooks/use-toast";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

export const metadata = {
  title: "AfterHours | The Night You Won't Forget — Nov 4, 2026",
  description: "AfterHours — premium nightlife event in Jaipur, Rajasthan. DJ nights, live music, dance floor, food & drinks. Book your tickets now.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png?v=afterhours-v5", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png?v=afterhours-v5", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico?v=afterhours-v5", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=afterhours-v5", sizes: "180x180", type: "image/png" }],
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
