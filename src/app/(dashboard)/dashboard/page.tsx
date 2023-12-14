import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { FC } from "react";

interface pageProps {}

const page: FC<pageProps> = async ({}) => {
  const session = await getServerSession(authOptions);
  console.log(session);
  return (
    <main>
      <div>
        <h1>hello</h1>
      </div>
    </main>
  );
};

export default page;
