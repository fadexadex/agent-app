import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import GeneratingPage from "./pages/GeneratingPage.tsx";
import StoryboardPage from "./pages/StoryboardPage.tsx";
import EditorPage from "./pages/EditorPage.tsx";
import ExportPage from "./pages/ExportPage.tsx";
import VideosPage from "./pages/VideosPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import { Paywall } from "./components/Paywall.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Paywall>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/generating" element={<GeneratingPage />} />
            <Route path="/storyboard" element={<StoryboardPage />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </Paywall>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
