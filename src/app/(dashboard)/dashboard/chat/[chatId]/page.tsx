import ChatInput from "@/components/ChatInput";
import Messages from "@/components/Messages";
import { db } from "@/db/db";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/authOptions";
import { messageArrayValidator } from "@/lib/validation/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FC } from "react";

interface PageProps {
  params: {
    chatId: string;
  };
}

async function getChatMessages(chatId: string) {
  try {
    const result: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1
    );

    const dbMessages = result.map((message) => JSON.parse(message) as Message);

    const reversedDbMessage = dbMessages.reverse();
    const messages = messageArrayValidator.parse(reversedDbMessage);
    return messages;
  } catch (error) {
    notFound();
  }
}

const Page = async ({ params }: PageProps) => {
  const { chatId } = params;
  const session = await getServerSession(authOptions);
  if (!session) notFound();
  const { user } = session;
  const [userId1, userId2] = chatId?.split("--");
  if (user.id !== userId1 && user.id !== userId2) notFound();

  const chatPartnerId = user.id === userId1 ? userId2 : userId1;
  console.log(chatPartnerId);
  const chatPartnerRaw = (await fetchRedis(
    "get",
    `user:${chatPartnerId}`
  )) as string;
  const chatPartner = JSON.parse(chatPartnerRaw) as User;
  console.log(chatPartner);

  const initialMessages = await getChatMessages(chatId);
  console.log(initialMessages);

  return (
    <div className="flex-1 justify-between flex flex-col  h-full max-h-[calc(90vh-6rem)]">
      {/* {} */}
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200 ">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Image
                src={chatPartner.image}
                fill
                alt={`${chatPartner.name} Profile Picture`}
                referrerPolicy="no-referrer"
                className="rounded-full"
              />
            </div>
          </div>
          <div className="flex flex-col leading-tight ">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {chatPartner.name}
              </span>
            </div>
            <span className="text-sm text-gray-600">{chatPartner.email}</span>
          </div>
        </div>
      </div>
      <Messages
        chatPartner={chatPartner}
        sessionImg={session.user.image}
        initialMessages={initialMessages}
        sessionId={session.user.id}
      />
      <ChatInput chatId={chatId} chatPartner={chatPartner} />
    </div>
  );
};

export default Page;
