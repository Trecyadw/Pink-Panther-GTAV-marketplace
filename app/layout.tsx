import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Night Runner Order System',
  description: 'Order-only platform with admin panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <img src="/bg-login.gif" alt="Animated background" className="gif-bg-img" />
        <div className="moving-lights" />
        <div className="moving-grid" />
        <div className="gif-overlay" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
