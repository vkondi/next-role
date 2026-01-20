import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";
import mammoth from "mammoth";
import { getLogger } from "@/lib/api/logger";

const log = getLogger("API:FileUpload");

/** Cleans PDF extracted text with intelligent space restoration and structure preservation */
function cleanPdfText(rawText: string): string {
  let text = rawText;

  // Step 1: Remove excessive spaces between single characters
  // This handles "e x p e r i e n c e" -> "experience" while being conservative
  text = text.replace(/([a-zA-Z])(\s{1,2})([a-zA-Z])(\s{1,2})([a-zA-Z])/g, "$1$3$5");
  
  // Iteratively apply character-level despacification
  let prevText = "";
  let iterations = 0;
  while (prevText !== text && iterations < 3) {
    prevText = text;
    // Remove 1-2 spaces between lowercase letter and lowercase letter
    text = text.replace(/([a-z])(\s{1,2})([a-z])/g, "$1$3");
    iterations++;
  }

  // Step 2: Add space after common separators if missing
  // Fix patterns like "Pune,India" -> "Pune, India"
  text = text.replace(/([a-zA-Z0-9]),([a-zA-Z])/g, "$1, $2");
  // Fix patterns like "India|linkedin" -> "India | linkedin"
  text = text.replace(/([a-zA-Z0-9])\|([a-zA-Z])/g, "$1 | $2");

  // Step 3: Add space before common connectors if missing
  // "Feb2024" -> "Feb 2024"
  text = text.replace(/([a-zA-Z])(\d{4})/g, "$1 $2");
  // "2024–Present" or "2024 – Present"
  text = text.replace(/(\d{4})(\s*[–—-]\s*)([a-zA-Z])/g, "$1 – $3");

  // Step 4: Restore line breaks at major section breaks
  // Look for patterns like "Section TitleSub Item" and add breaks
  text = text.replace(/([a-z])([A-Z][a-z]+)(Skills|Experience|Education|Projects|Professional|Technical|Cloud|Frontend|Backend|Databases)/g, "$1\n$2$3");

  // Step 5: Separate common resume section headers with newlines
  const sectionHeaders = [
    "Technical Skills",
    "Professional Experience",
    "Projects",
    "Education",
    "Certifications",
    "Languages",
    "Additional Skills",
    "Core Competencies",
    "Key Achievements"
  ];
  
  sectionHeaders.forEach(header => {
    const escapedHeader = header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(escapedHeader, "gi"), "\n" + header + "\n");
  });

  // Step 6: Add line breaks before job titles/dates
  // Pattern: "CompanyLocation | Date – Date" 
  text = text.replace(/([a-zA-Z0-9])\s{0,1}(\|)\s{0,1}([A-Z][a-z]{2}\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/g, "$1 $2 $3");
  text = text.replace(/([A-Z][a-z]{2}\d{4}\s*(?:–|—|-)\s*(?:Present|[A-Z][a-z]{2}\d{4}))/g, "\n$1\n");

  // Step 7: Normalize whitespace
  // Replace multiple spaces with single space
  text = text.replace(/[ \t]+/g, " ");
  // Replace multiple newlines with single newline
  text = text.replace(/\n\s*\n/g, "\n");
  // Clean up leading/trailing whitespace
  text = text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join("\n");

  return text.trim();
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

/**
 * Extracts text from a DOCX file using mammoth
 */
async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    log.debug("Processing DOCX file");
    const buffer = Buffer.from(arrayBuffer);
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    
    if (!text.trim()) {
      throw new Error("No text content found in DOCX file");
    }
    
    log.debug({ textLength: text.length }, "DOCX text extraction completed");
    return text;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    log.error({ error: errorMsg }, "DOCX parsing failed");
    throw new Error(`Failed to extract text from DOCX: ${errorMsg}`);
  }
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

    // Validate file size (max 2MB)
    const maxFileSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxFileSize) {
      log.warn(
        { fileName: file.name, fileSize: file.size, maxSize: maxFileSize },
        "File upload - size exceeds limit"
      );
      return NextResponse.json(
        {
          success: false,
          error: "File size exceeds maximum limit of 2MB",
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
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      log.debug({ fileName: file.name }, "Processing DOCX file");
      // Extract text from DOCX files
      text = await extractDocxText(arrayBuffer);
    } else {
      log.warn({ fileName: file.name, fileType: file.type }, "File upload - unsupported file type");
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Please upload a TXT, PDF, or DOCX file.",
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

