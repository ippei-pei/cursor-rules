import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cursor Rule Metrics Dashboard",
  description: "Metrics and insights for Cursor rule usage",
};

const AppHeader = () => {
  return (
    <header className="bg-light py-3 mb-4 border-bottom">
      <Container>
        <h1 className="h4">Cursor Rule Metrics Dashboard</h1>
      </Container>
    </header>
  );
};

const AppFooter = () => {
  return (
    <footer className="mt-auto py-3 bg-light border-top">
      <Container>
        <span className="text-muted">
          Generated Weekly | Feedback welcome on GitHub Issues
        </span>
      </Container>
    </footer>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-100">
      <body className={`${inter.className} d-flex flex-column h-100`}>
        <AppHeader />
        <main className="flex-shrink-0">
          <Container>{children}</Container>
        </main>
        <AppFooter />
      </body>
    </html>
  );
}
