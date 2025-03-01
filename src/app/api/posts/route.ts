import { NextRequest, NextResponse } from "next/server";
import { createPost, getPosts } from "@/lib/firebase/firebaseUtils";
import { PostRecord } from "@/lib/types/schema";
import { cookies } from "next/headers";

// GET /api/posts
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!) : undefined;
    const authorId = url.searchParams.get("authorId") || undefined;
    
    // Fetch posts based on query parameters
    const posts = await getPosts({
      limit,
      filterByAuthor: authorId,
    });
    
    return NextResponse.json({ success: true, data: posts });
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts
export async function POST(request: NextRequest) {
  try {
    // Get request data
    const requestData = await request.json();
    
    // In a Next.js API route, we need to handle authentication differently
    // For simplicity, we'll trust the user ID from the request
    // In a production app, you would validate a token or session
    const session = requestData.session;
    
    if (!session || !session.user || !session.user.uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: User not logged in" },
        { status: 401 }
      );
    }
    
    const userId = session.user.uid;
    const userName = session.user.displayName || "Anonymous User";
    const userPhoto = session.user.photoURL || undefined;
    
    // Validate required fields
    if (!requestData.content || !requestData.category) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Create post in Firestore
    const postData: Omit<PostRecord, 'id' | 'likeCount' | 'commentCount' | 'bookmarkCount' | 'createdAt' | 'updatedAt'> = {
      content: requestData.content,
      category: requestData.category,
      authorId: userId,
      authorName: userName,
      authorPhotoURL: userPhoto,
      isPrivate: false,
      media: requestData.media || [],
    };
    
    const postId = await createPost(postData);
    
    return NextResponse.json({ 
      success: true, 
      data: { id: postId }
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create post" },
      { status: 500 }
    );
  }
} 