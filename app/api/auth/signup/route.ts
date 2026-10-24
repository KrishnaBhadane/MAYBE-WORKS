import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Check if user already exists
    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error("Error listing users:", listError);
    }

    const existingUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase().trim()
    );

    let userId: string;

    if (existingUser) {
      // If user exists, update password and ensure email is confirmed
      const { data: updated, error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password,
          email_confirm: true,
        });

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }
      userId = updated.user.id;
    } else {
      // 2. Create new user with email pre-confirmed
      const { data: created, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: email.toLowerCase().trim(),
          password,
          email_confirm: true,
        });

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }

      userId = created.user.id;
    }

    // 3. Ensure profile record exists
    await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email: email.toLowerCase().trim(),
        role: "student",
        streak_count: 0,
      },
      { onConflict: "id" }
    );

    return NextResponse.json({ success: true, userId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
