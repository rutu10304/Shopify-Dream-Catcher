import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

interface Offer {
  id: string;
  title: string;
  description: string;
  discount_percentage: number;
  image: string;
  is_active: boolean;
}

const OffersSection = () => {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    const { data } = await supabase
      .from("offers")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(3);

    if (data) setOffers(data);
  };

  if (offers.length === 0) return null;

  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <Tag className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold">Special Offers</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <Card key={offer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {offer.image && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold">{offer.title}</h3>
                  <Badge variant="default" className="text-lg px-3 py-1">
                    {offer.discount_percentage}% OFF
                  </Badge>
                </div>
                <p className="text-muted-foreground">{offer.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
