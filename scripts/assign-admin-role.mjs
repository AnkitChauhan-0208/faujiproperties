import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

if (!supabaseUrl || !serviceRoleKey || !adminEmail) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and ADMIN_EMAIL are required.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (error) throw error;

const matchingUsers = data.users.filter((user) => user.email?.trim().toLowerCase() === adminEmail);
if (matchingUsers.length !== 1) {
  throw new Error(`Expected exactly one Supabase user for ADMIN_EMAIL; found ${matchingUsers.length}.`);
}

const user = matchingUsers[0];
const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
  app_metadata: { ...user.app_metadata, role: "admin" },
});
if (updateError) throw updateError;

const role = updated.user.app_metadata?.role;
if (role !== "admin") {
  throw new Error("Supabase did not persist app_metadata.role=admin.");
}

console.log(`Admin role assigned to ${adminEmail}. app_metadata.role=${role}`);
console.log("Log out and log back in before testing the new JWT claim.");
