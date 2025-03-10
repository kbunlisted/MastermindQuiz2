import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCard } from "@/components/ui/badge-card";
import Sidebar from "@/components/layout/sidebar";
import { Loader2 } from "lucide-react";

type Stats = {
  assigned?: number;
  completed?: number;
  averageScore?: number;
  created?: number;
  activeStudents?: number;
  averagePerformance?: number;
};

type UserBadge = {
  id: string;
  name: string;
  description: string;
  image: string;
  earnedAt: string;
};

export default function Dashboard() {
  const { user } = useAuth();

  // Fetch user stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/quizzes"],
    queryFn: async () => {
      const response = await fetch("/api/quizzes");
      return response.json();
    },
  });

  // Fetch user achievements
  const { data: badges, isLoading: isLoadingBadges } = useQuery({
    queryKey: ["/api/user/achievements"],
    queryFn: async () => {
      const response = await fetch("/api/user/achievements");
      return response.json();
    },
  });

  if (isLoadingStats || isLoadingBadges) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome, {user?.username}!</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {user?.role === "student" && (
            <>
              <DashboardCard
                title="Assigned Quizzes"
                value={stats?.assigned || 0}
                description="Quizzes waiting for you"
              />
              <DashboardCard
                title="Completed"
                value={stats?.completed || 0}
                description="Quizzes you've finished"
              />
              <DashboardCard
                title="Average Score"
                value={`${stats?.averageScore || 0}%`}
                description="Your performance"
              />
            </>
          )}
          {(user?.role === "teacher" || user?.role === "admin") && (
            <>
              <DashboardCard
                title="Created Quizzes"
                value={stats?.created || 0}
                description="Total quizzes created"
              />
              <DashboardCard
                title="Active Students"
                value={stats?.activeStudents || 0}
                description="Students taking quizzes"
              />
              <DashboardCard
                title="Average Performance"
                value={`${stats?.averagePerformance || 0}%`}
                description="Student performance"
              />
            </>
          )}
        </div>

        {/* Achievements Section */}
        {user?.role === "student" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Your Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges && badges.length > 0 ? (
                badges.map((badge) => (
                  <BadgeCard key={badge.id} {...badge} />
                ))
              ) : (
                <p className="text-muted-foreground col-span-full text-center py-8">
                  Complete quizzes to earn achievement badges!
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number | string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}