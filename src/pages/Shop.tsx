import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { CartItem } from "@/types/product";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import Cart from "@/components/Cart";
import LunaChatbot from "@/components/LunaChatbot";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { dedupeById } from "@/lib/utils";
import * as cartLib from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
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

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) {
      // Transform the data to match the Product interface
      const transformedData: Product[] = (data as unknown[]).map(item => {
        const product = item as any;
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image, // Map 'image' to 'image_url'
          description: product.description,
          category: product.category
        };
      });
      
      // Deduplicate products by id in case the backend returns duplicates
      const unique = dedupeById(transformedData);
      setProducts(unique);
      const uniqueCategories = ["All", ...new Set(transformedData.map((p) => p.category).filter(Boolean))];
      setCategories(uniqueCategories as string[]);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    filtered.sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return a.name.localeCompare(b.name);
    });

    setFilteredProducts(filtered);
  };

  const addToCart = (product: Product) => {
    const updated = cartLib.addToCart(product);
    setCartItems(updated);
    setIsCartOpen(true);
  };

  const addToWishlist = (product: Product) => {
    // Add to wishlist without requiring login
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
      removeItem(id);
      return;
    }
    setCartItems(items =>
      items.map(item => item.id === id ? { ...item, quantity } : item)
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col home-animate">
      <Header 
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Shop All Products
        </h1>

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <SearchBar />
          
          <div className="flex gap-4 w-full md:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="flex flex-wrap justify-center gap-2 h-auto p-2">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              onAddToWishlist={addToWishlist}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found in this category.</p>
          </div>
        )}
      </main>

  <Footer />
  <LunaChatbot />
      
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

export default Shop;
