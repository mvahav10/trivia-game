import { Inter } from "next/font/google";  // Using Inter instead of Geist since it's available in Google Fonts
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Trivia Game",
  description: "An interactive trivia game",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}