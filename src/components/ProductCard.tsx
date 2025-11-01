import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/types/product";
import { ShoppingCart, Heart } from "lucide-react";
import { getProductImage } from "@/lib/productImages";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart, onAddToWishlist }: ProductCardProps) => {
  const [wishlisted, setWishlisted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const isUploaded = !!(product as any).uploaded;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { user: u } } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(u);
        
        // Check if product is in localStorage wishlist (for non-authenticated users)
        const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const isInLocalWishlist = localWishlist.some((item: Product) => item.id === product.id);
        
        if (u) {
          // For authenticated users, check database wishlist
          const { data } = await supabase
            .from("wishlist")
            .select("*")
            .eq("user_id", u.id)
            .eq("product_id", product.id)
            .maybeSingle();

          if (!mounted) return;
          setWishlisted(!!data);
        } else {
          // For non-authenticated users, check localStorage
          if (!mounted) return;
          setWishlisted(isInLocalWishlist);
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [product.id]);

  const toggleWishlist = async () => {
    try {
      if (onAddToWishlist) {
        // Use the new localStorage-based wishlist function
        onAddToWishlist(product);
        // Toggle the local state
        setWishlisted(!wishlisted);
      } else if (user) {
        // Fallback to database wishlist for authenticated users
        if (wishlisted) {
          const { error } = await supabase
            .from("wishlist")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", product.id);
          if (error) throw error;
          setWishlisted(false);
          toast({ title: "Removed from wishlist", description: `${product.name} removed from wishlist.` });
        } else {
          const { error } = await supabase
            .from("wishlist")
            .insert({ user_id: user.id, product_id: product.id });
          if (error) throw error;
          setWishlisted(true);
          toast({ title: "Added to wishlist", description: `${product.name} added to wishlist.` });
        }
      } else {
        toast({ title: "Please log in", description: "Log in to use wishlist" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || 'Failed to update wishlist', variant: 'destructive' });
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product);
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 group">
      <Link to={`/product/${product.id}`}>
        <CardHeader className="p-0">
          <div className="aspect-square overflow-hidden bg-card flex items-center justify-center">
            <img
              src={getProductImage(product.image)}
              alt={product.name}
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg mb-2 transition-colors group-hover:text-primary">{product.name}</CardTitle>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
          <p className="text-2xl font-bold text-primary animate-fade-in">₹{product.price}</p>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="hover:bg-muted"
        >
          <Heart className={`h-5 w-5 ${wishlisted ? "text-rose-500" : "text-muted-foreground"}`} />
        </Button>

        <Button
          onClick={handleAddToCart}
          className="flex-1 hover-scale bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-600 transition-all duration-300"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to cart
        </Button>
        {/* Customize removed per request */}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
