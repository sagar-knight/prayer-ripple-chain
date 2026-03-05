import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { CartDrawer } from "@/components/CartDrawer";
import { useCartStore } from "@/stores/cartStore";
import { storefrontApiRequest, STOREFRONT_PRODUCT_BY_HANDLE_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { toast } from "sonner";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ShopifyProduct["node"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const addItem = useCartStore(state => state.addItem);
  const isLoading = useCartStore(state => state.isLoading);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await storefrontApiRequest(STOREFRONT_PRODUCT_BY_HANDLE_QUERY, { handle });
        if (data?.data?.product) {
          const p = data.data.product;
          setProduct(p);
          // Set default options
          const defaults: Record<string, string> = {};
          p.options?.forEach((opt: any) => {
            if (opt.values?.[0]) defaults[opt.name] = opt.values[0];
          });
          setSelectedOptions(defaults);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    }
    if (handle) fetchProduct();
  }, [handle]);

  const selectedVariant = product?.variants.edges.find(v =>
    v.node.selectedOptions.every(so => selectedOptions[so.name] === so.value)
  )?.node || product?.variants.edges[0]?.node;

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;
    const shopifyProduct: ShopifyProduct = { node: product };
    await addItem({
      product: shopifyProduct,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success("Added to cart", { description: product.title });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12 pb-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Product not found</p>
          <Button variant="outline" onClick={() => navigate("/store")}>Back to Store</Button>
        </div>
      </div>
    );
  }

  const mainImage = product.images.edges[0]?.node;
  const price = selectedVariant?.price || product.priceRange.minVariantPrice;

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/store")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Store
          </Button>
          <CartDrawer />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted">
              {mainImage ? (
                <img src={mainImage.url} alt={mainImage.altText || product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            {product.images.edges.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.edges.map((img, i) => (
                  <img
                    key={i}
                    src={img.node.url}
                    alt={img.node.altText || `${product.title} ${i + 1}`}
                    className="w-16 h-16 rounded-md object-cover flex-shrink-0 border-2 border-transparent hover:border-primary cursor-pointer"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <h1 className="font-playfair text-2xl md:text-3xl font-bold text-foreground">
              {product.title}
            </h1>
            <p className="text-muted-foreground">{product.description}</p>
            <p className="text-3xl font-bold text-primary">
              {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
            </p>

            {/* Options */}
            {product.options?.filter(o => o.name !== "Title").map((option) => (
              <div key={option.name} className="space-y-2">
                <p className="text-sm font-medium">{option.name}</p>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((val) => (
                    <Button
                      key={val}
                      variant={selectedOptions[option.name] === val ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: val }))}
                    >
                      {val}
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            {selectedVariant && !selectedVariant.availableForSale && (
              <Badge variant="destructive">Out of Stock</Badge>
            )}

            <Button
              size="lg"
              className="w-full gap-2 mt-4"
              onClick={handleAddToCart}
              disabled={isLoading || !selectedVariant?.availableForSale}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ShoppingCart className="h-5 w-5" /> Add to Cart</>}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Purchases help support the PrayerForward mission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
