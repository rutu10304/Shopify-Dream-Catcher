import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/product";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as cartLib from "@/lib/cart";

const Wishlist = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUserAndFetch();
  }, []);

  const checkUserAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      fetchWishlist(user.id);
    } else {
      // For non-authenticated users, get wishlist from localStorage
      const localWishlist = cartLib.getWishlist();
      setProducts(localWishlist);
      setLoading(false);
    }
  };

  const fetchWishlist = async (userId: string) => {
    const { data, error } = await supabase
      .from("wishlist")
      .select("*, products(*)")
      .eq("user_id", userId);

    if (data) {
      // Transform the data to match the Product type
      const transformedProducts: Product[] = (data as any[]).map(item => {
        const product = item.products as any;
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || '',
          description: product.description,
          category: product.category
        };
      });
      setProducts(transformedProducts);
    }
    setLoading(false);
  };

  const addToCart = (product: Product) => {
    cartLib.addToCart(product);
    toast({ title: "Added to cart", description: `${product.name} has been added to your cart` });
  };

  const addToWishlist = (product: Product) => {
    // Use cartLib function to handle wishlist
    const updated = cartLib.addToWishlist(product);
    // Check if product was added or removed
    const isInWishlist = updated.some(item => item.id === product.id);
    
    // Show appropriate message
    toast({
      title: isInWishlist ? "Added to wishlist" : "Removed from wishlist",
      description: `${product.name} has been ${isInWishlist ? 'added to' : 'removed from'} your wishlist.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Wishlist</h1>
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="mx-auto h-24 w-24 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">Your wishlist is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onAddToWishlist={addToWishlist}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
