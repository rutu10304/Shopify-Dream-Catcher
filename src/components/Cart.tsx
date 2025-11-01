import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { CartItem } from "@/types/product";
import { Minus, Plus, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Invoice } from "@/components/Invoice";
import { getProductImage } from "@/lib/productImages";
import { useState } from "react";
import ReactDOM from "react-dom/client";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

const Cart = ({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem }: CartProps) => {
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [showInvoice, setShowInvoice] = useState(false);
  
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      // Continue without login requirement

      // Generate order number locally
      const today = new Date();
      const dateStr = today.getDate().toString().padStart(2, '0') +
                      (today.getMonth() + 1).toString().padStart(2, '0') +
                      today.getFullYear().toString();
      const randomNum = Math.floor(Math.random() * 1000);
      const generatedOrderNumber = `${dateStr}-${randomNum}`;

      // Only create order in database if user is authenticated
      if (session) {
        // Create order
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert([{
            user_id: session.user.id,
            total_amount: total,
            order_number: generatedOrderNumber,
            shipping_address: "Address to be confirmed",
            status: "pending",
            invoice_data: JSON.parse(JSON.stringify({
              items: items,
              total: total,
              date: new Date().toISOString()
            }))
          }])
          .select()
          .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = items.map(item => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      setOrderNumber(generatedOrderNumber);
      
      const orderDetails = items
        .map(item => `${item.name} - ₹${item.price}`)
        .join('\n');
      
      const message = orderDetails;
      const adminWhatsapp = "9723344774";
      const whatsappUrl = `https://wa.me/${adminWhatsapp}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "Order placed!",
        description: "Your order has been sent to the admin",
      });

      setShowInvoice(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const downloadInvoice = async () => {
    const invoiceContainer = document.createElement('div');
    invoiceContainer.id = 'invoice-container';
    invoiceContainer.style.position = 'absolute';
    invoiceContainer.style.left = '-9999px';
    document.body.appendChild(invoiceContainer);

    const root = ReactDOM.createRoot(invoiceContainer);
    root.render(
      <Invoice
        orderNumber={orderNumber}
        items={items}
        total={total}
        date={new Date()}
      />
    );

    setTimeout(async () => {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(invoiceContainer);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`invoice-${orderNumber}.pdf`);

      root.unmount();
      document.body.removeChild(invoiceContainer);
      
      toast({
        title: "Invoice downloaded!",
        description: "Your invoice has been saved",
      });
    }, 500);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full py-6">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b pb-4">
                    <img
                      src={getProductImage(item.image)}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">₹{item.price}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 ml-auto"
                          onClick={() => onRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <SheetFooter className="flex-col gap-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">₹{total}</span>
                </div>
                <Button onClick={handleCheckout} className="w-full" size="lg">
                  Send Order to WhatsApp
                </Button>
                {showInvoice && orderNumber && (
                  <Button onClick={downloadInvoice} variant="outline" className="w-full gap-2" size="lg">
                    <Download className="h-4 w-4" />
                    Download Invoice
                  </Button>
                )}
              </SheetFooter>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
