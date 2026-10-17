import type { Metadata } from 'next';
import './universe.css';
import './studio.css';
export const metadata: Metadata = {
  title: 'Tony Tang — Connecting the disconnected',
  description: 'Integration developer and cloud architect. Explore Tony Tang’s playful world of serverless systems, developer tools, and commerce integrations.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
