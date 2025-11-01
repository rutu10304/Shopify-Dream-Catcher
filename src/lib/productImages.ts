export const getProductImage = (imageUrl: string): string => {
  if (!imageUrl) {
    return "/placeholder.svg"; // fallback placeholder
  }

  const src = imageUrl.trim();

  // ✅ Handle Google Drive links automatically
  if (src.includes("drive.google.com")) {
    const match = src.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }

  // ✅ Already a full URL (Supabase public link or external)
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // ✅ If it's a relative path like '/images/...'
  if (src.startsWith("/")) {
    return src;
  }

  // ✅ If only Supabase storage path (like "products/image.jpg") is saved in DB
  // Use the environment variable for Supabase URL
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://eybcibbjpeixstxtbjbx.supabase.co";
  const STORAGE_BUCKET = "product-images"; // your Supabase bucket name

  // Construct the public URL for the image
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${src}`;
  
  // Add timestamp to prevent caching issues
  return `${publicUrl}?t=${Date.now()}`;
};
