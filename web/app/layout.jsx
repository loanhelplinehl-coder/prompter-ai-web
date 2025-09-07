import "./globals.css";

export const metadata = {
  title: "Prompter AI",
  description: "Minimal Next.js app with Tailwind setup",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-50 text-gray-900 p-6">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
