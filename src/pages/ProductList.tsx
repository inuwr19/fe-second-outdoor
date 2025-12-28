import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { useProductStore } from '@/stores/productStore';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

const CATEGORY_OPTIONS = [
  { value: 'All', label: 'Semua' },
  { value: 'outer', label: 'Outer/Jaket' },
  { value: 'polo', label: 'Polo' },
  { value: 'shirt', label: 'Kemeja' },
  { value: 'tshirt', label: 'T-Shirt' },
  { value: 'longsleeve', label: 'Longsleeve' },
  { value: 'pants', label: 'Celana Panjang' },
  { value: 'shorts', label: 'Celana Pendek' },
  { value: 'other', label: 'Lainnya' },
];

const CONDITION_OPTIONS = [
  { value: 'All', label: 'Semua' },
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

const ProductList = () => {
  const { products, fetchProducts, loading, error, currentPage, lastPage, total } = useProductStore();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [condition, setCondition] = useState('All'); // NOTE: backend Anda belum filter condition
  // const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-low' | 'price-high'>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const PRICE_MIN = 0;
  const PRICE_MAX = 1000000;

    const formatThousands = (n: number) => new Intl.NumberFormat('id-ID').format(n);

  const onlyDigits = (v: string) => v.replace(/\D/g, ''); // buang titik, spasi, dll

  const formatFromInput = (v: string) => {
    const digits = onlyDigits(v);
    if (!digits) return '';
    return formatThousands(Number(digits));
  };

  const parseFormatted = (v: string) => {
    const digits = onlyDigits(v);
    return digits ? Number(digits) : 0;
  };

  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);

  const [priceInput, setPriceInput] = useState<{ min: string; max: string }>({
    min: formatThousands(PRICE_MIN),
    max: formatThousands(PRICE_MAX),
  });



  const apiSort = useMemo(() => {
    if (sortBy === 'price-low') return 'price_asc';
    if (sortBy === 'price-high') return 'price_desc';
    if (sortBy === 'oldest') return 'oldest';
    return undefined; // newest default latest()
  }, [sortBy]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchProducts({
        page: 1,
        search: search || undefined,
        category: category !== 'All' ? category : undefined,
        min_price: priceRange[0],
        max_price: priceRange[1],
        sort: apiSort as any,
      });
    }, 300);
    return () => clearTimeout(t);
  }, [search, category, priceRange, apiSort, fetchProducts]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setCondition('All');
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setPriceInput({ min: formatThousands(PRICE_MIN), max: formatThousands(PRICE_MAX) });
    setSortBy('newest');
  };

  const hasActiveFilters =
    !!search ||
    category !== 'All' ||
    condition !== 'All' ||
    priceRange[0] > PRICE_MIN ||
    priceRange[1] < PRICE_MAX;


  const renderFilterContent  = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Kategori</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Kondisi</Label>
        <Select value={condition} onValueChange={setCondition}>
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONDITION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Catatan: backend Anda belum filter kondisi. Jika ingin, saya bisa buatkan query `condition` di controller.
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-semibold">Rentang Harga</Label>
        <Slider
          value={priceRange}
          onValueChange={(value) => {
            const next = value as [number, number];
            setPriceRange(next);
            setPriceInput({ min: formatThousands(next[0]), max: formatThousands(next[1]) });
          }}
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={10000}
        />

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Min</Label>
          <Input
            inputMode="numeric"
            placeholder="0"
            value={priceInput.min}
            onChange={(e) => {
              setPriceInput((p) => ({ ...p, min: formatFromInput(e.target.value) }));
            }}
            onBlur={() => {
              const minVal = Math.max(PRICE_MIN, Math.min(PRICE_MAX, parseFormatted(priceInput.min) || PRICE_MIN));
              const maxVal = Math.max(minVal, priceRange[1]); // max >= min
              setPriceRange([minVal, maxVal]);
              setPriceInput({ min: formatThousands(minVal), max: formatThousands(maxVal) });
            }}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">Max</Label>
          <Input
            inputMode="numeric"
            placeholder="1.000.000"
            value={priceInput.max}
            onChange={(e) => {
              setPriceInput((p) => ({ ...p, max: formatFromInput(e.target.value) }));
            }}
            onBlur={() => {
              const maxVal = Math.max(PRICE_MIN, Math.min(PRICE_MAX, parseFormatted(priceInput.max) || PRICE_MAX));
              const minVal = Math.min(maxVal, priceRange[0]); // min <= max
              setPriceRange([minVal, maxVal]);
              setPriceInput({ min: formatThousands(minVal), max: formatThousands(maxVal) });
            }}
            className="h-11"
          />

        </div>
      </div>

      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full h-11">
          <X className="w-4 h-4 mr-2" />
          Reset Filter
        </Button>
      )}
    </div>
  );

  const goToPage = (page: number) => {
    fetchProducts({
      page,
      search: search || undefined,
      category: category !== 'All' ? category : undefined,
      min_price: priceRange[0],
      max_price: priceRange[1],
      sort: apiSort as any,
    });
  };

  return (
    <>
      <Helmet>
        <title>Koleksi Thrift - Second Outdoor</title>
        <meta name="description" content="Jelajahi koleksi pakaian thrift berkualitas." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-6 md:px-12 py-8">
          {/* Header */}
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                  Koleksi Thrift
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                  {loading ? 'Memuat...' : `${total} produk tersedia`}
                </p>
                {error && <p className="text-sm text-destructive mt-2">{error}</p>}
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="hidden md:inline-flex">
                  Reset
                </Button>
              )}
            </div>

            {/* Active filters chips (ringkas) */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {search && <Badge variant="secondary">Cari: {search}</Badge>}
                {category !== 'All' && <Badge variant="secondary">Kategori: {category}</Badge>}
                {(priceRange[0] > 0 || priceRange[1] < 500000) && (
                  <Badge variant="secondary">
                    Harga: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-3 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="oldest">Terlama</SelectItem>
                <SelectItem value="price-low">Harga: Rendah-Tinggi</SelectItem>
                <SelectItem value="price-high">Harga: Tinggi-Rendah</SelectItem>
              </SelectContent>
            </Select>

            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden h-11">
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filter
                  {hasActiveFilters && (
                    <Badge className="ml-2" variant="secondary">
                      Aktif
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Produk</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  {renderFilterContent()}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Layout */}
          <div className="flex gap-8">
            <aside className="hidden md:block w-72 shrink-0">
              <div className="sticky top-24 rounded-2xl border border-white/70 bg-white/65 backdrop-blur-md p-6 shadow-[0_12px_35px_-30px_rgba(2,16,31,.45)]">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold tracking-tight">Filter</h2>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Reset
                    </Button>
                  )}
                </div>
                {renderFilterContent()}
              </div>
            </aside>

            <section className="flex-1">
              {loading ? (
                <div className="py-20 text-center text-muted-foreground">Memuat produk...</div>
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {lastPage > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                      <Button
                        variant="outline"
                        className="h-10"
                        onClick={() => goToPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Sebelumnya
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: lastPage }, (_, i) => i + 1)
                          .slice(0, 7)
                          .map((page) => (
                            <Button
                              key={page}
                              className="h-10 w-10"
                              variant={currentPage === page ? 'default' : 'ghost'}
                              size="icon"
                              onClick={() => goToPage(page)}
                            >
                              {page}
                            </Button>
                          ))}
                      </div>

                      <Button
                        variant="outline"
                        className="h-10"
                        onClick={() => goToPage(Math.min(lastPage, currentPage + 1))}
                        disabled={currentPage === lastPage}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight mb-2">Tidak ada produk ditemukan</h3>
                  <p className="text-muted-foreground mb-4">Coba ubah filter atau kata kunci pencarian</p>
                  <Button onClick={clearFilters}>Reset Filter</Button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProductList;
