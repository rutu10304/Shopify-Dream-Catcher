import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Cart from "@/components/Cart";
import * as cartLib from "@/lib/cart";

const CategoryPage = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  const categoryName = slug?.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  useEffect(() => {
    fetchProducts();
  }, [slug]);

  // Listen for cart updates from Cart component
  useEffect(() => {
    const handleCartUpdate = () => {
      const saved = cartLib.getCart();
      setCartItems(saved);
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("category", `%${slug?.replace('-', ' ')}%`);

      if (error) throw error;
      
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const addToWishlist = (product: Product) => {
    // Use the cartLib function to handle wishlist
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
        <Header cartItemsCount={cartItems.reduce((s, i) => s + (i.quantity || 0), 0)} onCartClick={() => setIsCartOpen(true)} />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading products...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
  <Header cartItemsCount={cartItems.reduce((s, i) => s + (i.quantity || 0), 0)} onCartClick={() => setIsCartOpen(true)} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/categories">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Button>
          </Link>
        </div>
        <h1 className="text-4xl font-bold mb-8">{categoryName}</h1>
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground">No products found in this category yet.</p>
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
      <Cart
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={(id, quantity) => {
          setCartItems(
            cartItems.map((item) =>
              item.id === id ? { ...item, quantity } : item
            )
          );
        }}
        onRemoveItem={(id) => {
          setCartItems(cartItems.filter((item) => item.id !== id));
        }}
      />
      <Footer />
    </div>
  );
};

export default CategoryPage;
