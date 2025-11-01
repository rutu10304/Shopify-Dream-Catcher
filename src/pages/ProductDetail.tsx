import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Heart, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getProductImage } from "@/lib/productImages";
import * as cartLib from "@/lib/cart";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userReview, setUserReview] = useState({ rating: 5, comment: "" });
  const [user, setUser] = useState<any>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchProduct();
    fetchReviews();
  }, [id]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      checkWishlist(user.id);
    }
  };

  const checkWishlist = async (userId: string) => {
    const { data } = await supabase
      .from("wishlist")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", id)
      .single();
    setIsInWishlist(!!data);
  };

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      // Transform the data to match the Product type
      const productData = data as unknown as any;
      const transformedProduct: Product = {
        id: productData.id,
        name: productData.name,
        price: productData.price,
        image: productData.image,
        description: productData.description,
        category: productData.category
      };
      
      setProduct(transformedProduct);
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

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("product_reviews")
      .select("*, profiles(full_name)")
      .eq("product_id", id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data);
      const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length || 0;
      setAverageRating(avg);
    }
  };

  const submitReview = async () => {
    if (!user) {
      toast({ title: "Please log in to leave a review" });
      return;
    }

    const { error } = await supabase
      .from("product_reviews")
      .upsert({
        product_id: id,
        user_id: user.id,
        rating: userReview.rating,
        comment: userReview.comment,
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review submitted!" });
      setUserReview({ rating: 5, comment: "" });
      fetchReviews();
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast({ title: "Please log in to use wishlist" });
      return;
    }

    if (isInWishlist) {
      await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", id);
      setIsInWishlist(false);
      toast({ title: "Removed from wishlist" });
    } else {
      await supabase
        .from("wishlist")
        .insert({ user_id: user.id, product_id: id });
      setIsInWishlist(true);
      toast({ title: "Added to wishlist" });
    }
  };

  const addToCart = () => {
    if (!product) return;
    cartLib.addToCart(product);
    toast({ title: "Added to cart", description: `${product.name} has been added to your cart` });
  };

  if (loading || !product) {
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
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <img
              src={getProductImage(product.image)}
              alt={product.name}
              className="w-full h-48 object-cover rounded-md mb-2"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= averageRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({reviews.length} reviews)
              </span>
            </div>
            <p className="text-3xl font-bold text-primary mb-4">₹{product.price}</p>
            <p className="text-muted-foreground mb-6">{product.description}</p>
            <div className="flex gap-4">
              <Button onClick={addToCart} className="flex-1">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Customize & Add to Cart
              </Button>
              <Button
                variant={isInWishlist ? "default" : "outline"}
                onClick={toggleWishlist}
                size="icon"
              >
                <Heart className={isInWishlist ? "fill-current" : ""} />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">Leave a Review</h2>
              <div className="space-y-4">
                <div>
                  <Label>Rating</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 cursor-pointer ${
                          star <= userReview.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                        onClick={() => setUserReview({ ...userReview, rating: star })}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Comment</Label>
                  <Textarea
                    value={userReview.comment}
                    onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
                    placeholder="Share your experience..."
                  />
                </div>
                <Button onClick={submitReview}>Submit Review</Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{review.profiles?.full_name || "Anonymous"}</span>
                    </div>
                    {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
