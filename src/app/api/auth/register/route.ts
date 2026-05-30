import { NextResponse } from "next/server";
import { registerSchema } from "@/features/auth/schema";
import { hashPassword } from "@/features/auth/password";
import { prisma } from "@/lib/prisma";
import { generateIdentityKeyPair, generateDeviceFingerprint } from "@/features/identity/keypair";

export async function POST(request: Request) {
  const body = registerSchema.parse(await request.json());
  const passwordHash = await hashPassword(body.password);
  const identityKeyPair = generateIdentityKeyPair();
  const deviceId = generateDeviceFingerprint();

  const user = await prisma.user.create({
    data: {
      username: body.username,
      passwordHash,
      devices: {
        create: {
          id: deviceId,
          name: body.deviceName,
          identityKeyPublic: identityKeyPair.publicKey,
          deviceKeyPublic: identityKeyPair.publicKey,
        },
      },
    },
    include: { devices: true },
  });

  return NextResponse.json(
    {
      user: {
        id: user.id,
        username: user.username,
      },
      device: user.devices[0],
      identityKeyPair,
    },
    { status: 201 },
  );
}
