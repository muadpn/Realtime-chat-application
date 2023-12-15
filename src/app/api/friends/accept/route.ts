import { db } from "@/db/db";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/authOptions";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const reqBody = await req.json();

    const { id: IdToAdd } = z.object({ id: z.string() }).parse(reqBody);

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json("Unauthorized", { status: 401 });
    }

    //verify both user are not already friends

    const isAlreadyFriends = await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      IdToAdd
    );

    if (isAlreadyFriends) {
      return NextResponse.json("Already Friends with the User", {
        status: 400,
      });
    }

    const hasFriendsRequest = await fetchRedis(
      "sismember",
      `user:${session.user.id}:incoming_friend_requests`,
      IdToAdd
    );

    if (!hasFriendsRequest) {
      return NextResponse.json("Invalid Friend Request", { status: 400 });
    }

    const [userRaw, friendRaw] = (await Promise.all([
      fetchRedis(`get`, `user:${session.user.id}`),
      fetchRedis(`get`, `user:${IdToAdd}`),
    ])) as [string, string];

    const user = JSON.parse(userRaw);
    const friend = JSON.parse(friendRaw);

    await Promise.all([
      pusherServer.trigger(
        toPusherKey(`user:${IdToAdd}:friends`),
        "new_friend",
        user
      ),
      pusherServer.trigger(
        toPusherKey(`user:${session.user.id}:friends`),
        "new_friend",
        friend
      ),
      db.sadd(`user:${session.user.id}:friends`, IdToAdd),
      db.sadd(`user:${IdToAdd}:friends`, session.user.id),
      db.srem(`user:${session.user.id}:incoming_friend_requests`, IdToAdd),
    ]);

    return NextResponse.json("OK", { status: 200 });
  } catch (error) {
    console.log(error);

    if (error instanceof z.ZodError) {
      return NextResponse.json("Invalid Request Payload", { status: 403 });
    }

    return NextResponse.json("Invalid Request", { status: 400 });
  }
}
