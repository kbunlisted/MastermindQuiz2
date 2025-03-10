import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";

export default function TakeQuiz() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const { data: quiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ["/api/quizzes", id],
    queryFn: async () => {
      const response = await fetch(`/api/quizzes/${id}`);
      if (!response.ok) throw new Error("Failed to fetch quiz");
      return response.json();
    },
  });

  const startQuizMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/quizzes/${id}/attempts`);
      return response.json();
    },
  });

  const submitQuizMutation = useMutation({
    mutationFn: async (data: { answers: Record<number, string> }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/attempts/${startQuizMutation.data?.id}`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({
        title: "Success",
        description: "Quiz submitted successfully",
      });
      setLocation("/");
    },
  });

  useEffect(() => {
    if (quiz?.timeLimit && startQuizMutation.data) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null) return quiz.timeLimit * 60;
          if (prev <= 0) {
            clearInterval(timer);
            submitQuizMutation.mutate({ answers });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz?.timeLimit, startQuizMutation.data]);

  if (isLoadingQuiz || !quiz) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          {timeLeft !== null && (
            <div
              className={`text-xl font-semibold ${
                timeLeft < 60 ? "text-red-500" : ""
              }`}
            >
              Time Left: {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {!startQuizMutation.data ? (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Ready to start the quiz?
              </h2>
              <p className="mb-4">
                You will have {quiz.timeLimit} minutes to complete this quiz.
              </p>
              <Button onClick={() => startQuizMutation.mutate()}>
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {quiz.questions.map((question: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Question {index + 1}: {question.text}
                  </h3>

                  {question.type === "MCQ" && (
                    <RadioGroup
                      onValueChange={(value) =>
                        handleAnswer(question.id, value)
                      }
                      value={answers[question.id]}
                    >
                      {question.options.map((option: string, i: number) => (
                        <div key={i} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`q${index}-o${i}`} />
                          <Label htmlFor={`q${index}-o${i}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.type === "TrueFalse" && (
                    <RadioGroup
                      onValueChange={(value) =>
                        handleAnswer(question.id, value)
                      }
                      value={answers[question.id]}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id={`q${index}-true`} />
                        <Label htmlFor={`q${index}-true`}>True</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id={`q${index}-false`} />
                        <Label htmlFor={`q${index}-false`}>False</Label>
                      </div>
                    </RadioGroup>
                  )}

                  {question.type === "ShortAnswer" && (
                    <Input
                      value={answers[question.id] || ""}
                      onChange={(e) =>
                        handleAnswer(question.id, e.target.value)
                      }
                      placeholder="Type your answer here..."
                    />
                  )}
                </CardContent>
              </Card>
            ))}

            <Button
              className="w-full"
              onClick={() => submitQuizMutation.mutate({ answers })}
              disabled={submitQuizMutation.isPending}
            >
              {submitQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}