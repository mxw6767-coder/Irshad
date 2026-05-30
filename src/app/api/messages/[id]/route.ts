import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  const message = await prisma.message.update({
    where: { id },
    data: {
      editedAt: body.editedAt ? new Date(body.editedAt) : new Date(),
      deletedAt: body.deletedAt ? new Date(body.deletedAt) : undefined,
      status: body.status,
      deliveredAt: body.deliveredAt ? new Date(body.deliveredAt) : undefined,
      readAt: body.readAt ? new Date(body.readAt) : undefined,
    },
  });

  return NextResponse.json(message);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const message = await prisma.message.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      status: "READ",
    },
  });

  return NextResponse.json(message);
}
