import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "").split(",");

export default async function AdminPage() {
  const user = await currentUser();

  if (!user || !ADMIN_USER_IDS.includes(user.id)) {
    return notFound();
  }

  const allUsers = await db.query.users.findMany({
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  });

  async function updatePlan(formData: FormData) {
    "use server";
    const id = formData.get("userId") as string;
    const plan = formData.get("plan") as string;

    const userAuth = await currentUser();
    if (!userAuth || !ADMIN_USER_IDS.includes(userAuth.id)) return;

    await db.update(users).set({ plan }).where(eq(users.id, id));
    revalidatePath("/v/2026/admin");
  }

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage user API limits and plans.
        </p>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">User ID</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Current Plan</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {allUsers.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium">{u.email}</td>
                <td className="p-4 text-muted-foreground font-mono text-xs">
                  {u.id}
                </td>
                <td className="p-4 text-muted-foreground">
                  {u.createdAt.toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      u.plan === "ultimate"
                        ? "bg-primary text-primary-foreground"
                        : u.plan === "pro"
                          ? "bg-blue-500 text-white"
                          : "bg-muted text-foreground"
                    }`}
                  >
                    {u.plan.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <form action={updatePlan} className="flex gap-2 items-center">
                    <input type="hidden" name="userId" value={u.id} />
                    <select
                      name="plan"
                      defaultValue={u.plan}
                      className="px-2 py-1.5 border border-border rounded-lg bg-background text-sm"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="ultimate">Ultimate</option>
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {allUsers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-muted-foreground"
                >
                  No users found. Try logging in to the dashboard first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
