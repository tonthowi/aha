import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';
// Import debug utilities to ensure they're available globally
import '@/lib/utils/debugUtils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Aha! - Today I Learned',
  description: 'Share and discover daily learnings',
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
    <html lang="en">
      <head>
        <DebugScript />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
