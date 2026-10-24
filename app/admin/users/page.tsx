import { getAdminStudentList } from "@/lib/services/adminService";
import { StudentRosterClient } from "@/components/admin/StudentRosterClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const students = await getAdminStudentList();

  return <StudentRosterClient initialStudents={students} />;
}
