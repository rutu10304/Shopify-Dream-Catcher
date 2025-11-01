import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Package, Heart, Frame, Car, Home, Sparkles } from "lucide-react";

const categories = [
  { name: "Keychains", slug: "keychains", icon: Heart, description: "Handcrafted keychains with unique designs" },
  { name: "Dreamcatchers", slug: "dreamcatchers", icon: Sparkles, description: "Traditional and modern dreamcatcher designs" },
  { name: "Wall Hangings", slug: "wall-hangings", icon: Home, description: "Beautiful macrame wall decorations" },
  { name: "Car Hangings", slug: "car-hangings", icon: Car, description: "Colorful hangings for your vehicle" },
  { name: "Photo Frames", slug: "photo-frames", icon: Frame, description: "Handmade photo frames with artistic touches" },
  { name: "Accessories", slug: "accessories", icon: Package, description: "Various handcrafted accessories" },
];

const Categories = () => {
  return (
    <div className="min-h-screen flex flex-col home-animate">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Shop by Category</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.slug} to={`/category/${category.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <category.icon className="h-16 w-16 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">{category.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
