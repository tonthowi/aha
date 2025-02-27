import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/firebase";
import { collection, setDoc, doc, getDocs, query, limit } from "firebase/firestore";
import { PostRecord } from "@/lib/types/schema";

// Initial seed data
const initialPosts: Omit<PostRecord, 'id'>[] = [
  {
    content: 'Today I learned about TypeScript generics and how they enable creating reusable components. They provide a way to make components work with any data type while still maintaining type safety. Here are some key concepts I discovered:\n\n1. Basic Generic Syntax\n2. Constraints using extends\n3. Default Type Parameters\n4. Generic Interfaces\n\nThis has really improved my understanding of type-safe components! 🚀',
    authorId: 'seed-user-1',
    authorName: 'John Doe',
    authorPhotoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60',
    category: '💻 Programming',
    createdAt: '2023-02-25T06:30:00.000Z',
    updatedAt: '2023-02-25T06:30:00.000Z',
    isPrivate: false,
    likeCount: 42,
    commentCount: 5,
    bookmarkCount: 12
  },
  {
    content: 'Discovered some amazing features in Next.js 14 App Router! 🔥\n\nKey learnings:\n- Server Components by default\n- Nested Layouts\n- Server Actions\n- Streaming with Suspense\n- Route Handlers\n\nThe new mental model takes some getting used to, but the performance benefits are incredible! #webdev #nextjs',
    authorId: 'seed-user-2',
    authorName: 'Jane Smith',
    authorPhotoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60',
    category: '🌐 Web Development',
    createdAt: '2023-02-24T14:15:00.000Z',
    updatedAt: '2023-02-24T14:15:00.000Z',
    isPrivate: false,
    likeCount: 38,
    commentCount: 7,
    bookmarkCount: 9
  },
  {
    content: 'This is a test post to verify the avatar placeholder functionality.',
    authorId: 'seed-user-3',
    authorName: 'John Smith',
    authorPhotoURL: undefined,
    category: '💻 Programming',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPrivate: false,
    likeCount: 0,
    commentCount: 0,
    bookmarkCount: 0
  }
];

// This is a protected admin route, only for development/testing
export async function GET(request: NextRequest) {
  try {
    // Check API key for security
    const url = new URL(request.url);
    const apiKey = url.searchParams.get("apiKey");
    
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // First check if there are any existing posts, to avoid duplicate seeding
    const postsRef = collection(db, "posts");
    const postsQuery = query(postsRef, limit(1));
    const postsSnapshot = await getDocs(postsQuery);
    
    if (!postsSnapshot.empty) {
      return NextResponse.json({
        success: false,
        message: "Database already contains posts. Seeding skipped."
      });
    }
    
    // Seed the posts
    const seedResults = await Promise.all(
      initialPosts.map(async (post, index) => {
        const id = `seed-post-${index + 1}`;
        await setDoc(doc(db, "posts", id), {
          ...post,
          id,
        });
        return id;
      })
    );
    
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      seeded: seedResults
    });
  } catch (error: any) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to seed database" },
      { status: 500 }
    );
  }
} 