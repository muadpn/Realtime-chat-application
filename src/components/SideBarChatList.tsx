"use client";
import { pusherClient } from "@/lib/pusher";
import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import UnseenChatToast from "./UnseenChatToast";

interface SideBarChatListProps {
  friends: User[];
  sessionId: string;
}

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

const SideBarChatList: FC<SideBarChatListProps> = ({ friends, sessionId }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  useEffect(() => {
    if (pathname?.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => !pathname.includes(msg.senderId));
      });
    }
  }, [pathname]);

  useEffect(() => {
    const chatHandler = (message: ExtendedMessage) => {
      console.log(message.senderId);
      const shouldNotified =
        pathname !==
        `/dashboard/chat/${chatHrefConstructor(sessionId, message.id)}`;
      if (!shouldNotified) return;
      console.log(message.receiverId);
      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          senderId={message.senderId}
          sessionId={sessionId}
          senderName={message.senderName}
          senderImg={message.senderImg}
          senderMessage={message.text}
        />
      ));

      setUnseenMessages((prev) => [...prev, message]);
    };
    const friendHandler = () => {
      router.refresh();
    };
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));
    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_friend", friendHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));

      pusherClient.unbind("new_message", chatHandler);
      pusherClient.unbind("new_friend", friendHandler);
    };
  }, [pathname, sessionId, router]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {friends.sort().map((friend) => {
        const unseenMessageCount = unseenMessages.filter((unseenMsg) => {
          return unseenMsg.senderId === friend.id;
        }).length;

        return (
          <li key={friend.id}>
            <a
              href={`/dashboard/chat/${chatHrefConstructor(
                sessionId,
                friend.id
              )}`}
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
            >
              {friend.name}
              {unseenMessageCount > 0 ? (
                <div className="bg-indigo-500 font-medium text-xs text-white w-4 h-4 rounded-full flex items-center justify-center ">
                  {unseenMessageCount}
                </div>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SideBarChatList;
