import { NextResponse } from "next/server";
import { getCurrentUserFromCookieHeader } from "@/lib/auth";
import {
  createSubject,
  deleteSubject,
  listSubjects,
  renameSubject,
  SubjectSourceType,
} from "@/lib/subjects";

function isValidYouTubeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.hostname.includes("youtube.com") ||
      url.hostname.includes("youtu.be")
    );
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const user = await getCurrentUserFromCookieHeader(request.headers.get("cookie"));
  const subjects = await listSubjects(user?.id ?? null);
  return NextResponse.json({ subjects });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUserFromCookieHeader(request.headers.get("cookie"));
    if (user && !user.onboardingCompleted) {
      return NextResponse.json({ error: "Complete onboarding first." }, { status: 403 });
    }
    const body = (await request.json()) as {
      topicName?: string;
      sourceType?: SubjectSourceType;
      notesText?: string;
      youtubeUrl?: string;
      fileName?: string;
    };

    const topicName = body.topicName?.trim() ?? "";
    const sourceType = body.sourceType;

    if (!sourceType || !["audio", "youtube", "paste_notes", "document"].includes(sourceType)) {
      return NextResponse.json({ error: "Valid source type is required." }, { status: 400 });
    }

    if (sourceType === "youtube") {
      const youtubeUrl = body.youtubeUrl?.trim() ?? "";
      if (!youtubeUrl || !isValidYouTubeUrl(youtubeUrl)) {
        return NextResponse.json({ error: "Valid YouTube link is required." }, { status: 400 });
      }
    }

    if (sourceType === "paste_notes") {
      const notesText = body.notesText?.trim() ?? "";
      if (!notesText) {
        return NextResponse.json({ error: "Pasted notes are required." }, { status: 400 });
      }
    }

    if (sourceType === "document") {
      const fileName = body.fileName?.trim() ?? "";
      if (!fileName) {
        return NextResponse.json({ error: "PDF/Word file is required." }, { status: 400 });
      }
    }

    if (sourceType === "audio") {
      const fileName = body.fileName?.trim() ?? "";
      if (!fileName) {
        return NextResponse.json({ error: "Audio file is required." }, { status: 400 });
      }
    }

    const subject = await createSubject({
      userId: user?.id ?? null,
      topicName: topicName || undefined,
      sourceType,
      notesText: body.notesText,
      youtubeUrl: body.youtubeUrl,
      fileName: body.fileName,
    });

    return NextResponse.json({ subject, message: "Subject saved." });
  } catch {
    return NextResponse.json({ error: "Failed to save subject." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUserFromCookieHeader(request.headers.get("cookie"));
    if (user && !user.onboardingCompleted) {
      return NextResponse.json({ error: "Complete onboarding first." }, { status: 403 });
    }
    const body = (await request.json()) as { id?: string; topicName?: string };
    const id = body.id?.trim() ?? "";
    const topicName = body.topicName?.trim() ?? "";

    if (!id || !topicName) {
      return NextResponse.json({ error: "id and topicName are required." }, { status: 400 });
    }

    const updated = await renameSubject({
      id,
      userId: user?.id ?? null,
      topicName,
    });

    if (!updated) {
      return NextResponse.json({ error: "Subject not found." }, { status: 404 });
    }

    return NextResponse.json({ subject: updated, message: "Topic renamed." });
  } catch {
    return NextResponse.json({ error: "Failed to rename subject." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUserFromCookieHeader(request.headers.get("cookie"));
    if (user && !user.onboardingCompleted) {
      return NextResponse.json({ error: "Complete onboarding first." }, { status: 403 });
    }
    const body = (await request.json()) as { id?: string };
    const id = body.id?.trim() ?? "";

    if (!id) {
      return NextResponse.json({ error: "id is required." }, { status: 400 });
    }

    const deleted = await deleteSubject({
      id,
      userId: user?.id ?? null,
    });

    if (!deleted) {
      return NextResponse.json({ error: "Subject not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Subject deleted." });
  } catch {
    return NextResponse.json({ error: "Failed to delete subject." }, { status: 500 });
  }
}
