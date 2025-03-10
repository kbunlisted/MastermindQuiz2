import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import CreateQuiz from "@/pages/create-quiz";
import TakeQuiz from "@/pages/take-quiz";
import Leaderboard from "@/pages/leaderboard";
import QuizList from "@/pages/quiz-list";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/quizzes" component={QuizList} />
      <ProtectedRoute path="/create-quiz" component={CreateQuiz} />
      <ProtectedRoute path="/quiz/:id" component={TakeQuiz} />
      <ProtectedRoute path="/leaderboard" component={Leaderboard} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;