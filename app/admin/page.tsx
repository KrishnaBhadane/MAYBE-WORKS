import Link from "next/link";
import { Users, Flame, BookOpen, Layers, PlusCircle, ArrowRight } from "lucide-react";
import { getAdminOverviewStats } from "@/lib/services/adminService";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const stats = await getAdminOverviewStats();

  const cards = [
    { label: "Total Students", value: stats.totalStudents, icon: Users, badge: "Registered" },
    { label: "Active Streaks", value: stats.activeStreaks, icon: Flame, badge: "Daily Habits" },
    { label: "Active Courses", value: stats.totalCourses, icon: BookOpen, badge: "Published" },
    { label: "Track Enrollments", value: stats.totalEnrollments, icon: Layers, badge: "Total" },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-6">
        <div>
          <Badge variant="yellow" className="mb-2">Admin Telemetry</Badge>
          <h1 className="text-3xl font-black text-black tracking-tight uppercase">
            Platform Overview
          </h1>
          <p className="text-xs text-neutral-600 mt-1 font-sans">
            Real-time curriculum enrollment, habit metrics, and system statistics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/courses">
            <Button variant="outline" size="sm">
              <BookOpen className="w-4 h-4 mr-1.5" /> Courses
            </Button>
          </Link>
          <Link href="/admin/tasks">
            <Button variant="yellow" size="sm">
              <PlusCircle className="w-4 h-4 mr-1.5 text-black" /> New Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="border-2 border-black bg-white p-6 rounded-none flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-black uppercase text-neutral-500">
                  {c.label}
                </span>
                <div className="w-8 h-8 bg-black text-[#FAFF00] flex items-center justify-center border border-black">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-4xl font-black text-black font-mono tracking-tight">
                  {c.value}
                </span>
                <div className="mt-2 text-[11px] font-mono text-neutral-500">
                  {c.badge}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Popular Tracks Breakdown */}
      <div className="border-2 border-black bg-white p-6 rounded-none">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black text-black uppercase tracking-tight">
              Pacing Track Popularity
            </h2>
            <p className="text-xs text-neutral-500 font-sans mt-0.5">
              Breakdown of student commitments across daily hour models.
            </p>
          </div>
          <Badge variant="subtle">{stats.popularTracks.length} Active Tracks</Badge>
        </div>

        <div className="border border-black/15 overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#F8F9FA] border-b border-black/15 uppercase font-bold text-neutral-600">
              <tr>
                <th className="p-3">Course</th>
                <th className="p-3">Daily Pace</th>
                <th className="p-3">Track ID</th>
                <th className="p-3 text-right">Enrolled Students</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {stats.popularTracks.map((pt) => (
                <tr key={pt.trackId} className="hover:bg-[#FAFAFA]">
                  <td className="p-3 font-bold text-black">{pt.courseTitle}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-[#FAFF00] border border-black text-[11px] font-bold text-black">
                      {pt.dailyHours}H / Day
                    </span>
                  </td>
                  <td className="p-3 text-neutral-500 text-[11px]">{pt.trackId.slice(0, 18)}...</td>
                  <td className="p-3 text-right font-bold text-black">{pt.enrollmentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/contests"
          prefetch={true}
          className="border-2 border-black bg-[#FAFF00]/15 p-6 hover:shadow-md transition-shadow group flex items-center justify-between md:col-span-2"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-black text-[#FAFF00] font-mono text-[10px] font-black uppercase">
                REA Proctoring
              </span>
              <h3 className="text-base font-black text-black uppercase tracking-tight group-hover:underline">
                CodeChef-Style Contests & Real-Time Proctoring
              </h3>
            </div>
            <p className="text-xs text-neutral-600 font-sans">
              Generate invite codes, monitor tab-switch penalties in real time, view live scoreboard, and kick participants.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/courses"
          prefetch={true}
          className="border-2 border-black bg-white p-6 hover:shadow-md transition-shadow group flex items-center justify-between"
        >
          <div>
            <h3 className="text-base font-black text-black uppercase tracking-tight group-hover:underline">
              Manage Tracks & Curriculum
            </h3>
            <p className="text-xs text-neutral-600 mt-1 font-sans">
              Add new courses, configure 2h/3h/4h tracks, and set total day limits.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/users"
          prefetch={true}
          className="border-2 border-black bg-white p-6 hover:shadow-md transition-shadow group flex items-center justify-between"
        >
          <div>
            <h3 className="text-base font-black text-black uppercase tracking-tight group-hover:underline">
              Student Overrides & Support
            </h3>
            <p className="text-xs text-neutral-600 mt-1 font-sans">
              View student progress, force unlock days for testing, and manage habit streaks.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
