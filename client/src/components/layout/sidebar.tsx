import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  PlusCircle,
  Trophy,
  BarChart,
  LogOut,
  Home,
  List
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const navItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
      roles: ["student", "teacher", "admin"],
    },
    {
      title: "Create Quiz",
      icon: PlusCircle,
      href: "/create-quiz",
      roles: ["teacher", "admin"],
    },
    {
      title: "Quizzes",
      icon: List,
      href: "/quizzes",
      roles: ["student", "teacher", "admin"],
    },
    {
      title: "Leaderboard",
      icon: Trophy,
      href: "/leaderboard",
      roles: ["student", "teacher", "admin"],
    },
    {
      title: "Analytics",
      icon: BarChart,
      href: "/analytics",
      roles: ["teacher", "admin"],
    },
  ];

  return (
    <div className="flex flex-col h-screen border-r bg-sidebar">
      <div className="p-6">
        <h1 className="text-2xl font-bold">MasterMindQuiz</h1>
      </div>

      <ScrollArea className="flex-1 px-4">
        <nav className="space-y-2">
          {navItems
            .filter((item) => item.roles.includes(user?.role || ""))
            .map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                    location === item.href && "bg-accent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </a>
              </Link>
            ))}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}