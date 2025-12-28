import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useProductStore } from '@/stores/productStore';
import { ArrowRight, Heart, Leaf, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Index = () => {
  const { products } = useProductStore();
  const featuredProducts = products.filter((p) => p.stock > 0).slice(0, 4);

  return (
    <>
      <Helmet>
        <title>Second Outdoor - Sustainable Fashion Store</title>
        <meta name="description" content="Temukan pakaian vintage berkualitas dengan harga terjangkau. Sustainable fashion untuk gaya unik Anda." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <div className="container mx-auto px-6 md:px-12 relative">
            <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
              {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary mb-6">
                <Leaf className="w-4 h-4" />
                <span className="text-sm font-medium">Sustainable Fashion</span>
              </div> */}
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Temukan Gaya Unik dengan{' '}
                <span className="text-primary">Thrift Fashion</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Koleksi pakaian vintage berkualitas. Setiap item unik, hanya satu di dunia.
                Bergaya dengan sustainable fashion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="h-14 px-8 text-base">
                  <Link to="/products">
                    Jelajahi Koleksi
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base">
                  <Link to="/login">Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Sparkles, title: 'Kurasi Berkualitas', desc: 'Setiap item dipilih dengan teliti untuk kualitas terbaik' },
                { icon: Leaf, title: 'Eco-Friendly', desc: 'Mendukung fashion berkelanjutan dan ramah lingkungan' },
                { icon: Heart, title: 'Item Unik', desc: 'Setiap produk hanya 1 pcs, tidak akan ada yang sama' },
              ].map((f, i) => (
                <div key={i} className="glass-card rounded-xl p-6 text-center hover-lift animate-fade-in" style={{ animationDelay: `${0.1 * i}s` }}>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <f.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-display text-2xl md:text-3xl font-bold">Koleksi Terbaru</h2>
              <Button asChild variant="ghost">
                <Link to="/products">Lihat Semua <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, i) => (
                <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${0.1 * i}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Index;
