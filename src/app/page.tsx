import Button from "@/components/ui/Button";
import { FC } from "react";

interface pageProps {}

const Page: FC<pageProps> = async ({}) => {
  return (
    <Button variant="ghost" className="">
      page
    </Button>
  );
};

export default Page;
