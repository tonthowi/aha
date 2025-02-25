import { NextResponse } from "next/server";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";

export async function GET(request: Request) {
  try {
    // Get the URL and parse the code parameter
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    
    // Create HTML for the callback response
    const responseHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Complete</title>
        <script>
          // Send a message to the parent window
          window.onload = function() {
            if (window.opener) {
              window.opener.postMessage({ type: 'AUTH_COMPLETE' }, window.location.origin);
              window.close();
            } else {
              // If no opener, redirect back to the main page
              window.location.href = '/';
            }
          };
        </script>
      </head>
      <body>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif;">
          <h2>Authentication Complete</h2>
          <p>You may close this window.</p>
          <p>Redirecting you back to the application...</p>
        </div>
      </body>
      </html>
    `;
    
    // Return HTML response
    return new NextResponse(responseHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error in Google callback:", error);
    
    // Return error HTML
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Error</title>
      </head>
      <body>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif;">
          <h2>Authentication Error</h2>
          <p>There was an error during authentication. Please try again.</p>
          <button onclick="window.close()">Close Window</button>
        </div>
      </body>
      </html>
    `;
    
    return new NextResponse(errorHtml, {
      status: 500,
      headers: {
        "Content-Type": "text/html",
      },
    });
  }
} 