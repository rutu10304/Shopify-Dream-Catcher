import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer style={{ backgroundColor: "hsl(var(--footer-bg))", color: "hsl(var(--footer-foreground))" }} className="mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">The Right Knot</h3>
            <p className="text-sm mb-4">
              Handcrafted with love - Dreamcatchers, Macrame & More
            </p>
            <div className="flex items-center gap-2 text-sm mb-2">
              <MapPin className="h-4 w-4" />
              <span>Gandhinagar, Gujarat,India</span>
            </div>
            <div className="flex items-center gap-2 text-sm mb-2">
              <Phone className="h-4 w-4" />
              <span>+91 7990980192 </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              <span>support@therightknot.com</span>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/categories" className="hover:text-primary">Categories</Link></li>
              <li><Link to="/feedback" className="hover:text-primary">Feedback</Link></li>
              <li><Link to="/profile" className="hover:text-primary">My Account</Link></li>
              <li><Link to="/wishlist" className="hover:text-primary">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Follow Us</h3>
            <a
              href="https://www.instagram.com/theright.knot?igsh=YmIza3Y3cHI4eXBz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
            >
              <Instagram className="h-5 w-5" />
              <span>@therightknot</span>
            </a>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <p>&copy; {new Date().getFullYear()} The Right Knot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
