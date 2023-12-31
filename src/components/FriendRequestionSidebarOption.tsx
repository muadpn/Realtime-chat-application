"use client";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { UserIcon } from "lucide-react";
import Link from "next/link";
import { FC, useEffect, useState } from "react";

interface FriendRequestionSidebarOptionProps {
  initialUnseenRequestCounter: number;
  sessionId: string;
}

const FriendRequestionSidebarOption: FC<FriendRequestionSidebarOptionProps> = ({
  initialUnseenRequestCounter,
  sessionId,
}) => {
  const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
    initialUnseenRequestCounter
  );

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    );
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));
    const friendRequestHandler = () => {
      setUnseenRequestCount((prev) => prev + 1);
    };

    const addedFriendHandler = () => {
      setUnseenRequestCount((prev) => prev - 1);
    };

    pusherClient.bind("incoming_friend_requests", friendRequestHandler);
    pusherClient.bind("new_friend", addedFriendHandler);
    pusherClient.bind("deny_user", addedFriendHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));
      pusherClient.unbind("new_friend", friendRequestHandler);
      pusherClient.unbind("incoming_friend_requests", addedFriendHandler);
      pusherClient.unbind("deny_user", addedFriendHandler);
    };
  }, [sessionId]);

  return (
    <Link
      href="/dashboard/requests"
      className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
      // onClick={() => setUnseenRequestCount(0)}
    >
      <div className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
        <UserIcon className="h-5 w-4" />
      </div>
      <p className="truncate">Friend Request</p>
      {unseenRequestCount > 0 ? (
        <div className="rounded-full w-5 h-5 text-sm flex items-center justify-center text-white bg-indigo-600/90">
          {unseenRequestCount}
        </div>
      ) : null}
    </Link>
  );
};

export default FriendRequestionSidebarOption;
