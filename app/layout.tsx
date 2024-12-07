import './globals.css';
import { Inter } from 'next/font/google';
import { VideoProvider } from '@/context/VideoContext';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'YouTube Podcast Business Idea Analyzer',
  description: 'Generate business ideas from YouTube podcasts using AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <VideoProvider>
          {children}
          <Toaster 
            theme="dark" 
            position="top-center"
            toastOptions={{
              style: {
                background: 'rgb(31 41 55)',
                border: '1px solid rgb(55 65 81)',
                color: 'white',
              },
            }}
          />
        </VideoProvider>
      </body>
    </html>
  );
}
