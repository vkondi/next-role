import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";

/**
 * Cleans PDF extracted text that has spaces between every character
 * Pattern: "e x p e r i e n c e" -> "experience"
 */
function cleanPdfText(rawText: string): string {
  let text = rawText;

  // Pattern 1: Aggressively remove spaces between single letters/numbers
  // This handles: "e x p e r i e n c e" -> "experience"
  // Match single char followed by space, repeat 2+ times
  text = text.replace(/([a-zA-Z0-9])\s+([a-zA-Z0-9])\s+/g, (_match, char1, char2) => {
    // If we found a pattern of char space char space, remove the spaces
    return char1 + char2;
  });
  
  // Keep removing spaces between chars until no more patterns match
  let prevText = "";
  while (prevText !== text) {
    prevText = text;
    text = text.replace(/([a-zA-Z0-9])\s+([a-zA-Z0-9])/g, "$1$2");
  }

  // Pattern 2: Normalize whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * Extracts text from a PDF file using pdf2json
 */
async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const pdfParser = new PDFParser(null, true);
      const buffer = Buffer.from(arrayBuffer);

      pdfParser.on("pdfParser_dataError", (data) => {
        const errorMsg = typeof data === "string" ? data : (data as any)?.parserError || "Unknown PDF parsing error";
        reject(new Error(`PDF parsing error: ${errorMsg}`));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        // Extract text from all pages
        let text = "";
        if (pdfData.Pages) {
          pdfData.Pages.forEach((page: any) => {
            if (page.Texts) {
              page.Texts.forEach((textObj: any) => {
                if (textObj.R && textObj.R.length > 0) {
                  textObj.R.forEach((r: any) => {
                    try {
                      // Try to decode URI component, but fall back to raw text if it fails
                      text += decodeURIComponent(r.T);
                    } catch {
                      // If decoding fails, use the raw text
                      text += r.T;
                    }
                  });
                }
              });
              text += "\n";
            }
          });
        }
        
        // Clean up the extracted text
        const cleanedText = cleanPdfText(text);
        
        resolve(cleanedText);
      });

      pdfParser.parseBuffer(buffer);
    } catch (error) {
      reject(
        new Error(
          `Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`
        )
      );
    }
  });
}

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

    // Validate file size (max 10MB)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      return NextResponse.json(
        {
          success: false,
          error: "File size exceeds maximum limit of 10MB",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    let text = "";

    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      // Read plain text files directly
      text = new TextDecoder().decode(arrayBuffer);
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      // Extract text from PDF files
      text = await extractPdfText(arrayBuffer);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Please upload a TXT or PDF file.",
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

