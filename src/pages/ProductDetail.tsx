import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Loader2, Minus, Plus, Truck, RotateCcw, Shield, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { storefrontApiRequest, STOREFRONT_PRODUCT_BY_HANDLE_QUERY, STOREFRONT_PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { toast } from "sonner";
import StoreLayout from "@/components/store/StoreLayout";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ShopifyProduct["node"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [recommendations, setRecommendations] = useState<ShopifyProduct[]>([]);
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await storefrontApiRequest(STOREFRONT_PRODUCT_BY_HANDLE_QUERY, { handle });
        if (data?.data?.product) {
          const p = data.data.product;
          setProduct(p);
          const defaults: Record<string, string> = {};
          p.options?.forEach((opt: any) => {
            if (opt.values?.[0]) defaults[opt.name] = opt.values[0];
          });
          setSelectedOptions(defaults);
        }

        const allData = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 20 });
        const all: ShopifyProduct[] = allData?.data?.products?.edges || [];
        setRecommendations(all.filter((p) => p.node.handle !== handle).slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    }
    if (handle) {
      setLoading(true);
      setActiveImage(0);
      setQuantity(1);
      fetchProduct();
    }
  }, [handle]);

  const selectedVariant =
    product?.variants.edges.find((v) =>
      v.node.selectedOptions.every((so) => selectedOptions[so.name] === so.value)
    )?.node || product?.variants.edges[0]?.node;

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;
    if (!selectedVariant.availableForSale) {
      toast.error("This variant is currently out of stock");
      return;
    }
    const shopifyProduct: ShopifyProduct = { node: product };
    await addItem({
      product: shopifyProduct,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success("Added to cart", { description: `${product.title} × ${quantity}` });
  };

  if (loading) {
    return (
      <StoreLayout>
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-2 gap-10">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Product not found</p>
          <Button variant="outline" className="rounded-full" onClick={() => navigate("/store")}>Back to Store</Button>
        </div>
      </StoreLayout>
    );
  }

  const images = product.images.edges;
  const price = selectedVariant?.price || product.priceRange.minVariantPrice;

  return (
    <StoreLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 pb-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to="/store" className="hover:text-primary transition-colors">Store</Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{product.title}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
          {/* Image gallery */}
          <div className="space-y-3">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted">
              {images[activeImage] ? (
                <img
                  src={images[activeImage].node.url}
                  alt={images[activeImage].node.altText || product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground/20" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      i === activeImage ? "border-primary" : "border-transparent hover:border-border"
                    }`}
                  >
                    <img src={img.node.url} alt={img.node.altText || `${product.title} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="font-playfair text-2xl md:text-3xl font-bold text-foreground leading-tight">{product.title}</h1>
              <p className="text-2xl font-semibold text-foreground mt-3">
                ${parseFloat(price.amount).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">{price.currencyCode}</span>
              </p>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>

            {/* Options */}
            {product.options?.filter((o) => o.name !== "Title").map((option) => (
              <div key={option.name} className="space-y-2">
                <p className="text-sm font-medium text-foreground">{option.name}</p>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((val) => (
                    <Button
                      key={val}
                      variant={selectedOptions[option.name] === val ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setSelectedOptions((prev) => ({ ...prev, [option.name]: val }))}
                    >
                      {val}
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            {selectedVariant && !selectedVariant.availableForSale && (
              <Badge variant="secondary" className="text-destructive bg-destructive/10 border-0">Out of Stock</Badge>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Quantity</p>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full gap-2 rounded-full text-base"
              onClick={handleAddToCart}
              disabled={isLoading || !selectedVariant?.availableForSale}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ShoppingCart className="h-5 w-5" /> Add to Cart</>}
            </Button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, label: "Free shipping $75+" },
                { icon: RotateCcw, label: "30-day returns" },
                { icon: Shield, label: "Secure checkout" },
              ].map((badge) => (
                <div key={badge.label} className="flex flex-col items-center text-center gap-1 py-2">
                  <badge.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground leading-tight">{badge.label}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4 text-xs">
              <Link to="/store/shipping" className="text-muted-foreground hover:text-primary underline-offset-2 hover:underline">Shipping Info</Link>
              <Link to="/store/returns" className="text-muted-foreground hover:text-primary underline-offset-2 hover:underline">Returns & Exchanges</Link>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className="mt-20">
            <h2 className="font-playfair text-xl font-bold text-foreground mb-5">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recommendations.map((p) => {
                const img = p.node.images.edges[0]?.node;
                const pr = p.node.priceRange.minVariantPrice;
                return (
                  <div
                    key={p.node.id}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/product/${p.node.handle}`)}
                  >
                    <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                      {img ? (
                        <img src={img.url} alt={img.altText || p.node.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="h-8 w-8 text-muted-foreground/20" /></div>
                      )}
                    </div>
                    <div className="pt-3">
                      <h3 className="font-medium text-sm line-clamp-1 text-foreground">{p.node.title}</h3>
                      <span className="text-sm font-semibold text-foreground">${parseFloat(pr.amount).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </StoreLayout>
  );
};

export default ProductDetail;
