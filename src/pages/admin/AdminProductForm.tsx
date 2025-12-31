import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { storageUrl } from '@/lib/api';
import { useAdminProductStore } from '@/stores/adminProductStore';
import { ImagePlus, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

type Props = { mode: 'create' | 'edit' };

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
] as const;

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold_out', label: 'Sold Out' },
  { value: 'inactive', label: 'Inactive' },
] as const;

type ExistingImage = {
  id: number;
  path: string;
  is_primary?: number | boolean;
  sort_order?: number;
};

export default function AdminProductForm({ mode }: Props) {
  const navigate = useNavigate();
  const { id } = useParams();

  const { fetchProduct, createProduct, updateProduct, loading } = useAdminProductStore();

  const editingId = useMemo(() => (mode === 'edit' ? Number(id) : null), [mode, id]);

  const [form, setForm] = useState({
    sku: '',
    name: '',
    slug: '',
    price: 0,
    description: '',
    category: 'other',
    condition: 'good' as 'new' | 'like_new' | 'good' | 'fair',
    status: 'active' as 'active' | 'reserved' | 'sold_out' | 'inactive',
    stock: 1 as 0 | 1,
  });

  // existing images from backend (read-only display)
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);

  // new images to upload
  const [newImages, setNewImages] = useState<File[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState<number>(0);
  const previews = useMemo(
    () => newImages.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [newImages],
  );

  // cleanup blob URLs
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  useEffect(() => {
    if (mode !== 'edit' || !editingId) return;

    (async () => {
      const p = await fetchProduct(editingId);
      if (!p) return;

      setForm({
        sku: p.sku ?? '',
        name: p.name ?? '',
        slug: p.slug ?? '',
        price: Number(p.price ?? 0),
        description: (p.description ?? '') as any,
        category: (p.category ?? 'other') as any,
        condition: p.condition ?? 'good',
        status: p.status ?? 'active',
        stock: Number(p.stock ?? 1) as 0 | 1,
      });

      setExistingImages((p.images ?? []) as any);
    })();
  }, [mode, editingId, fetchProduct]);

  const onPickImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const arr = Array.from(files);

    // basic guard: max 8 images
    const merged = [...newImages, ...arr].slice(0, 8);
    setNewImages(merged);

    // set default primary
    if (merged.length > 0 && primaryIndex >= merged.length) setPrimaryIndex(0);
  };

  const removeNewImage = (idx: number) => {
    setNewImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      // adjust primary
      if (next.length === 0) setPrimaryIndex(0);
      else if (primaryIndex === idx) setPrimaryIndex(0);
      else if (primaryIndex > idx) setPrimaryIndex((p) => p - 1);
      return next;
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.sku.trim()) return toast.error('SKU wajib diisi');
    if (!form.name.trim()) return toast.error('Nama wajib diisi');
    if (!Number.isFinite(form.price) || form.price < 0) return toast.error('Harga tidak valid');

    if (mode === 'create' && newImages.length === 0) {
      return toast.error('Minimal upload 1 gambar produk');
    }

    try {
      const payload = {
        sku: form.sku.trim(),
        name: form.name.trim(),
        // penting: kirim null/skip jika kosong -> di store kita "skip kalau empty"
        slug: form.slug.trim() || null,
        price: Number(form.price),
        description: form.description?.trim() ? form.description.trim() : null,
        category: form.category?.trim() ? form.category.trim() : null,
        condition: form.condition,
        status: form.status,
        stock: form.stock,
        images: newImages,
        primary_index: primaryIndex,
      };

      if (mode === 'create') {
        await createProduct(payload as any);
        toast.success('Produk berhasil dibuat');
        navigate('/admin/products');
      } else if (editingId) {
        await updateProduct(editingId, payload as any);
        toast.success('Produk berhasil diupdate');
        navigate('/admin/products');
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Gagal menyimpan');
    }
  };

  const primaryExisting = useMemo(() => {
    const imgs = existingImages ?? [];
    return imgs.find((x) => Boolean(x.is_primary)) ?? imgs[0];
  }, [existingImages]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">
            {mode === 'create' ? 'Tambah Produk' : 'Edit Produk'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Size akan otomatis ONE_SIZE sesuai rule backend thrifting Anda.
          </p>
        </div>

        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/admin/products">Kembali</Link>
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Form Produk</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input
                value={form.sku}
                onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                placeholder="OS21-TNF-TEE-BLACK-001"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label>Slug (opsional)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="the-north-face-tee-black"
                className="h-11"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Nama</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="The North Face T-Shirt Hitam (Logo Dada)"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label>Harga</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="tshirt / outer / pants / ..."
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label>Kondisi</Label>
              <Select
                value={form.condition}
                onValueChange={(v) => setForm((p) => ({ ...p, condition: v as any }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Pilih kondisi" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v as any }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Stock</Label>
              <Select
                value={String(form.stock)}
                onValueChange={(v) => setForm((p) => ({ ...p, stock: Number(v) as 0 | 1 }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Pilih stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (Tersedia)</SelectItem>
                  <SelectItem value="0">0 (Habis)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Untuk thrifting 1 item, stock hanya 0 atau 1.
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Deskripsi singkat produk..."
                className="min-h-[120px]"
              />
            </div>

            {/* Images */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label>Gambar Produk</Label>
                  <p className="text-xs text-muted-foreground">
                    Upload 1–8 gambar. Pilih salah satu sebagai{' '}
                    <span className="font-semibold">Primary</span>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="admin-product-images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => onPickImages(e.target.files)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => document.getElementById('admin-product-images')?.click()}
                  >
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Pilih Gambar
                  </Button>
                </div>
              </div>

              {/* Existing images (edit mode) */}
              {mode === 'edit' && existingImages.length > 0 && (
                <div className="rounded-2xl border bg-card p-4">
                  <div className="text-sm font-semibold mb-3">Gambar Saat Ini</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(existingImages ?? []).slice(0, 8).map((img) => (
                      <div
                        key={img.id}
                        className="relative overflow-hidden rounded-xl border bg-muted"
                      >
                        <img
                          src={storageUrl(img.path)}
                          alt="existing"
                          className="w-full h-28 object-cover"
                        />
                        {Boolean(img.is_primary) && (
                          <div className="absolute left-2 top-2 text-[11px] font-bold px-2 py-1 rounded-full bg-primary text-primary-foreground">
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {primaryExisting ? (
                    <p className="text-xs text-muted-foreground mt-3">
                      Primary saat ini akan tetap dipakai, kecuali Anda upload gambar baru dan
                      memilih Primary dari upload.
                    </p>
                  ) : null}
                </div>
              )}

              {/* New uploads preview */}
              {newImages.length > 0 && (
                <div className="rounded-2xl border bg-card p-4">
                  <div className="text-sm font-semibold mb-3">Gambar Baru (Akan diupload)</div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {previews.map((p, idx) => (
                      <div
                        key={idx}
                        className="relative overflow-hidden rounded-xl border bg-muted"
                      >
                        <img src={p.url} alt={`new-${idx}`} className="w-full h-28 object-cover" />

                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute right-2 top-2 rounded-full bg-black/60 text-white p-2 hover:bg-black/75 transition"
                          aria-label="Hapus gambar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <label className="absolute left-2 bottom-2 flex items-center gap-2 text-[11px] font-semibold bg-white/85 rounded-full px-2 py-1 cursor-pointer">
                          <input
                            type="radio"
                            name="primaryImage"
                            checked={primaryIndex === idx}
                            onChange={() => setPrimaryIndex(idx)}
                          />
                          Primary
                        </label>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground mt-3">
                    Primary akan diset berdasarkan pilihan radio di atas.
                  </p>
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
              <Button type="submit" disabled={loading} className="rounded-xl">
                {loading ? 'Menyimpan…' : 'Simpan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
