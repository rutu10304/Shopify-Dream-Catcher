import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  display_order: number;
  is_active: boolean;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  image: string;
  is_active: boolean;
}

const AdminSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "", description: "", image: "" });
  const [newOffer, setNewOffer] = useState({ title: "", description: "", discount_percentage: 0, image: "" });

  useEffect(() => {
    checkAdmin();
    fetchSettings();
    fetchCategories();
    fetchOffers();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      navigate("/");
    }
  };

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .eq("setting_key", "admin_whatsapp")
      .single();

    if (data) {
      setWhatsappNumber(data.setting_value);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("display_order");
    
    if (data) setCategories(data);
  };

  const fetchOffers = async () => {
    const { data } = await supabase
      .from("offers")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setOffers(data);
  };

  const updateWhatsappNumber = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ setting_key: "admin_whatsapp", setting_value: whatsappNumber });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "WhatsApp number updated!" });
    }
    setLoading(false);
  };

  const addCategory = async () => {
    setLoading(true);
    const { error } = await supabase.from("categories").insert([newCategory]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Category added!" });
      setNewCategory({ name: "", slug: "", description: "", image: "" });
      fetchCategories();
    }
    setLoading(false);
  };

  const addOffer = async () => {
    setLoading(true);
    const { error } = await supabase.from("offers").insert([newOffer]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Offer added!" });
      setNewOffer({ title: "", description: "", discount_percentage: 0, image: "" });
      fetchOffers();
    }
    setLoading(false);
  };

  const toggleCategoryStatus = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (!error) {
      fetchCategories();
      toast({ title: "Success", description: "Category status updated!" });
    }
  };

  const toggleOfferStatus = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("offers")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (!error) {
      fetchOffers();
      toast({ title: "Success", description: "Offer status updated!" });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-4xl font-bold">Admin Settings</h1>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="whatsapp">Admin WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
                <Button onClick={updateWhatsappNumber} disabled={loading}>
                  Update WhatsApp Number
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Category Name</Label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Slug (URL-friendly)</Label>
                  <Input
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input
                    value={newCategory.image}
                    onChange={(e) => setNewCategory({ ...newCategory, image: e.target.value })}
                  />
                </div>
                <Button onClick={addCategory} disabled={loading}>Add Category</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.slug}</p>
                      </div>
                      <Button
                        variant={category.is_active ? "default" : "outline"}
                        onClick={() => toggleCategoryStatus(category.id, category.is_active)}
                      >
                        {category.is_active ? "Active" : "Inactive"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Offer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Offer Title</Label>
                  <Input
                    value={newOffer.title}
                    onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newOffer.description}
                    onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Discount Percentage</Label>
                  <Input
                    type="number"
                    value={newOffer.discount_percentage}
                    onChange={(e) => setNewOffer({ ...newOffer, discount_percentage: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input
                    value={newOffer.image}
                    onChange={(e) => setNewOffer({ ...newOffer, image: e.target.value })}
                  />
                </div>
                <Button onClick={addOffer} disabled={loading}>Add Offer</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {offers.map((offer) => (
                    <div key={offer.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h3 className="font-semibold">{offer.title}</h3>
                        <p className="text-sm text-muted-foreground">{offer.discount_percentage}% off</p>
                      </div>
                      <Button
                        variant={offer.is_active ? "default" : "outline"}
                        onClick={() => toggleOfferStatus(offer.id, offer.is_active)}
                      >
                        {offer.is_active ? "Active" : "Inactive"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSettings;
