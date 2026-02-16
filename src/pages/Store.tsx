import { useState } from "react";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { products, type Product } from "@/data/products";

const categories = ["All", "Apparel", "Journals", "Stickers", "Wall Art", "Digital Downloads"] as const;

const Store = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) return removeFromCart(productId);
    setCart((prev) =>
      prev.map((c) => (c.product.id === productId ? { ...c, qty } : c))
    );
  };

  const subtotal = cart.reduce((sum, c) => sum + c.product.price * c.qty, 0);

  const [view, setView] = useState<"browse" | "cart" | "detail">("browse");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const openDetail = (product: Product) => {
    setSelectedProduct(product);
    setSelectedVariants({});
    if (product.variants) {
      const defaults: Record<string, string> = {};
      product.variants.forEach((v) => {
        defaults[v.label] = v.options[0];
      });
      setSelectedVariants(defaults);
    }
    setView("detail");
  };

  // CART VIEW
  if (view === "cart") {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
        <div className="max-w-2xl mx-auto px-4">
          <Button variant="ghost" size="sm" className="mb-6" onClick={() => setView("browse")}>
            ← Back to Store
          </Button>
          <h1 className="font-playfair text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
            <ShoppingCart className="h-7 w-7 text-primary" />
            Your Cart
          </h1>

          {cart.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Button variant="peaceful" onClick={() => setView("browse")}>
                  Browse Store
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <Card key={item.product.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">${item.product.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => updateQty(item.product.id, item.qty - 1)}
                      >
                        −
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">{item.qty}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => updateQty(item.product.id, item.qty + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Subtotal</span>
                    <span className="text-2xl font-bold text-primary">${subtotal.toFixed(2)}</span>
                  </div>
                  <Button variant="peaceful" size="lg" className="w-full text-lg py-6" disabled>
                    Checkout Coming Soon
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Online checkout will be available soon. Thank you for your patience!
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // DETAIL VIEW
  if (view === "detail" && selectedProduct) {
    return (
      <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
        <div className="max-w-2xl mx-auto px-4">
          <Button variant="ghost" size="sm" className="mb-6" onClick={() => setView("browse")}>
            ← Back to Store
          </Button>
          <div className="grid md:grid-cols-2 gap-8">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full aspect-square rounded-xl object-cover"
            />
            <div className="space-y-4">
              <Badge variant="secondary">{selectedProduct.category}</Badge>
              <h1 className="font-playfair text-2xl font-bold text-foreground">
                {selectedProduct.name}
              </h1>
              <p className="text-muted-foreground">{selectedProduct.description}</p>
              <p className="text-3xl font-bold text-primary">${selectedProduct.price}</p>

              {selectedProduct.variants?.map((variant) => (
                <div key={variant.label} className="space-y-2">
                  <p className="text-sm font-medium">{variant.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((opt) => (
                      <Button
                        key={opt}
                        variant={selectedVariants[variant.label] === opt ? "peaceful" : "outline"}
                        size="sm"
                        onClick={() =>
                          setSelectedVariants((prev) => ({ ...prev, [variant.label]: opt }))
                        }
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}

              <Button
                variant="peaceful"
                size="lg"
                className="w-full gap-2 mt-4"
                onClick={() => {
                  addToCart(selectedProduct);
                  setView("cart");
                }}
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Purchases help support the PrayerForward mission.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // BROWSE VIEW
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
        {cartCount > 0 && (
          <div className="fixed bottom-20 right-4 z-40 md:bottom-6">
            <Button
              variant="peaceful"
              size="lg"
              className="rounded-full shadow-peaceful gap-2"
              onClick={() => setView("cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              Cart ({cartCount})
            </Button>
          </div>
        )}

        {/* Search & Filter */}
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
                variant={activeCategory === cat ? "peaceful" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((product, i) => (
            <Card
              key={product.id}
              className="group overflow-hidden hover:shadow-peaceful transition-all cursor-pointer animate-gentle-fade"
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => openDetail(product)}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-3 md:p-4 space-y-1.5">
                <Badge variant="secondary" className="text-[10px]">
                  {product.category}
                </Badge>
                <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-lg font-bold text-primary">
                    ${product.price}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetail(product);
                    }}
                  >
                    View <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No products found. Try a different search.</p>
          </div>
        )}

        <NewsletterSubscribe />
      </div>
    </div>
  );
};

export default Store;
