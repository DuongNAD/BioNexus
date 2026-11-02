import React, { useState, useEffect } from 'react';
import { PHOTOS, type PhotoMetadata } from '@/content/photos';
import { Photo } from '@/components/media/Photo';
import { ExternalLink, Heart, ShieldCheck, Image as ImageIcon, Sparkles, CheckCircle2, Search } from 'lucide-react';

export default function Credits(): React.JSX.Element {
  const [filter, setFilter] = useState<'all' | 'species' | 'product' | 'biome'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = 'Ghi công & Bản quyền Hình ảnh | BioNexus';
  }, []);

  const photoList: PhotoMetadata[] = Object.values(PHOTOS);

  const filteredPhotos = photoList.filter((p) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'species'
        ? p.role === 'hero' || p.role === 'portrait' || p.role === 'habitat' || p.role === 'gallery'
        : filter === 'product'
        ? p.role === 'product'
        : filter === 'biome'
        ? p.role === 'biome'
        : true;

    if (!matchesFilter) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.scientificName && p.scientificName.toLowerCase().includes(q)) ||
      p.credit.author.toLowerCase().includes(q) ||
      p.credit.license.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent mb-4">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Bản quyền Hình ảnh Tự do · Wikimedia Commons & iNaturalist</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-fg font-sans">
          Ghi công & Bản quyền Hình ảnh
        </h1>
        <p className="mt-4 text-base md:text-lg text-fg-2 leading-relaxed">
          BioNexus xin gửi lời triên sâu sắc tới cộng đồng <strong>Wikimedia Commons</strong>,{' '}
          <strong>iNaturalist</strong>, cùng các nhiếp ảnh gia và nhà nghiên cứu sinh học trên toàn thế giới đã cống hiến tư liệu hình ảnh vì tri thức chung của nhân loại.
        </p>
        <p className="mt-2 text-sm text-fg-3 flex items-center gap-1.5">
          <Heart className="h-4 w-4 text-danger fill-danger" aria-hidden="true" />
          <span>Toàn bộ 100% hình ảnh trong dự án là ảnh sinh học thật, minh bạch tác quyền. Tuyệt đối không sử dụng hình ảnh do AI tạo ra.</span>
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="rounded-xl border border-line bg-surface/80 backdrop-blur-md p-4">
          <div className="flex items-center justify-between text-accent mb-1">
            <span className="text-xs font-medium text-fg-3">File ảnh nội bộ</span>
            <ImageIcon className="size-4" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold font-mono text-fg">357</p>
          <p className="text-[11px] text-fg-3 mt-0.5">161 photos + 196 trip (AVIF & WebP)</p>
        </div>

        <div className="rounded-xl border border-line bg-surface/80 backdrop-blur-md p-4">
          <div className="flex items-center justify-between text-accent mb-1">
            <span className="text-xs font-medium text-fg-3">Tác phẩm nguồn</span>
            <ShieldCheck className="size-4" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold font-mono text-accent">{photoList.length}</p>
          <p className="text-[11px] text-fg-3 mt-0.5">Wikimedia Commons (đã kiểm chứng API)</p>
        </div>

        <div className="rounded-xl border border-line bg-surface/80 backdrop-blur-md p-4">
          <div className="flex items-center justify-between text-success mb-1">
            <span className="text-xs font-medium text-fg-3">Ảnh sinh vật thật</span>
            <CheckCircle2 className="size-4" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold font-mono text-success">100%</p>
          <p className="text-[11px] text-fg-3 mt-0.5">0 ảnh AI · Chân thực khoa học</p>
        </div>

        <div className="rounded-xl border border-line bg-surface/80 backdrop-blur-md p-4">
          <div className="flex items-center justify-between text-accent mb-1">
            <span className="text-xs font-medium text-fg-3">Giấy phép tự do</span>
            <Sparkles className="size-4" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold font-mono text-fg">CC BY / SA</p>
          <p className="text-[11px] text-fg-3 mt-0.5">CC0, CC BY 4.0, CC BY-SA</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-line pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: `Tất cả (${photoList.length})` },
            { id: 'species', label: 'Bách khoa loài' },
            { id: 'product', label: 'Sản phẩm sinh vật cảnh' },
            { id: 'biome', label: 'Sinh cảnh & Không khí' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-accent text-accent-ink shadow-[var(--glow-accent-btn)]'
                  : 'border border-line bg-surface text-fg-2 hover:border-line-strong hover:text-fg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-fg-3" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo loài, tác giả, giấy phép..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-line bg-surface text-xs text-fg placeholder:text-fg-mute focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-line rounded-2xl bg-surface/40">
          <p className="text-sm text-fg-3">Không tìm thấy tư liệu ảnh phù hợp với từ khóa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group rounded-2xl border border-line bg-surface overflow-hidden hover:border-line-strong hover:bg-surface-hover transition-all duration-200 flex flex-col"
            >
              <div className="relative aspect-video overflow-hidden bg-bg-raised">
                <Photo photo={photo} className="h-full w-full object-cover" />
                <span className="absolute top-3 left-3 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono uppercase text-accent border border-line">
                  {photo.role}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-base font-semibold text-fg tracking-tight">
                    {photo.title}
                  </h2>
                  {photo.scientificName && (
                    <p className="text-xs font-serif italic text-accent mt-0.5">
                      {photo.scientificName}
                    </p>
                  )}
                  <p className="text-xs text-fg-3 mt-2 line-clamp-2">
                    {photo.alt}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-fg-3 text-[11px]">Tác giả:</p>
                    <p className="font-medium text-fg-2 truncate max-w-[160px]">{photo.credit.author}</p>
                  </div>
                  <div className="text-right">
                    <a
                      href={photo.credit.licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline text-[11px] block"
                    >
                      {photo.credit.license}
                    </a>
                    <a
                      href={photo.credit.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fg-3 hover:text-fg text-[11px] inline-flex items-center gap-1 mt-0.5"
                    >
                      <span>Wikimedia Commons</span>
                      <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
