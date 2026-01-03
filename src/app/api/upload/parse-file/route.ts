import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    let text = "";

    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      // Read plain text files directly
      text = new TextDecoder().decode(arrayBuffer);
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      // For PDF files, use a server-side extraction service
      // For now, return a helpful message
      return NextResponse.json(
        {
          success: false,
          error:
            "PDF parsing requires additional setup. Please convert your PDF to text or upload a TXT file for now.",
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Please upload a TXT file.",
        },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "The file appears to be empty. Please try a different file.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, text },
      { status: 200 }
    );
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process file",
      },
      { status: 500 }
    );
  }
}

