import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getProductImage } from "@/lib/productImages";

const Customize = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [note, setNote] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [customOrder, setCustomOrder] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProduct();
    // Check if this is a custom order from localStorage
    const customOrders = JSON.parse(localStorage.getItem('customOrders') || '[]');
    const order = customOrders.find((o: any) => o.id === id);
    if (order) {
      setCustomOrder(order);
      setNote(order.description || '');
      if (order.reference_image) {
        setImagePreview(order.reference_image);
      }
    }
  }, [id]);

  const fetchProduct = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      // Transform the data to match the Product type
      const productData = data as unknown as any;
      const transformedProduct: Product = {
        id: productData.id,
        name: productData.name,
        price: productData.price,
        image: productData.image_url || productData.image || '',
        description: productData.description,
        category: productData.category
      };
      setProduct(transformedProduct);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addToCart = () => {
    // Store customization in localStorage for now
    const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
    const customization = {
      productId: id,
      product,
      note,
      image: imagePreview,
      quantity: 1,
    };
    localStorage.setItem("cart", JSON.stringify([...cartItems, customization]));
    toast({ title: "Added to cart with customization!" });
    navigate("/");
  };

  const updateCustomOrder = () => {
    const customOrders = JSON.parse(localStorage.getItem('customOrders') || '[]');
    const orderIndex = customOrders.findIndex((o: any) => o.id === id);
    
    if (orderIndex !== -1) {
      const updatedOrders = [...customOrders];
      updatedOrders[orderIndex] = {
        ...updatedOrders[orderIndex],
        description: note,
        reference_image: imagePreview
      };
      
      localStorage.setItem('customOrders', JSON.stringify(updatedOrders));
      toast({ title: "Custom order updated!" });
    }
  };

  if (!product) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-6">
          {customOrder ? "Edit Your Custom Order" : "Customize Your Product"}
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <img
              src={getProductImage(product.image)}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
              className="w-full rounded-lg shadow-lg"
            />
            <div className="mt-4">
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <p className="text-xl text-primary font-bold mt-2">₹{product.price}</p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Customization Note</Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add any special requests or customization notes..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Reference Image (Optional)</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <span className="text-primary hover:underline">
                          Click to upload
                        </span>
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>

              {customOrder ? (
                <Button onClick={updateCustomOrder} className="w-full">
                  Update Custom Order
                </Button>
              ) : (
                <Button onClick={addToCart} className="w-full">
                  Add to Cart
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Customize;
