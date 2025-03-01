import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { PostsProvider } from '@/lib/contexts/PostsContext';
import { Toaster } from 'react-hot-toast';
// Import debug utilities to ensure they're available globally
import '@/lib/utils/debugUtils';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Today I Learned',
  description: 'Share your daily learnings with the world',
};

// Add a script to define debug function in the global scope
const DebugScript = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          // Define debug function globally
          if (typeof window !== 'undefined') {
            window.debug = function() {
              console.log.apply(console, ['[Debug]'].concat(Array.prototype.slice.call(arguments)));
            };
            
            // Also handle any uncaught errors related to debug
            window.addEventListener('error', function(event) {
              if (event.message && event.message.includes('debug is not defined')) {
                console.warn('[Debug] Caught error about debug not being defined');
                if (!window.debug) {
                  window.debug = function() {
                    console.log.apply(console, ['[Debug]'].concat(Array.prototype.slice.call(arguments)));
                  };
                }
                // Prevent the error from propagating
                event.preventDefault();
                return true;
              }
            });
            
            // Also handle promise rejections
            window.addEventListener('unhandledrejection', function(event) {
              if (event.reason && event.reason.message && event.reason.message.includes('debug is not defined')) {
                console.warn('[Debug] Caught unhandled rejection about debug not being defined');
                if (!window.debug) {
                  window.debug = function() {
                    console.log.apply(console, ['[Debug]'].concat(Array.prototype.slice.call(arguments)));
                  };
                }
                // Prevent the rejection from propagating
                event.preventDefault();
                return true;
              }
            });
          }
        `,
      }}
    />
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <DebugScript />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <PostsProvider>
            <div className="min-h-screen">
              {children}
            </div>
            <Toaster 
              position="bottom-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '12px 16px',
                }
              }}
            />
          </PostsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
