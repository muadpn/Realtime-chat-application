"use client";
import GoogleLogo from "@/assets/GoogleLogo";
import Button from "@/components/ui/Button";
import { signIn } from "next-auth/react";
import { FC, useState } from "react";
import toast from "react-hot-toast";
import Logo from "@/assets/Logo.png";
import Image from "next/image";
interface pageProps {}

const Page: FC<pageProps> = ({}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function loginWithGoogle() {
    setIsLoading(true);
    try {
      signIn("google");
    } catch (error) {
      toast.error("Something went Wrong, Try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full flex flex-col items-center max-w-md space-y-8">
        <div>
          <div className="flex flex-col items-center gap-8">
            <Image
              src={Logo}
              height={200}
              width={250}
              alt="Realtime Chat application Logo"
            />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-">
              Sign in to your Account
            </h2>
          </div>
          <div className="mt-10">
            <Button
              isLoading={isLoading}
              type="button"
              onClick={loginWithGoogle}
              className="max-w-sm mx-auto w-full"
            >
              {" "}
              {!isLoading ? <GoogleLogo /> : null}
              Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
