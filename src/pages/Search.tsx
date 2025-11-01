import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useNavigate } from "react-router-dom";
import * as cartLib from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    searchProducts();
  }, [query]);

  // Listen for cart updates from Cart component
  useEffect(() => {
    const handleCartUpdate = () => {
      const saved = cartLib.getCart();
      setCartItems(saved);
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const searchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);

    if (data) {
      // Transform the data to match the Product type
      const transformedData: Product[] = (data as unknown[]).map((product: any) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || '',
        description: product.description,
        category: product.category
      }));
      setProducts(transformedData);
    }
    setLoading(false);
  };

  const { toast } = useToast();

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Search Results for "{query}"
        </h1>
        {loading ? (
          <p>Searching...</p>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground">No products found matching your search.</p>
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

export default Search;
