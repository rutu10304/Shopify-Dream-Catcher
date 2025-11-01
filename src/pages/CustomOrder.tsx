import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Upload, MessageSquare, ArrowLeft } from "lucide-react";

const CustomOrder = () => {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Store custom order in localStorage for non-authenticated users
      const customOrders = JSON.parse(localStorage.getItem('customOrders') || '[]');
      const orderId = Date.now().toString();
      
      let imagePath = null;
      
      // For demo purposes, we'll store the image as base64 in localStorage
      if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          imagePath = reader.result as string;
        };
        reader.readAsDataURL(imageFile);
      }

      const newOrder = {
        id: orderId,
        description,
        reference_image: imagePath,
        timestamp: new Date().toISOString()
      };

      // Save to localStorage
      localStorage.setItem('customOrders', JSON.stringify([...customOrders, newOrder]));

      toast({
        title: "Success",
        description: "Custom order submitted! Admin will contact you soon.",
      });

      // Navigate to custom design page
      navigate(`/customize/${orderId}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-secondary/20 home-animate">
  <Header />
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="m-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="container py-12 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Custom Order Request
            </CardTitle>
            <CardDescription>
              Upload a reference image and describe what you'd like us to create
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="image">Reference Image (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                        }}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </div>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your custom order in detail. Include size, colors, style preferences, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Custom Order"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomOrder;
