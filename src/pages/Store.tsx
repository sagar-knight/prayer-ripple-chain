import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, ShoppingCart, Loader2, ArrowRight } from "lucide-react";
import { useCartStore, type ShopifyProduct } from "@/stores/cartStore";
import {
  storefrontApiRequest,
  STOREFRONT_PRODUCTS_QUERY,
  STOREFRONT_COLLECTION_PRODUCTS_QUERY,
  STOREFRONT_COLLECTIONS_QUERY,
  STOREFRONT_NEW_PRODUCTS_QUERY,
} from "@/lib/shopify";
import { toast } from "sonner";
import { CartDrawer } from "@/components/CartDrawer";

const categoryFallbackTerms: Record<string, string[]> = {
  Apparel: ["apparel", "shirt", "t-shirt", "tee", "hoodie", "crewneck", "sweatshirt"],
  "Wall Art": ["wall art", "print", "poster", "canvas", "frame"],
  Journals: ["journal", "notebook", "devotional", "planner"],
  Accessories: ["accessory", "accessories", "hat", "cap", "bag", "tote", "sticker", "mug", "bracelet"],
};

const genderTerms: Record<string, string[]> = {
  Men: ["men", "mens", "men's", "male", "unisex"],
  Women: ["women", "womens", "women's", "female", "ladies"],
};

const normalizeValue = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const categoryCollectionHandles: Record<string, string> = {
  Apparel: "apparel",
  "Wall Art": "wall-art",
  Journals: "journals",
  Accessories: "accessories",
};

const shopCategories = [
  { label: "Apparel", icon: "", description: "Faith-inspired clothing" },
  { label: "Accessories", icon: "", description: "Everyday essentials" },
  { label: "Wall Art", icon: "", description: "Scripture for your walls" },
  { label: "Journals", icon: "", description: "Prayer & devotional" },
];

const Store = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [collections, setCollections] = useState<Array<{ title: string; handle: string; description?: string; image?: { url: string; altText: string | null } | null }>>([]);
  const [newProducts, setNewProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);

  // Read URL params
  const urlCategory = searchParams.get("category") || "";
  const urlSubCategory = searchParams.get("sub") || "";
  const urlSearch = searchParams.get("search") || "";
  const urlCollection = searchParams.get("collection") || "";

  const matchesFallback = (product: ShopifyProduct, category: string) => {
    const terms = categoryFallbackTerms[category] || [];
    if (!terms.length) return false;
    const haystack = [product.node.title, product.node.description, product.node.productType || "", ...(product.node.tags || [])].join(" ").toLowerCase();
    return terms.some((t) => haystack.includes(t));
  };

  const matchesGender = (product: ShopifyProduct, gender: string) => {
    const terms = genderTerms[gender] || [];
    if (!terms.length) return false;
    const haystack = [product.node.title, product.node.description, product.node.productType || "", ...(product.node.tags || [])].join(" ").toLowerCase();
    return terms.some((t) => haystack.includes(t));
  };

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 250 });
        const all: ShopifyProduct[] = data?.data?.products?.edges || [];
        setAllProducts(all);

        if (!urlCategory && !urlCollection) {
          // Home view: load collections list instead of dumping all products
          try {
            const collsData = await storefrontApiRequest(STOREFRONT_COLLECTIONS_QUERY, { first: 20 });
            const colls = (collsData?.data?.collections?.edges || []).map((e: any) => e.node);
            setCollections(colls);
          } catch {
            setCollections([]);
          }
          // Load New & Seasonal: prefer tagged products, fall back to most recently created
          try {
            const taggedData = await storefrontApiRequest(STOREFRONT_NEW_PRODUCTS_QUERY, {
              first: 8,
              query: "tag:new OR tag:seasonal",
            });
            let nps: ShopifyProduct[] = taggedData?.data?.products?.edges || [];
            if (nps.length === 0) {
              const latestData = await storefrontApiRequest(STOREFRONT_NEW_PRODUCTS_QUERY, { first: 8 });
              nps = latestData?.data?.products?.edges || [];
            }
            setNewProducts(nps);
          } catch {
            setNewProducts([]);
          }
          setProducts(all);
          return;
        }

        // If filtering by collection handle
        if (urlCollection) {
          try {
            const collData = await storefrontApiRequest(STOREFRONT_COLLECTION_PRODUCTS_QUERY, { handle: urlCollection, first: 250 });
            const collProducts = collData?.data?.collection?.products?.edges || [];
            setProducts(collProducts);
          } catch {
            setProducts([]);
          }
          return;
        }

        // Category filtering
        const handle = categoryCollectionHandles[urlCategory];
        if (handle) {
          try {
            const collData = await storefrontApiRequest(STOREFRONT_COLLECTION_PRODUCTS_QUERY, { handle, first: 250 });
            const collProducts = collData?.data?.collection?.products?.edges || [];
            if (collProducts.length > 0) {
              setProducts(collProducts);
              return;
            }
          } catch {}
        }

        // Fallback
        setProducts(all.filter((p) => matchesFallback(p, urlCategory)));
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [urlCategory, urlCollection]);

  // Apply gender + search filters
  let filtered = urlSubCategory ? products.filter((p) => matchesGender(p, urlSubCategory)) : products;
  if (urlSearch) {
    const s = urlSearch.toLowerCase();
    filtered = (urlCategory ? filtered : allProducts).filter(
      (p) => p.node.title.toLowerCase().includes(s) || (p.node.description || "").toLowerCase().includes(s)
    );
  }

  const handleAddToCart = async (product: ShopifyProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Added to cart", { description: product.node.title });
  };

  // Determine view: home (no category/search) vs filtered
  const isHome = !urlCategory && !urlSearch && !urlCollection;

  // Build title
  const pageTitle = urlSearch
    ? `Results for "${urlSearch}"`
    : urlSubCategory
    ? `${urlCategory} — ${urlSubCategory}`
    : urlCategory || (urlCollection ? urlCollection.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Store");

  const ProductCard = ({ product, index }: { product: ShopifyProduct; index: number }) => {
    const price = product.node.priceRange.minVariantPrice;
    const image = product.node.images.edges[0]?.node;
    return (
      <Card
        className="group overflow-hidden border-0 shadow-none hover:shadow-peaceful transition-all cursor-pointer bg-transparent"
        onClick={() => navigate(`/product/${product.node.handle}`)}
      >
        <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
          {image ? (
            <img
              src={image.url}
              alt={image.altText || product.node.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="pt-3 space-y-1">
          <h3 className="font-medium text-sm leading-snug line-clamp-1">{product.node.title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              ${parseFloat(price.amount).toFixed(2)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 h-7 px-2"
              disabled={isLoading}
              onClick={(e) => handleAddToCart(product, e)}
            >
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <><ShoppingCart className="h-3 w-3" /> Add</>}
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const ProductRow = ({ title, items, viewAllHref }: { title: string; items: ShopifyProduct[]; viewAllHref?: string }) => {
    if (!items.length) return null;
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair text-xl font-semibold text-foreground">{title}</h2>
          {viewAllHref && (
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => navigate(viewAllHref)}>
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {items.slice(0, 4).map((p, i) => (
            <ProductCard key={p.node.id} product={p} index={i} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {loading ? (
          <>
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4 mt-3" />
                  <Skeleton className="h-4 w-1/3 mt-1" />
                </div>
              ))}
            </div>
          </>
        ) : isHome ? (
          <>
            <div className="mb-8">
              <h1 className="font-playfair text-2xl md:text-3xl font-bold text-foreground">Store</h1>
              <p className="text-sm text-muted-foreground mt-1">Browse collections</p>
            </div>
            {collections.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {collections.map((c) => (
                  <button
                    key={c.handle}
                    onClick={() => navigate(`/store?collection=${c.handle}`)}
                    className="group text-left"
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                      {c.image?.url ? (
                        <img
                          src={c.image.url}
                          alt={c.image.altText || c.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="pt-3">
                      <h2 className="font-medium text-base text-foreground group-hover:text-primary transition-colors">
                        {c.title}
                      </h2>
                      {c.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{c.description}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No collections found.</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Category/Search results */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <button onClick={() => navigate("/store")} className="hover:text-primary transition-colors">Store</button>
                {urlCategory && (
                  <>
                    <span>/</span>
                    <button onClick={() => navigate(`/store?category=${urlCategory}`)} className="hover:text-primary transition-colors">{urlCategory}</button>
                  </>
                )}
                {urlSubCategory && (
                  <>
                    <span>/</span>
                    <span className="text-foreground font-medium">{urlSubCategory}</span>
                  </>
                )}
              </div>
              <h1 className="font-playfair text-2xl md:text-3xl font-bold text-foreground">{pageTitle}</h1>
              <p className="text-sm text-muted-foreground mt-1">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {filtered.map((p, i) => (
                  <ProductCard key={p.node.id} product={p} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No products found.</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Store;
