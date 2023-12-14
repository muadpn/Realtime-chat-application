import { db } from "@/db/db";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/authOptions";
import { addFriendValidator } from "@/lib/validation/add-friend";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email: EmailToAdd } = addFriendValidator.parse(body.email);
    const idToAdd = (await fetchRedis(
      "get",
      `user:email:${EmailToAdd}`
    )) as string;

    if (!idToAdd) {
      return NextResponse.json("This Person Doesn't Exists", { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json("Unauthrized access", { status: 400 });
    }
    if (idToAdd === session.user.id) {
      return NextResponse.json("You cannot add yourself as a friend", {
        status: 400,
      });
    }

    //check if user is already added
    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1;

    if (isAlreadyAdded) {
      return NextResponse.json("Already added This User", { status: 400 });
    }

    const isAlreadyFriends = (await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    )) as 0 | 1;

    if (isAlreadyFriends) {
      return NextResponse.json("Already Friends with this User", {
        status: 400,
      });
    }

    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

    return NextResponse.json("OK", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json("Invalid request Payload", { status: 422 });
    }
    return NextResponse.json("Invalid Request", { status: 400 });
  }
}
