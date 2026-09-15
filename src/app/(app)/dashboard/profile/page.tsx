import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section>
      <h1 className="text-3xl font-bold">Your Profile</h1>

      <div className="mt-6 rounded-lg border p-6">
        <p>
          <span className="font-medium">Email:</span> {user?.email}
        </p>
      </div>
      <Link href="/dashboard/bookings">My Bookings</Link>
    </section>
  );
}
