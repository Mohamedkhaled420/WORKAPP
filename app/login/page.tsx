import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { LoginForm } from "./ui";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-md flex-col gap-10 px-6 py-24">
        <header className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Auth</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Sign in
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            We use Supabase magic links.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Email magic link</CardTitle>
            <CardDescription>
              Enter your email to receive a sign-in link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <div>
          <Button variant="outline" asChild>
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
