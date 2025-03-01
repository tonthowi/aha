import { NextResponse } from "next/server";
import Replicate from "replicate";

// Initialize Replicate only if the API token is available
const replicateApiToken = process.env.REPLICATE_API_TOKEN;
const replicate = replicateApiToken 
  ? new Replicate({ auth: replicateApiToken })
  : null;

export async function POST(request: Request) {
  if (!replicateApiToken) {
    return NextResponse.json(
      { error: "The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it." },
      { status: 500 }
    );
  }

  // Ensure replicate is initialized
  if (!replicate) {
    return NextResponse.json(
      { error: "Failed to initialize Replicate client." },
      { status: 500 }
    );
  }

  const { prompt } = await request.json();

  try {
    const output = await replicate.run(
      "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
      {
        input: {
          prompt: prompt,
          image_dimensions: "512x512",
          num_outputs: 1,
          num_inference_steps: 50,
          guidance_scale: 7.5,
          scheduler: "DPMSolverMultistep",
        },
      }
    );

    return NextResponse.json({ output }, { status: 200 });
  } catch (error) {
    console.error("Error from Replicate API:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
