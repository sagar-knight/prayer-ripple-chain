import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, ShoppingCart, Search, Loader2 } from "lucide-react";
import { CartDrawer } from "@/components/CartDrawer";
import { useCartStore, type ShopifyProduct } from "@/stores/cartStore";
import {
  storefrontApiRequest,
  STOREFRONT_PRODUCTS_QUERY,
  STOREFRONT_COLLECTION_PRODUCTS_QUERY,
  STOREFRONT_COLLECTIONS_QUERY,
} from "@/lib/shopify";
import { toast } from "sonner";

const categoryFallbackTerms: Record<string, string[]> = {
  "Apparel": ["apparel", "shirt", "t-shirt", "tee", "hoodie", "crewneck", "sweatshirt"],
  "Wall Art": ["wall art", "print", "poster", "canvas", "frame"],
  "Journals": ["journal", "notebook", "devotional", "planner"],
};

const normalizeValue = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const Store = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);

  const categories = ["All", "Apparel", "Wall Art", "Journals"];
  const categoryCollectionHandles: Record<string, string> = {
    "Apparel": "apparel",
    "Wall Art": "wall-art",
    "Journals": "journals",
  };

  const matchesFallbackCategory = (product: ShopifyProduct, category: string) => {
    const terms = categoryFallbackTerms[category] || [];
    if (terms.length === 0) return false;

    const haystack = [
      product.node.title,
      product.node.description,
      product.node.productType || "",
      ...(product.node.tags || []),
    ].join(" ").toLowerCase();

    return terms.some((term) => haystack.includes(term.toLowerCase()));
  };

  const resolveCollectionHandle = async (category: string, defaultHandle: string) => {
    const data = await storefrontApiRequest(STOREFRONT_COLLECTIONS_QUERY, { first: 50 });
    const collections = data?.data?.collections?.edges?.map((edge: any) => edge.node) || [];

    const normalizedCategory = normalizeValue(category);
    const normalizedDefaultHandle = normalizeValue(defaultHandle);

    const match = collections.find((collection: any) => {
      const normalizedTitle = normalizeValue(collection.title || "");
      const normalizedHandle = normalizeValue(collection.handle || "");
      return normalizedHandle === normalizedDefaultHandle || normalizedTitle === normalizedCategory;
    });

    return match?.handle || defaultHandle;
  };

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let allProducts: ShopifyProduct[] = [];

      try {
        const allProductsData = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 250 });
        allProducts = allProductsData?.data?.products?.edges || [];

        if (activeCategory === "All") {
          setProducts(allProducts);
          return;
        }

        const defaultHandle = categoryCollectionHandles[activeCategory];
        if (!defaultHandle) {
          setProducts([]);
          return;
        }

        const resolvedHandle = await resolveCollectionHandle(activeCategory, defaultHandle);
        const collectionData = await storefrontApiRequest(STOREFRONT_COLLECTION_PRODUCTS_QUERY, {
          handle: resolvedHandle,
          first: 250,
        });

        const collectionProducts = collectionData?.data?.collection?.products?.edges || [];

        if (collectionProducts.length > 0) {
          setProducts(collectionProducts);
          return;
        }

        const fallbackProducts = allProducts.filter((product: ShopifyProduct) =>
          matchesFallbackCategory(product, activeCategory)
        );

        setProducts(fallbackProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);

        if (allProducts.length > 0) {
          const fallbackProducts = activeCategory === "All"
            ? allProducts
            : allProducts.filter((product: ShopifyProduct) => matchesFallbackCategory(product, activeCategory));
          setProducts(fallbackProducts);
        } else {
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [activeCategory]);

  const filtered = products.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.node.title.toLowerCase().includes(s) || (p.node.description || "").toLowerCase().includes(s);
  });

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

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 animate-gentle-fade">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground">
              PrayerForward Store
            </h1>
          </div>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Wear your faith. Spread prayer. Purchases help support the mission.
          </p>
        </div>

        {/* Cart button */}
        <div className="fixed bottom-20 right-4 z-40 md:bottom-6">
          <CartDrawer />
        </div>

        {/* Search & Category Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardContent className="p-3 space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((product, i) => {
              const price = product.node.priceRange.minVariantPrice;
              const image = product.node.images.edges[0]?.node;
              return (
                <Card
                  key={product.node.id}
                  className="group overflow-hidden hover:shadow-peaceful transition-all cursor-pointer animate-gentle-fade"
                  style={{ animationDelay: `${i * 50}ms` }}
                  onClick={() => navigate(`/product/${product.node.handle}`)}
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    {image ? (
                      <img
                        src={image.url}
                        alt={image.altText || product.node.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 md:p-4 space-y-1.5">
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                      {product.node.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {product.node.description}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-lg font-bold text-primary">
                        {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1"
                        disabled={isLoading}
                        onClick={(e) => handleAddToCart(product, e)}
                      >
                        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <><ShoppingCart className="h-3 w-3" /> Add</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No products found.</p>
            <p className="text-sm text-muted-foreground mt-2">Products will appear here once they are added to the store.</p>
          </div>
        )}

        <NewsletterSubscribe />
      </div>
    </div>
  );
};

export default Store;
