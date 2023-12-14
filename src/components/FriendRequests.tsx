"use client";
import axios from "axios";
import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";

interface FriendRequestsProps {
  incommingFriendRequest: IncommingFriendRequest[];
  sessionId: string;
}

const FriendRequests: FC<FriendRequestsProps> = ({
  incommingFriendRequest,
  sessionId,
}) => {
  const [friendRequests, setFriendRequests] = useState<
    IncommingFriendRequest[]
  >(incommingFriendRequest);

  const router = useRouter();

  const acceptFriends = async (senderId: string) => {
    await axios.post("/api/friends/accept", { id: senderId });
    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    );
    router.refresh();
  };
  const denyFriends = async (senderId: string) => {
    await axios.post("/api/friends/deny", { id: senderId });
    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    );
    router.refresh();
  };
  return (
    <>
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        friendRequests.map((request) => {
          return (
            <div className="flex gap-4 items-center" key={request?.senderId}>
              <UserPlus className="text-black" />
              <p className="font-medium text-lg">{request?.senderEmail} </p>
              <button
                onClick={() => acceptFriends(request.senderId)}
                aria-label="Accept Friend"
                className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
              >
                <Check className="font-semibold text-white w-3/4 h-3/4" />
              </button>
              <button
                onClick={() => denyFriends(request.senderId)}
                aria-label="Deny Friend"
                className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
              >
                <X className="font-semibold text-white w-3/4 h-3/4" />
              </button>
            </div>
          );
        })
      )}
    </>
  );
};

export default FriendRequests;
