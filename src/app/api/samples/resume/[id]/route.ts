import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SAMPLE_RESUMES = {
  "entry-level-marketing": "entry-level-marketing.txt",
  "mid-level-software": "mid-level-software.txt",
  "executive-finance": "executive-finance.txt",
  "senior-healthcare": "senior-healthcare.txt",
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    // Validate the requested resume ID
    if (!SAMPLE_RESUMES[id as keyof typeof SAMPLE_RESUMES]) {
      return NextResponse.json(
        { error: "Sample resume not found" },
        { status: 404 }
      );
    }

    const filename = SAMPLE_RESUMES[id as keyof typeof SAMPLE_RESUMES];
    const filePath = path.join(
      process.cwd(),
      "src/data/sampleResumesContent",
      filename
    );

    // Read the resume file
    const content = fs.readFileSync(filePath, "utf-8");

    return NextResponse.json(
      {
        success: true,
        text: content,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[Sample Resume API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load resume",
      },
      { status: 500 }
    );
  }
}
