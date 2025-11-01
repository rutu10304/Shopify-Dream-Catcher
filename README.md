# The Right Knot - Handcrafted E-Commerce Platform

Welcome to **The Right Knot** - a complete e-commerce solution for handcrafted products including dreamcatchers, macrame, keychains, and wall art.

## 🎨 Project Overview

This is a full-featured e-commerce website with:
- Product browsing and search
- Shopping cart with WhatsApp checkout
- PDF invoice generation with auto-generated order numbers
- Admin panel for managing products, categories, and offers
- Custom order requests
- User authentication and profiles
- Wishlist functionality

## 📖 Documentation

For detailed setup instructions, see **[SETUP.md](./SETUP.md)**

## Project Info

**URL**: https://lovable.dev/projects/1e689d1a-dc52-4387-9e50-99bafcc21ead

## Quick Start

### Prerequisites
- Node.js v18+ or Bun
- Git

### Local Development

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

Visit `http://localhost:8080` to view the app.

## 🚀 Features

### Customer Features
- ✅ Browse products by category
- ✅ Search and filter products
- ✅ Shopping cart with quantity management
- ✅ WhatsApp checkout integration
- ✅ PDF invoice download (auto-generated order numbers: DDMMYYYY-N format)
- ✅ Custom order requests
- ✅ Wishlist functionality
- ✅ Product reviews

### Admin Features  
- ✅ Product management (create, edit, delete)
- ✅ Category management
- ✅ Sales & offers management
- ✅ Order tracking
- ✅ Configure admin WhatsApp number
- ✅ Settings panel

## 🎯 Key Pages

- `/` - Home page with products and offers
- `/shop` - Shop page with search and filters
- `/admin` - Admin dashboard
- `/admin/settings` - Manage categories, offers, and settings
- `/admin/orders` - View all orders
- `/customize/:id` - Customize product before adding to cart

## 🔐 Admin Setup

To access admin features:
1. Sign up at `/auth`
2. Add admin role in database:
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-uuid', 'admin');
```
3. Access admin panel at `/admin`

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/1e689d1a-dc52-4387-9e50-99bafcc21ead) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Lovable Cloud (Supabase) for backend
- PostgreSQL database
- Supabase Auth
- jsPDF + html2canvas for invoice generation

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/1e689d1a-dc52-4387-9e50-99bafcc21ead) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
