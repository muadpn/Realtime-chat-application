"use client";
import { ButtonHTMLAttributes, FC, useState } from "react";
import Button from "./ui/Button";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { Loader2, LogOut } from "lucide-react";

interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const SignOutButton: FC<SignOutButtonProps> = ({ ...props }) => {
  const [isSigninOut, setIsSigninOut] = useState<boolean>(false);
  return (
    <Button
      variant="ghost"
      className="h-full w-full "
      onClick={async () => {
        setIsSigninOut(true);
        try {
          signOut();
        } catch (error) {
          toast.error("There was a Problem While Signing Out");
        } finally {
          setIsSigninOut(false);
        }
      }}
    >
      {isSigninOut ? (
        <Loader2 className="animate-spin h-4 w-4" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
    </Button>
  );
};

export default SignOutButton;
