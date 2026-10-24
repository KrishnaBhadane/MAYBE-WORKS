"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, BarChart3, BookOpen, PlusCircle, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface AdminHeaderProps {
  userEmail: string;
}

const adminTabs = [
  { href: "/admin", label: "Overview", icon: BarChart3, exact: true },
  { href: "/admin/courses", label: "Courses & Tracks", icon: BookOpen, exact: false },
  { href: "/admin/tasks", label: "Task Builder", icon: PlusCircle, exact: false },
  { href: "/admin/users", label: "Student Roster", icon: Users, exact: false },
];

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  const pathname = usePathname();

  return (
    <div className="border-b-2 border-black bg-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black text-[#FAFF00] flex items-center justify-center border border-black">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black uppercase text-black tracking-wider">
                Platform Admin CMS
              </span>
              <Badge variant="yellow">SUPERUSER</Badge>
            </div>
            <span className="text-xs text-neutral-500 font-mono">{userEmail}</span>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-black hover:underline"
        >
          Exit to Student Dashboard <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
        {adminTabs.map((tab) => {
          const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "border-black text-black bg-[#F8F9FA]"
                  : "border-transparent text-neutral-500 hover:text-black hover:border-black/30"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
