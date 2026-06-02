"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useClerk, useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";

const AccountPage = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const [username, setUsername] = useState(user?.username ?? "");

  useEffect(() => {
    if (user?.username !== undefined) {
      setUsername(user.username ?? "");
    }
  }, [user?.username]);

  const { mutate: updateUser, isPending, isSuccess, error } = useMutation({
    mutationFn: async (newUsername: string) => {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername }),
      });
      if (!res.ok) throw new Error(await res.text());
      await user!.reload();
    },
  });

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : (user?.username?.[0] ?? user?.emailAddresses[0]?.emailAddress[0] ?? "?").toUpperCase();

  const hasChanges = username !== (user?.username ?? "");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-foreground">Account</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your profile</p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
              style={{ backgroundColor: "#1D9E75" }}
            >
              {initials}
            </div>
            <div>
              <CardTitle>{user?.fullName ?? user?.username ?? "User"}</CardTitle>
              <CardDescription>{user?.emailAddresses[0]?.emailAddress}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
            <Input
              id="email"
              value={user?.emailAddresses[0]?.emailAddress ?? ""}
              type="email"
              disabled
              className="bg-muted/40 text-muted-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs text-muted-foreground">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isPending}
              placeholder="Your username"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {isSuccess && !hasChanges && (
              <p className="text-xs text-[#1D9E75]">Saved</p>
            )}
            {error && (
              <p className="text-xs text-destructive">{(error as Error).message}</p>
            )}
            <div className="ml-auto">
              <Button            
                onClick={() => updateUser(username)}
                disabled={isPending || !hasChanges}
                size="sm"
                style={hasChanges ? { backgroundColor: "#1D9E75", color: "#fff" } : undefined}
              >
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-sm">Session</CardTitle>
          <CardDescription>Manage access to your account</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sign out</p>
              <p className="text-xs text-muted-foreground mt-0.5">You will be redirected to the login page</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => signOut({ redirectUrl: "/login" })}
            >
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountPage;
