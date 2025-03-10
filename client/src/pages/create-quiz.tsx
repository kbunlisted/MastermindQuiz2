import { useState } from "react";
import { useLocation } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Sidebar from "@/components/layout/sidebar";

const questionSchema = z.object({
  type: z.enum(["MCQ", "TrueFalse", "ShortAnswer"]),
  text: z.string().min(1, "Question text is required"),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, "Correct answer is required"),
});

const quizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  timeLimit: z.number().min(1, "Time limit must be at least 1 minute"),
  questions: z.array(questionSchema).min(1, "At least one question is required"),
});

type QuizFormData = z.infer<typeof quizSchema>;

export default function CreateQuiz() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      timeLimit: 30,
      questions: [
        {
          type: "MCQ",
          text: "",
          options: ["", "", "", ""],
          correctAnswer: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const createQuizMutation = useMutation({
    mutationFn: async (data: QuizFormData) => {
      const response = await apiRequest("POST", "/api/quizzes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({
        title: "Success",
        description: "Quiz created successfully",
      });
      setLocation("/");
    },
  });

  const onSubmit = (data: QuizFormData) => {
    createQuizMutation.mutate(data);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quiz Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Limit (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Questions</h2>
                <Button
                  type="button"
                  onClick={() =>
                    append({
                      type: "MCQ",
                      text: "",
                      options: ["", "", "", ""],
                      correctAnswer: "",
                    })
                  }
                >
                  Add Question
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Question {index + 1}
                    </h3>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name={`questions.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select question type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MCQ">
                              Multiple Choice
                            </SelectItem>
                            <SelectItem value="TrueFalse">
                              True/False
                            </SelectItem>
                            <SelectItem value="ShortAnswer">
                              Short Answer
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`questions.${index}.text`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Text</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch(`questions.${index}.type`) === "MCQ" && (
                    <div className="space-y-2">
                      <FormLabel>Options</FormLabel>
                      {form
                        .watch(`questions.${index}.options`)
                        ?.map((_, optionIndex) => (
                          <FormField
                            key={optionIndex}
                            control={form.control}
                            name={`questions.${index}.options.${optionIndex}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name={`questions.${index}.correctAnswer`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correct Answer</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <Button
              type="submit"
              disabled={createQuizMutation.isPending}
              className="w-full"
            >
              {createQuizMutation.isPending
                ? "Creating Quiz..."
                : "Create Quiz"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}