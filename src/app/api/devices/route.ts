import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const devices = await prisma.device.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(devices);
}

export async function POST(request: Request) {
  const body = await request.json();
  const device = await prisma.device.create({
    data: {
      userId: body.userId,
      name: body.name,
      identityKeyPublic: body.identityKeyPublic,
      deviceKeyPublic: body.deviceKeyPublic,
    },
  });

  return NextResponse.json(device, { status: 201 });
}
