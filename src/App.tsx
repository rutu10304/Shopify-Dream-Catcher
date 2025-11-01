import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearCart } from "@/lib/cart";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminSettings from "./pages/AdminSettings";
import CustomOrder from "./pages/CustomOrder";
import NotFound from "./pages/NotFound";
import Categories from "./pages/Categories";
import CategoryPage from "./pages/CategoryPage";
import ProductDetail from "./pages/ProductDetail";
import Customize from "./pages/Customize";
import Wishlist from "./pages/Wishlist";
import Feedback from "./pages/Feedback";
import Search from "./pages/Search";
import Shop from "./pages/Shop";
import AdminOrders from "./pages/AdminOrders";
import AdminFeedback from "./pages/AdminFeedback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Redirect to homepage on full page reloads and clear persisted cart */}
          <RedirectOnReload />
          <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/custom-order" element={<CustomOrder />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/customize/:id" element={<Customize />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/search" element={<Search />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/feedback" element={<AdminFeedback />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

function RedirectOnReload() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      let isReload = false;
      // Modern API
      const navEntries = (performance.getEntriesByType && performance.getEntriesByType('navigation')) as PerformanceNavigationTiming[] | undefined;
      if (navEntries && navEntries.length > 0) {
        isReload = navEntries[0].type === 'reload';
      } else {
        // Fallback (may be undefined in some browsers)
        // @ts-ignore
        if ((performance as any).navigation) {
          // @ts-ignore
          isReload = (performance as any).navigation.type === 1;
        }
      }

      if (isReload) {
        try { clearCart(); } catch {}
        if (location.pathname !== '/') navigate('/', { replace: true });
      }
    } catch (e) {
      // ignore errors — non-critical
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
