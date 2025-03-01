import { NextRequest, NextResponse } from "next/server";

// This route outputs recommended Firebase security rules
export async function GET(request: NextRequest) {
  // Check API key for security
  const url = new URL(request.url);
  const apiKey = url.searchParams.get("apiKey");
  
  // Validate that the admin API key is set in environment variables
  if (!process.env.ADMIN_API_KEY) {
    console.error("ADMIN_API_KEY is not set in environment variables");
    return NextResponse.json(
      { success: false, error: "Server configuration error" },
      { status: 500 }
    );
  }
  
  // Security check with constant-time comparison to prevent timing attacks
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const securityRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // User collection rules
    match /users/{userId} {
      // Anyone can read user profiles
      // Only the owner can write to their own profile
      allow read: if true;
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isOwner(userId);
      allow delete: if isSignedIn() && isOwner(userId);
    }
    
    // Posts collection rules
    match /posts/{postId} {
      // Anyone can read posts
      // Only authenticated users can create posts
      // Only the post owner can update or delete the post
      function isPostOwner() {
        return isSignedIn() && isOwner(resource.data.authorId);
      }
      
      allow read: if true;
      allow create: if isSignedIn();
      allow update: if isPostOwner();
      allow delete: if isPostOwner();
    }
    
    // Likes collection rules
    match /likes/{likeId} {
      // Anyone can read likes
      // Only authenticated users can create/delete their own likes
      function isLikeOwner() {
        return isSignedIn() && isOwner(resource.data.userId);
      }
      
      allow read: if true;
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
      allow delete: if isLikeOwner();
      allow update: if false; // Likes shouldn't be updated, only created/deleted
    }
    
    // Bookmarks collection rules
    match /bookmarks/{bookmarkId} {
      // Only the bookmark owner can read their bookmarks
      // Only authenticated users can create/delete their own bookmarks
      function isBookmarkOwner() {
        return isSignedIn() && isOwner(resource.data.userId);
      }
      
      allow read: if isSignedIn() && isOwner(resource.data.userId);
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
      allow delete: if isBookmarkOwner();
      allow update: if false; // Bookmarks shouldn't be updated, only created/deleted
    }
    
    // Comments collection rules
    match /comments/{commentId} {
      // Anyone can read comments
      // Only authenticated users can create comments
      // Only the comment owner can update or delete the comment
      function isCommentOwner() {
        return isSignedIn() && isOwner(resource.data.userId);
      }
      
      allow read: if true;
      allow create: if isSignedIn();
      allow update: if isCommentOwner();
      allow delete: if isCommentOwner();
    }
  }
}
  `;

  return NextResponse.json({
    success: true,
    securityRules
  });
} 