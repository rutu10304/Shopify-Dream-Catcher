import { ShoppingCart, Heart, Sparkles, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";
import { useNavigate } from "react-router-dom";
import * as cartLib from "@/lib/cart";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface HeaderProps {
  cartItemsCount?: number;
  onCartClick?: () => void;
}

const Header = ({ cartItemsCount = 0, onCartClick }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  // If parent doesn't provide cart count, read from persisted cart so count is accurate across routes
  const persistedCount = cartItemsCount || cartLib.getCart().reduce((s, i) => s + i.quantity, 0);
  // Get wishlist count from localStorage for all users
  const wishlistCount = cartLib.getWishlist().length;

  return (
  <header
    style={{
      backgroundImage: 'linear-gradient(135deg, #F7EDE2 0%, #F2E6D9 70%), var(--gradient-subtle)',
      backgroundSize: '180% 180%, auto',
      backgroundRepeat: 'no-repeat, repeat',
      color: 'hsl(var(--card-foreground))',
      borderBottomColor: 'hsl(var(--border))'
    }}
    className="sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors duration-300"
  >
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer hover-scale" onClick={() => navigate("/")}>
          <div className="flex items-center justify-center rounded-full overflow-hidden bg-white/10 md:bg-transparent" style={{ width: 48, height: 48 }}>
            <img src={logo} alt="The Right Knot" className="w-full h-full object-contain" />
          </div>
          <div className="ml-2">
            <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--card-foreground))" }}>
              The Right Knot
            </h1>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Handcrafted Dreams</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/custom-order")}
            className="gap-2 hidden md:flex"
            style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
          >
            <Sparkles className="h-4 w-4" />
            Custom Design
          </Button>

          {/* Wishlist: small icon-only on mobile, pill-style on md+ */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/wishlist")}
            className="relative md:hidden"
            style={{ color: 'hsl(var(--primary-foreground))' }}
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <Badge
                variant="default"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {wishlistCount}
              </Badge>
            )}
          </Button>

          <Button
            onClick={() => navigate("/wishlist")}
            className="gap-2 hidden md:flex"
            style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
          >
            <Heart className="h-4 w-4" />
            <span className="text-sm font-medium">Wishlist</span>
            {wishlistCount > 0 && (
              <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-xs">{wishlistCount}</Badge>
            )}
          </Button>

          {/* Theme toggle: icon on mobile, pill on md+ */}
          <ThemeToggle showLabel={false} className="md:hidden" />
          <ThemeToggle showLabel={true} className="hidden md:flex" />

          {/* Cart: small icon-only on mobile, pill-style on md+ */}
          {onCartClick && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCartClick}
                className="relative md:hidden"
                style={{ color: 'hsl(var(--primary-foreground))' }}
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {persistedCount > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {persistedCount}
                  </Badge>
                )}
              </Button>

              <Button
                onClick={onCartClick}
                className="gap-2 hidden md:flex"
                style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm font-medium">Cart</span>
                {persistedCount > 0 && (
                  <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-xs">{persistedCount}</Badge>
                )}
              </Button>
            </>
          )}

         {/* Profile: small icon-only on mobile, pill-style on md+ */}
         {user && (
           <>
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button
                   variant="ghost"
                   size="icon"
                   className="relative md:hidden"
                   style={{ color: 'hsl(var(--primary-foreground))' }}
                   aria-label="Account"
                 >
                   <User className="h-5 w-5" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                 <DropdownMenuItem onClick={signOut}>
                   <LogOut className="mr-2 h-4 w-4" />
                   <span>Sign out</span>
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
             
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button
                   className="gap-2 hidden md:flex"
                   style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                 >
                   <User className="h-4 w-4" />
                   <span className="text-sm font-medium">Profile</span>
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                 <DropdownMenuItem onClick={signOut}>
                   <LogOut className="mr-2 h-4 w-4" />
                   <span>Sign out</span>
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
           </>
         )}
        </div>
      </div>
    </header>
  );
};

export default Header;
