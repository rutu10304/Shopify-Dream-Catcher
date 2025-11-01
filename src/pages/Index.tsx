import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import Cart from "@/components/Cart";
import Testimonials from "@/components/Testimonials";
import LunaChatbot from "@/components/LunaChatbot";
import Footer from "@/components/Footer";
import OffersSection from "@/components/OffersSection";
import { Product, CartItem } from "@/types/product";
import { dedupeById } from "@/lib/utils";
import * as cartLib from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  const categories = ["all", "dreamcatcher", "keychain", "wall-hanging", "photo-frame", "macrame"];

  useEffect(() => {
    checkUser();
    fetchProducts();
  }, []);
  // Initialize cart from persisted storage
  useEffect(() => {
    const saved = cartLib.getCart();
    if (saved && saved.length) setCartItems(saved);
  }, []);

  // Listen for cart updates from Cart component
  useEffect(() => {
    const handleCartUpdate = () => {
      const saved = cartLib.getCart();
      setCartItems(saved);
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);

    if (session?.user) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!roleData);
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } else {
      // Transform the data to match the Product type
      const transformedData: Product[] = (data as unknown[]).map((product: any) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image ||  '',
        description: product.description,
        category: product.category
      }));
      
      // Deduplicate returned products by id to avoid duplicates in the UI
      setProducts(dedupeById(transformedData));
    }
  };

  const addToCart = (product: Product) => {
    const updated = cartLib.addToCart(product);
    setCartItems(updated);

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
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

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart",
    });
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-secondary/20 home-animate">
      <Header cartItemsCount={totalItems} onCartClick={() => setIsCartOpen(true)} />
      
      <div className="container py-4 flex justify-end gap-2">
        {!user ? (
          <Button onClick={() => navigate("/auth")} variant="outline">
            Sign In
          </Button>
        ) : (
          <>
            {isAdmin && (
              <Button onClick={() => navigate("/admin")}>
                Admin Dashboard
              </Button>
            )}
            <Button
              onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
                setIsAdmin(false);
                toast({ title: "Logged out successfully" });
              }}
              variant="outline"
            >
              Logout
            </Button>
          </>
        )}
      </div>
      
      <main className="container py-12">
        {/* Hero Section */}
        <div style={{ backgroundColor: "hsl(var(--navbar-bg))" }} className="text-center mb-16 animate-fade-in py-12 rounded-lg">
          <h1 className="text-5xl font-bold mb-4" style={{ color: "hsl(var(--primary-foreground))" }}>
            Handcrafted with Love
          </h1>
          <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: "hsl(var(--primary-foreground))" }}>
            Each piece is carefully handmade with love and intention. 
            Explore our collection of dreamcatchers, keychains, wall hangings, and photo frames.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/custom-order")}
            className="gap-2 hover-scale"
          >
            <Sparkles className="h-5 w-5" />
            Create Custom Design
          </Button>
        </div>

        {/* Categories and Products Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center animate-fade-in">Our Collection</h2>
          
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto mb-8 grid-cols-3 md:grid-cols-6 animate-slide-in-right">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="capitalize"
                >
                  {category === "all" ? "All" : category.replace("-", " ")}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={selectedCategory}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <div 
                    key={product.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={addToCart}
                      onAddToWishlist={addToWishlist}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Offers Section */}
        <OffersSection />

        {/* Testimonials */}
        <Testimonials />
      </main>

      {/* Chatbot */}
      <LunaChatbot />
      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />
    </div>
  );
};

export default Index;
