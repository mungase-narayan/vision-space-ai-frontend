import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const getFileExtensionCategory = (file) => {
  if (!file || !file.name) return "UNKNOWN";

  const ext = file.name.split(".").pop().toLowerCase();

  if (["ppt", "pptx"].includes(ext)) return "PPT";
  if (["xls", "xlsx", "csv"].includes(ext)) return "CSV";
  if (["doc", "docx"].includes(ext)) return "DOC";
  if (["pdf"].includes(ext)) return "PDF";
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext))
    return "IMAGE";
  if (["mp4", "avi", "mov", "mkv"].includes(ext)) return "VIDEO";
  if (["mp3", "wav"].includes(ext)) return "AUDIO";
  if (["zip", "rar", "7z"].includes(ext)) return "ARCHIVE";
  if (["txt", "text"].includes(ext)) return "TEXT";

  return ext.toUpperCase();
};

import mammoth from "mammoth";
import JSZip from "jszip";
import * as XLSX from "xlsx";

export async function readAnyFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    return await extractPDFText(file);
  } else if (name.endsWith(".docx")) {
    return await extractDocxText(file);
  } else if (name.endsWith(".pptx")) {
    return await extractPPTText(file);
  } else if (name.endsWith(".xlsx")) {
    return await readXlsxFileAsText(file);
  }

  return await readAsText(file);
}

function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

async function extractPDFText(file) {
  if (!file || file.type !== "application/pdf") {
    setText("Please upload a valid PDF file.");
    return;
  }

  const arrayBuffer = await file.arrayBuffer();

  // Access pdfjsLib from global window object
  const pdfjsLib = window["pdfjsLib"];
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    fullText += `\n\n--- Page ${i} ---\n${pageText}`;
  }

  return fullText;
}

async function extractDocxText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function extractPPTText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // Slides are in ppt/slides/slide1.xml, slide2.xml, ...
  const slideFiles = Object.keys(zip.files).filter((f) =>
    f.match(/ppt\/slides\/slide\d+\.xml/)
  );

  let allText = "";

  for (const slideFile of slideFiles) {
    const xmlData = await zip.files[slideFile].async("text");

    // Extract text content from slide XML (very basic)
    const regex = /<a:t>(.*?)<\/a:t>/g;
    let match;
    while ((match = regex.exec(xmlData)) !== null) {
      allText += match[1] + "\n";
    }
  }

  return allText;
}

function readXlsxFileAsText(file) {
  return new Promise((resolve, reject) => {
    if (!file) reject("No file provided");

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const text = sheetData.map((row) => row.join(" ")).join("\n");
        resolve(text);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject("Failed to read file");

    reader.readAsBinaryString(file);
  });
}

function escapeDollarOutsideBackticks(text) {
  return text.replace(
    /(`[^`]*`)|([^`]+)/g,
    (match, backtickPart, normalPart) => {
      if (backtickPart) {
        return backtickPart;
      } else {
        return normalPart.replace(/\$/g, "\\$");
      }
    }
  );
}

export function generateObjectId() {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
  const random = "xxxxxxxxxxxxxxxx".replace(/[x]/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  );
  return timestamp + random;
}

function replaceLatexBrackets(text) {
  const pattern = /(?<!`)(\s*)\\\[(.*?)\\\](\s*)(?!`)/gs;
  return text.replace(pattern, (_, before, content, after) => {
    return `${before}$${content.trim()}$${after}`;
  });
}

function replaceInlineLatex(text) {
  const pattern = /(?<!`)(\s*)\\\((.*?)\\\)(\s*)(?!`)/gs;
  return text.replace(pattern, (_, before, content, after) => {
    return `${before}$${content.trim()}$${after}`;
  });
}

export function transformMarkdown01(text) {
  text = text.replace(/\\+\$/g, "$");
  text = escapeDollarOutsideBackticks(text);
  text = replaceLatexBrackets(text);
  text = replaceInlineLatex(text);

  return text;
}

function processOutsideCodeBlocks(text) {
  text = text.replace(/(?<!\\)\$/g, "\\$");

  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, content) => `$${content}$`);

  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, content) => `$${content}$`);

  return text;
}

export function transformMarkdown(text) {
  const parts = text.split(/(```[\s\S]*?```)/);

  for (let i = 0; i < parts.length; i++) {
    if (!parts[i].startsWith("```")) {
      parts[i] = processOutsideCodeBlocks(parts[i]);
    }
  }

  return parts.join("");
}

export function perfectFormatMarkdown(text) {
  const codeRegex = /(```[\s\S]*?```|`[^`]*`)/g;
  let lastIndex = 0;
  let result = "";

  const replaceOutsideCode = (chunk) => {
    return chunk
      .replace(/\$\$/g, "__DOLLAR__")
      .replace(/\$/g, "\\$")
      .replace(
        /__DOLLAR__\s*([\s\S]*?)\s*__DOLLAR__/g,
        (_, inner) => `\$${inner.trim()}\$`
      )
      .replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_, inner) => `\$${inner.trim()}\$`)
      .replace(
        /\\\(\s*([\s\S]*?)\s*\\\)/g,
        (_, inner) => `\$${inner.trim()}\$`
      );
  };

  text.replace(codeRegex, (match, code, offset) => {
    const beforeCode = text.slice(lastIndex, offset);
    result += replaceOutsideCode(beforeCode);
    result += code; // untouched
    lastIndex = offset + code.length;
    return code;
  });

  result += replaceOutsideCode(text.slice(lastIndex));
  return result;
}
