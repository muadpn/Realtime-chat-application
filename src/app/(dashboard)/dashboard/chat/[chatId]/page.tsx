import { db } from "@/db/db";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/authOptions";
import { messageArrayValidator } from "@/lib/validation/message";
import { getServerSession } from "next-auth";
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
  console.log(chatId)
  const { user } = session;
  const [userId1, userId2] = chatId?.split("--");
  if (user.id !== userId1 && user.id !== userId2) notFound;

  const chatPartnerId = user.id === userId1 ? userId2 : userId1;
  const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User;
  const initialMessages = await getChatMessages(chatId);

  return <div>page</div>;
};

export default Page;
