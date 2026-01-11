import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";
import { getLogger } from "@/lib/api/logger";

const log = getLogger("API:FileUpload");

/** Cleans PDF extracted text with spaces between characters */
function cleanPdfText(rawText: string): string {
  let text = rawText;

  // Remove spaces between single chars (e.g., "e x p e r i e n c e" -> "experience")
  text = text.replace(/([a-zA-Z0-9])\s+([a-zA-Z0-9])\s+/g, (_match, char1, char2) => {
    return char1 + char2;
  });
  
  // Keep removing spaces between chars until stabilized
  let prevText = "";
  while (prevText !== text) {
    prevText = text;
    text = text.replace(/([a-zA-Z0-9])\s+([a-zA-Z0-9])/g, "$1$2");
  }

  // Normalize whitespace
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
        log.warn({ errorMsg }, "PDF parsing encountered error");
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
        log.debug({ pageCount: pdfData.Pages?.length }, "PDF text extraction completed");
        
        resolve(cleanedText);
      });

      pdfParser.parseBuffer(buffer);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      log.error({ error: errorMsg }, "PDF parsing failed");
      reject(
        new Error(
          `Failed to extract text from PDF: ${errorMsg}`
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
      log.warn("File upload - no file provided");
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    log.info({ fileName: file.name, fileSize: file.size, fileType: file.type }, "File upload received");

    // Validate file size (max 10MB)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      log.warn(
        { fileName: file.name, fileSize: file.size, maxSize: maxFileSize },
        "File upload - size exceeds limit"
      );
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
      log.debug({ fileName: file.name }, "Processing text file");
      // Read plain text files directly
      text = new TextDecoder().decode(arrayBuffer);
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      log.debug({ fileName: file.name }, "Processing PDF file");
      // Extract text from PDF files
      text = await extractPdfText(arrayBuffer);
    } else {
      log.warn({ fileName: file.name, fileType: file.type }, "File upload - unsupported file type");
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Please upload a TXT or PDF file.",
        },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      log.warn({ fileName: file.name }, "File upload - empty file");
      return NextResponse.json(
        {
          success: false,
          error: "The file appears to be empty. Please try a different file.",
        },
        { status: 400 }
      );
    }

    log.info({ fileName: file.name, textLength: text.length }, "File parsed successfully");
    return NextResponse.json(
      { success: true, text },
      { status: 200 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    log.error({ error: errorMsg }, "File upload processing failed");
    return NextResponse.json(
      {
        success: false,
        error: errorMsg || "Failed to process file",
      },
      { status: 500 }
    );
  }
}

