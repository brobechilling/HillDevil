import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { useAuthStore } from "./store/authStore";
import { useSessionStore } from "./store/sessionStore";
import { initializeMockData } from './lib/mockDataInit';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from "./components/theme-provider.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

function AppWrapper() {
  const initializeMock = useAuthStore((state) => state.initialize);
  const initializeSession = useSessionStore((state) => state.initialize);

  useEffect(() => {
    initializeMockData();
    initializeMock();
    initializeSession();
  }, [initializeSession]);

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ErrorBoundary>
          <AppWrapper />
          <ReactQueryDevtools />
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);