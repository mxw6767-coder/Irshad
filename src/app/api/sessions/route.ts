import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionRecord } from "@/features/sessions/establish-session";

export async function POST(request: Request) {
  const body = await request.json();
  const session = createSessionRecord(body);

  await prisma.session.create({
    data: {
      conversationId: session.conversationId,
      senderDeviceId: session.senderDeviceId,
      recipientDeviceId: session.recipientDeviceId,
      version: session.version,
      sessionBlob: session.sessionBlob,
    },
  });

  return NextResponse.json(session, { status: 201 });
}
