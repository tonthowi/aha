import { NextRequest, NextResponse } from "next/server";
import { getPostById, updatePost, deletePost } from "@/lib/firebase/firebaseUtils";

// GET /api/posts/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    
    if (!postId) {
      return NextResponse.json(
        { success: false, error: "Post ID is required" },
        { status: 400 }
      );
    }
    
    const post = await getPostById(postId);
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// PATCH /api/posts/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    
    if (!postId) {
      return NextResponse.json(
        { success: false, error: "Post ID is required" },
        { status: 400 }
      );
    }
    
    // Get request data
    const requestData = await request.json();
    const { session, ...updateData } = requestData;
    
    // Verify authentication
    if (!session || !session.user || !session.user.uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: User not logged in" },
        { status: 401 }
      );
    }
    
    // Get the post to verify ownership
    const post = await getPostById(postId);
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }
    
    // Ensure the user is the post author
    if (post.authorId !== session.user.uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: You can only edit your own posts" },
        { status: 403 }
      );
    }
    
    // Update the post
    await updatePost(postId, updateData);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update post" },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    
    if (!postId) {
      return NextResponse.json(
        { success: false, error: "Post ID is required" },
        { status: 400 }
      );
    }
    
    // Get the session from the request body or headers
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: User not logged in" },
        { status: 401 }
      );
    }
    
    // Get the post to verify ownership
    const post = await getPostById(postId);
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }
    
    // Ensure the user is the post author
    if (post.authorId !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: You can only delete your own posts" },
        { status: 403 }
      );
    }
    
    // Delete the post
    await deletePost(postId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete post" },
      { status: 500 }
    );
  }
} 