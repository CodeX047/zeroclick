import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "./dashboard-layout";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <DashboardLayout />;
}
