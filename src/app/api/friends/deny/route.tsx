import { db } from "@/db/db";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json("Unauthorized", { status: 400 });
    }
    const { id: IdToDeny } = z.object({ id: z.string() }).parse(body);

    await db.srem(`user:${session.user.id}:incoming_friend_requests`, IdToDeny);
    await db.srem(`user:${IdToDeny}:incoming_friend_requests`, session.user.id);

    return NextResponse.json("OK", { status: 200 });
  } catch (error) {
    console.log(error);

    if (error instanceof z.ZodError) {
      return NextResponse.json("Invalid Request Payload", { status: 403 });
    }

    return;
  }
}
// user:acb35cb7-ffca-412d-8f14-9089206950e8:incoming_friend_requests