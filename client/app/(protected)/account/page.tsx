"use client";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/nextjs";

const AccountPage = () => {
    const {signOut} = useClerk();
  return <div>

    <Button onClick={() => signOut({redirectUrl: "/login"})}>Sign Out</Button>
  </div>;
};

export default AccountPage;