import { NextResponse } from "next/server";
import { loginSchema } from "@/features/auth/schema";
import { verifyPassword } from "@/features/auth/password";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = loginSchema.parse(await request.json());
  const user = await prisma.user.findUnique({
    where: { username: body.username },
    include: { devices: true },
  });

  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({
    user: { id: user.id, username: user.username },
    devices: user.devices,
  });
}
