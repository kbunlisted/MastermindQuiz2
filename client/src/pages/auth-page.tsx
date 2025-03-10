import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const authSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6),
  role: z.enum(["student", "teacher", "admin"]).optional(),
});

// Password reset schemas
const resetPasswordSchema = z.object({
  username: z.string().min(3).max(20),
});

const verifyCodeSchema = z.object({
  code: z.string().length(6),
  newPassword: z.string().min(6),
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "student",
    },
  });

  const [resetStep, setResetStep] = useState<"request" | "verify" | null>(null);
  const [resetUsername, setResetUsername] = useState("");

  const resetForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      username: "",
    },
  });

  const verifyForm = useForm<z.infer<typeof verifyCodeSchema>>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: "",
      newPassword: "",
    },
  });

  const requestResetMutation = useMutation({
    mutationFn: async (data: { username: string }) => {
      const res = await apiRequest("POST", "/api/request-reset", data);
      return res.json();
    },
    onSuccess: (data) => {
      useToast({
        title: "Reset Code Sent",
        description: "Please check your email for the reset code",
      });
      setResetUsername(resetForm.getValues().username);
      setResetStep("verify");
    },
  });

  const verifyAndResetMutation = useMutation({
    mutationFn: async (data: z.infer<typeof verifyCodeSchema>) => {
      const res = await apiRequest("POST", "/api/reset-password", {
        username: resetUsername,
        ...data,
      });
      return res.json();
    },
    onSuccess: () => {
      useToast({
        title: "Success",
        description: "Password reset successfully. Please login.",
      });
      setResetStep(null);
    },
  });

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold">MasterMindQuiz</h1>
            <p className="text-muted-foreground mt-2">
              Your comprehensive educational platform for creating and taking
              quizzes
            </p>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="reset">Reset</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit((data) =>
                        loginMutation.mutate(data),
                      )}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign in"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Sign up for a new account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit((data) =>
                        registerMutation.mutate(data),
                      )}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                              <select
                                {...field}
                                className="w-full p-2 border rounded"
                              >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending
                          ? "Creating account..."
                          : "Create account"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reset">
              <Card>
                <CardHeader>
                  <CardTitle>Reset Password</CardTitle>
                  <CardDescription>
                    {resetStep === "verify"
                      ? "Enter the code sent to your email and your new password"
                      : "Enter your username to receive a reset code"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {resetStep === "verify" ? (
                    <Form {...verifyForm}>
                      <form
                        onSubmit={verifyForm.handleSubmit((data) =>
                          verifyAndResetMutation.mutate(data)
                        )}
                        className="space-y-4"
                      >
                        <FormField
                          control={verifyForm.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reset Code</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter 6-digit code" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={verifyForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={verifyAndResetMutation.isPending}
                        >
                          {verifyAndResetMutation.isPending
                            ? "Resetting Password..."
                            : "Reset Password"}
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    <Form {...resetForm}>
                      <form
                        onSubmit={resetForm.handleSubmit((data) =>
                          requestResetMutation.mutate(data)
                        )}
                        className="space-y-4"
                      >
                        <FormField
                          control={resetForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={requestResetMutation.isPending}
                        >
                          {requestResetMutation.isPending
                            ? "Requesting Reset..."
                            : "Request Reset Code"}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden md:block">
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Features</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>Create and manage quizzes</li>
                <li>Multiple question types</li>
                <li>Real-time results</li>
                <li>Performance analytics</li>
                <li>Leaderboards</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}