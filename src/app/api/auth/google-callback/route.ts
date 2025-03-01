import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase/firebase";
import { Auth } from "firebase/auth";

export async function GET(request: Request) {
  try {
    // Check if Firebase Auth is initialized
    if (!auth) {
      console.error("Firebase Auth is not initialized");
      // Still proceed with the callback since we're not directly using auth in this function
    }
    
    // Get the URL and parse the state parameter
    const url = new URL(request.url);
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    
    // Handle errors from Google
    if (error) {
      console.error("Google auth error:", error);
      return NextResponse.redirect(new URL('/?auth_error=' + error, request.url));
    }
    
    // Create HTML for the callback response that will redirect to the home page
    // This is important because Firebase handles the token exchange automatically
    const responseHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Complete</title>
        <script>
          // Store that we've completed the auth flow
          try {
            sessionStorage.setItem('authComplete', 'true');
            sessionStorage.removeItem('signInAttempt');
            sessionStorage.removeItem('signInTimestamp');
          } catch (e) {
            console.error('Error updating session storage:', e);
          }
          
          // Redirect back to the main page
          window.location.href = '/';
        </script>
      </head>
      <body>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif;">
          <h2>Authentication Complete</h2>
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
    
    // Return error HTML that redirects to home with error
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Error</title>
        <script>
          // Clear auth attempt
          try {
            sessionStorage.removeItem('signInAttempt');
            sessionStorage.removeItem('signInTimestamp');
            sessionStorage.setItem('authError', 'true');
          } catch (e) {
            console.error('Error updating session storage:', e);
          }
          
          // Redirect to home with error
          window.location.href = '/?auth_error=callback_error';
        </script>
      </head>
      <body>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif;">
          <h2>Authentication Error</h2>
          <p>There was an error during authentication. Redirecting you back to try again...</p>
        </div>
      </body>
      </html>
    `;
    
    return new NextResponse(errorHtml, {
      status: 200, // Use 200 to ensure the redirect script runs
      headers: {
        "Content-Type": "text/html",
      },
    });
  }
} 