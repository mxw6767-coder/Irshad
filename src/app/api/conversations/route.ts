import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const conversations = await prisma.conversation.findMany({
    include: { members: true, messages: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(conversations);
}

export async function POST(request: Request) {
  const body = await request.json();
  const conversation = await prisma.conversation.create({
    data: {
      type: body.type ?? "DIRECT",
      members: {
        create: body.userIds.map((userId: string) => ({ userId })),
      },
    },
    include: { members: true },
  });

  return NextResponse.json(conversation, { status: 201 });
}

