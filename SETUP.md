# The Right Knot - E-Commerce Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or bun package manager
- Git

## Local Development Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd the-right-knot
```

### 2. Install Dependencies
```bash
npm install
# or
bun install
```

### 3. Environment Setup
The project comes with pre-configured environment variables in `.env` file for Lovable Cloud (Supabase). The following variables are already set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

### 4. Start Development Server
```bash
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:8080`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn UI components
│   ├── Cart.tsx        # Shopping cart with WhatsApp checkout
│   ├── Header.tsx      # Main navigation header
│   ├── Invoice.tsx     # Invoice generation component
│   ├── OffersSection.tsx # Sales and offers display
│   └── ...
├── pages/              # Application pages
│   ├── Index.tsx       # Home page with products
│   ├── Shop.tsx        # Shop page with filters
│   ├── Admin.tsx       # Admin dashboard
│   ├── AdminSettings.tsx # Admin settings management
│   └── ...
├── integrations/       # Supabase integration
└── types/              # TypeScript type definitions
```

## Features

### Customer Features
1. **Browse Products** - View handcrafted products by category
2. **Search & Filter** - Find products using search and category filters
3. **Shopping Cart** - Add items to cart with quantity management
4. **WhatsApp Checkout** - Send orders directly to admin via WhatsApp
5. **Invoice Download** - Download PDF invoices with unique order numbers
6. **Custom Orders** - Request custom designs
7. **Wishlist** - Save favorite products
8. **Product Reviews** - View and add product reviews

### Admin Features
1. **Product Management** - Add, edit, and delete products
2. **Category Management** - Manage product categories
3. **Offers Management** - Create and manage sales/offers
4. **Order Management** - View and manage customer orders
5. **Settings** - Configure admin WhatsApp number and site settings

## Database Schema

### Main Tables
- **products** - Product catalog
- **categories** - Product categories
- **offers** - Sales and promotions
- **orders** - Customer orders with auto-generated order numbers
- **order_items** - Individual items in orders
- **site_settings** - Site configuration (WhatsApp number, etc.)
- **profiles** - User profiles
- **user_roles** - User role management (admin/user)
- **wishlist** - User wishlists
- **product_reviews** - Product ratings and reviews
- **testimonials** - Customer testimonials

### Order Number Format
Orders use a date-based format: `DDMMYYYY-N`
- Example: `25102025-1` (First order on October 25, 2025)
- Resets daily with sequential numbering

## Authentication

### User Authentication
1. Navigate to `/auth`
2. Sign up with email and password
3. Email confirmation is auto-enabled for testing

### Admin Access
1. Admin role must be assigned in the database
2. Insert admin role manually:
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin');
```
3. Admin can access `/admin` and `/admin/settings`

## Key Functionality

### Shopping Cart & Checkout
- Add products to cart
- Adjust quantities
- View total price
- Send order to admin WhatsApp
- Download PDF invoice with order details

### Admin Settings
- **General Settings**: Configure admin WhatsApp number
- **Categories**: Add/edit product categories
- **Offers**: Create promotional offers with discounts
- Products are managed from `/admin` page

### Invoice Generation
- Auto-generated unique order numbers
- PDF download with order details
- Styled with brand colors
- Includes customer information

## Customization

### Changing Admin WhatsApp Number
1. Login as admin
2. Navigate to `/admin/settings`
3. Update WhatsApp number in General Settings tab
4. Save changes

### Adding Products
1. Login as admin
2. Navigate to `/admin`
3. Click "Add New Product"
4. Fill in product details
5. Submit to save

### Creating Offers
1. Login as admin
2. Navigate to `/admin/settings`
3. Go to "Offers" tab
4. Add offer details with discount percentage
5. Toggle active status

## Troubleshooting

### Build Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules
npm install
```

### Database Connection
- Ensure `.env` file contains correct Supabase credentials
- Check Lovable Cloud dashboard for project status

### Order Number Not Generating
- Verify database function `generate_order_number()` exists
- Check RLS policies on orders table

## Production Deployment

### Using Lovable Platform
1. The app is automatically deployed via Lovable
2. Use the "Publish" button in Lovable editor
3. Custom domain can be configured in project settings

### Manual Deployment
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Support

For issues or questions:
- Check the documentation
- Contact through WhatsApp (configured in admin settings)
- Review Supabase logs for backend errors

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **PDF Generation**: jsPDF, html2canvas

## License
All rights reserved - The Right Knot
