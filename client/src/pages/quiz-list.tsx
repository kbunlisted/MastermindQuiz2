import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import { Quiz } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";

export default function QuizList() {
  const { user } = useAuth();

  const { data: quizzes, isLoading } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Available Quizzes</h1>
          {user?.role !== "student" && (
            <Link href="/create-quiz">
              <Button>Create New Quiz</Button>
            </Link>
          )}
        </div>

        <div className="grid gap-6">
          {quizzes?.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Time limit: {quiz.timeLimit} minutes
                </p>
                <Link href={`/quiz/${quiz.id}`}>
                  <Button>Take Quiz</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
