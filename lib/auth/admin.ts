import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StaffRole = "owner" | "admin" | "editor";

export type CurrentStaff = {
  userId: string;
  displayName: string | null;
  role: StaffRole;
  active: boolean;
};

export async function getCurrentStaff(): Promise<CurrentStaff | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: staff } = await supabase
    .from("staff_profiles")
    .select("user_id, display_name, role, active")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (!staff) {
    return null;
  }

  return {
    userId: staff.user_id,
    displayName: staff.display_name,
    role: staff.role as StaffRole,
    active: staff.active,
  };
}

export async function requireActiveStaff() {
  const staff = await getCurrentStaff();

  if (!staff) {
    redirect("/admin/login");
  }

  return staff;
}

export async function requireRole(allowedRoles: StaffRole[]) {
  const staff = await requireActiveStaff();

  if (!allowedRoles.includes(staff.role)) {
    redirect("/");
  }

  return staff;
}