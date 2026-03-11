export type StudyUploadPayloadFile = {
  name: string;
  mimeType: string;
  data?: string;
  extractedText?: string;
};

const TEXT_FILE_PATTERN = /\.(txt|md|csv|json|srt|vtt)$/i;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Unable to read file."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}

export function inferMimeTypeFromName(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".txt")) return "text/plain";
  if (lower.endsWith(".md")) return "text/markdown";
  if (lower.endsWith(".json")) return "application/json";
  if (lower.endsWith(".csv")) return "text/csv";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".m4a")) return "audio/mp4";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (lower.endsWith(".ppt")) return "application/vnd.ms-powerpoint";
  if (lower.endsWith(".pptx")) {
    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  }
  return "application/octet-stream";
}

function supportsInlineData(mimeType: string): boolean {
  return (
    mimeType === "application/pdf" ||
    mimeType.startsWith("image/") ||
    mimeType.startsWith("audio/") ||
    mimeType.startsWith("video/")
  );
}

async function extractClientText(file: File, mimeType: string): Promise<string | undefined> {
  if (mimeType.startsWith("text/") || TEXT_FILE_PATTERN.test(file.name)) {
    const text = await file.text();
    return text.trim().slice(0, 20_000);
  }

  return undefined;
}

export async function serializeStudyUploadFiles(
  files: File[],
  limit = 3,
): Promise<StudyUploadPayloadFile[]> {
  const selected = files.slice(0, limit);

  return Promise.all(
    selected.map(async (file) => {
      const mimeType = file.type || inferMimeTypeFromName(file.name);
      const payload: StudyUploadPayloadFile = {
        name: file.name,
        mimeType,
      };

      const extractedText = await extractClientText(file, mimeType);
      if (extractedText) {
        payload.extractedText = extractedText;
      }

      if (supportsInlineData(mimeType)) {
        const dataUrl = await readFileAsDataUrl(file);
        payload.data = dataUrl.split(",", 2)[1] ?? "";
      }

      return payload;
    }),
  );
}
