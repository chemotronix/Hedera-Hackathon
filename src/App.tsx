import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Mint from "./pages/Mint";
import Retire from "./pages/Retire";
import Transfer from "./pages/Transfer";
import NotFound from "./pages/NotFound";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { ethers } from "ethers";

// const getLibrary = (provider: any) => {
//   return new Web3Provider(provider);
// };

// const getLibrary = (provider: any) => {
//   return new ethers.providers.Web3Provider(provider);
// };

const queryClient = new QueryClient();

const App = () => (
  // <Web3ReactProvider getLibrary={getLibrary}>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              {/* Global header with sidebar trigger */}
              <header className="h-14 flex items-center border-b border-border bg-background px-4">
                <SidebarTrigger />
              </header>

              {/* Main content */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/mint" element={<Mint />} />
                  <Route path="/retire" element={<Retire />} />
                  <Route path="/transfer" element={<Transfer />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  // </Web3ReactProvider>
);

export default App;
