import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { routes } from "./routes";

// Helper to render routes recursively
const renderRoutes = (routes: any[]) => {
  // Debug: print routes for troubleshooting guest landing route matching
  try {
    // eslint-disable-next-line no-console
    console.debug('APP ROUTES:', routes.map((r) => r.path));
    // eslint-disable-next-line no-console
    console.debug('CURRENT PATHNAME:', window?.location?.pathname);
  } catch (e) { }
  return routes.map((route, index) => {
    if (route.children) {
      return (
        <Route key={index} path={route.path} element={route.element}>
          {route.children.map((child: any, childIndex: number) => (
            <Route
              key={childIndex}
              index={child.index}
              path={child.path}
              element={child.element}
            />
          ))}
        </Route>
      );
    }
    return (
      <Route
        key={index}
        path={route.path}
        element={route.element}
      />
    );
  });
};

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        {renderRoutes(routes)}
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
