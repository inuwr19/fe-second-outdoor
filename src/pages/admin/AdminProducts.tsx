import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAdminProductStore } from '@/stores/adminProductStore';
import { Image as ImageIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

function money(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);
}

export default function AdminProducts() {
  const {
    products,
    loading,
    error,
    currentPage,
    lastPage,
    total,
    fetchProducts,
    deleteProduct,
    primaryImageUrl,
  } = useAdminProductStore();

  const [q, setQ] = useState('');

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) => {
      const hay = `${p.name} ${p.sku} ${p.slug} ${p.category ?? ''}`.toLowerCase();
      return hay.includes(s);
    });
  }, [products, q]);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-success text-success-foreground',
      reserved: 'bg-warning text-warning-foreground',
      sold_out: 'bg-destructive text-destructive-foreground',
      inactive: 'bg-muted text-muted-foreground',
    };
    return map[status] ?? 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Produk</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? 'Memuat…' : `Total: ${total} (halaman ${currentPage}/${lastPage})`}
          </p>
          {error ? <p className="text-sm text-destructive mt-2">{error}</p> : null}
        </div>

        <Button asChild className="rounded-xl">
          <Link to="/admin/products/new">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Produk
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="space-y-3">
          <CardTitle className="text-base">Daftar Produk</CardTitle>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama / SKU / slug / kategori…"
            className="h-11"
          />
        </CardHeader>

        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-sm text-muted-foreground py-8">Memuat produk…</div>
          ) : filtered.length ? (
            filtered.map((p) => {
              const img = primaryImageUrl(p);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-4 rounded-xl border bg-card px-4 py-3"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex items-center justify-center shrink-0">
                      {img ? (
                        <img src={img} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-semibold truncate">{p.name}</div>
                        <Badge className={statusBadge(p.status)}>{p.status}</Badge>
                        <Badge variant="outline">stock: {p.stock}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        SKU: <span className="font-medium">{p.sku}</span> • Slug:{' '}
                        <span className="font-medium">{p.slug}</span>
                      </div>
                      <div className="text-sm font-bold mt-1">{money(Number(p.price ?? 0))}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button asChild variant="outline" className="rounded-xl">
                      <Link to={`/admin/products/${p.id}/edit`}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    </Button>

                    <Button
                      variant="destructive"
                      className="rounded-xl"
                      onClick={async () => {
                        const ok = confirm(`Hapus produk: ${p.name}?`);
                        if (!ok) return;
                        await deleteProduct(p.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-muted-foreground py-8">Tidak ada produk.</div>
          )}

          {lastPage > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => fetchProducts(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                onClick={() => fetchProducts(Math.min(lastPage, currentPage + 1))}
                disabled={currentPage === lastPage}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
