import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const messages = await prisma.message.findMany({
    orderBy: { sentAt: "asc" },
  });
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const body = await request.json();
  const message = await prisma.message.create({
    data: {
      conversationId: body.conversationId,
      senderId: body.senderId,
      receiverId: body.receiverId,
      senderDeviceId: body.senderDeviceId,
      ciphertext: body.ciphertext,
      nonce: body.nonce,
      status: body.status ?? "SENT",
      sentAt: body.sentAt ? new Date(body.sentAt) : undefined,
      deliveredAt: body.deliveredAt ? new Date(body.deliveredAt) : undefined,
      readAt: body.readAt ? new Date(body.readAt) : undefined,
    },
  });
  return NextResponse.json(message, { status: 201 });
}
