import { CartItem } from "@/types/product";
import logo from "@/assets/logo.png";

interface InvoiceProps {
  orderNumber: string;
  items: CartItem[];
  total: number;
  date: Date;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
}

export const Invoice = ({ orderNumber, items, total, date, customerName, customerPhone, customerAddress }: InvoiceProps) => {
  return (
    <div className="bg-background p-8 max-w-4xl mx-auto" id="invoice">
      <div className="border-4 border-primary p-8 rounded-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-primary">
          <div className="flex items-center gap-3">
            <img src={logo} alt="The Right Knot" className="h-16 w-auto" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                The Right Knot
              </h1>
              <p className="text-sm text-muted-foreground">Handcrafted Dreams</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-primary">INVOICE</h2>
            <p className="text-sm text-muted-foreground mt-1">#{orderNumber}</p>
          </div>
        </div>

        {/* Date and Customer Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-lg mb-2 text-primary">Invoice Date</h3>
            <p className="text-muted-foreground">{date.toLocaleDateString('en-IN')}</p>
          </div>
          {(customerName || customerPhone || customerAddress) && (
            <div>
              <h3 className="font-semibold text-lg mb-2 text-primary">Customer Details</h3>
              {customerName && <p className="text-muted-foreground">{customerName}</p>}
              {customerPhone && <p className="text-muted-foreground">{customerPhone}</p>}
              {customerAddress && <p className="text-muted-foreground">{customerAddress}</p>}
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="text-left p-3 rounded-tl-lg">Item</th>
                <th className="text-center p-3">Quantity</th>
                <th className="text-right p-3">Price</th>
                <th className="text-right p-3 rounded-tr-lg">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                  <td className="p-3 border-b">{item.name}</td>
                  <td className="text-center p-3 border-b">{item.quantity}</td>
                  <td className="text-right p-3 border-b">₹{item.price}</td>
                  <td className="text-right p-3 border-b">₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between items-center py-4 border-t-2 border-primary">
              <span className="text-xl font-bold">Grand Total:</span>
              <span className="text-2xl font-bold text-primary">₹{total}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 border-t-2 border-primary">
          <p className="text-sm text-muted-foreground mb-2">Thank you for your business!</p>
          <p className="text-xs text-muted-foreground">
            For any queries, please contact us through WhatsApp
          </p>
        </div>
      </div>
    </div>
  );
};

export const downloadInvoice = async (orderNumber: string, items: CartItem[], total: number) => {
  const invoiceElement = document.getElementById('invoice-container');
  if (!invoiceElement) return;

  // Use html2canvas to convert the invoice to image, then create PDF
  const html2canvas = (await import('html2canvas')).default;
  const jsPDF = (await import('jspdf')).default;

  const canvas = await html2canvas(invoiceElement);
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(`invoice-${orderNumber}.pdf`);
};
