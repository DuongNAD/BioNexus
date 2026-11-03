import React from 'react';
import { Link, useLocation } from 'react-router';
import { Compass, ArrowLeft, Home, Search, Leaf } from 'lucide-react';

export default function NotFoundPage(): React.JSX.Element {
  const location = useLocation();

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-6 py-16 text-center max-w-2xl mx-auto">
      {/* Visual Badge */}
      <div className="relative mb-6">
        <div className="size-24 rounded-3xl border border-accent/30 bg-accent/10 backdrop-blur-2xl flex items-center justify-center text-accent shadow-[0_0_40px_rgba(110,231,183,0.15)]">
          <Compass className="size-12 animate-pulse" aria-hidden="true" />
        </div>
        <span className="absolute -bottom-2 -right-2 rounded-full border border-danger/40 bg-danger/20 px-2.5 py-0.5 text-[11px] font-mono font-bold text-danger">
          404
        </span>
      </div>

      <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent mb-3">
        Lạc lối trong Sinh quyển
      </span>

      <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-fg font-sans">
        Đường Dẫn Không Tồn Tại
      </h1>

      <p className="mt-4 text-base md:text-lg text-fg-2 leading-relaxed max-w-lg">
        Tọa độ sinh học mà bạn đang tìm kiếm không tồn tại hoặc đã được di dời sang một phân hệ phân loại khác trong hệ sinh thái BioNexus.
      </p>

      {/* Thông tin đường dẫn */}
      <div className="mt-6 rounded-xl border border-line/60 bg-surface/50 px-4 py-2 text-xs font-mono text-fg-3 shadow-inner">
        Đường dẫn yêu cầu: <span className="text-danger font-semibold">{location.pathname}</span>
      </div>

      {/* Hành động điều hướng */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold text-accent-ink hover:opacity-90 shadow-[var(--glow-accent-btn)] transition-all"
        >
          <Home className="size-4" aria-hidden="true" />
          <span>Trở về Trang chủ</span>
        </Link>

        <Link
          to="/species"
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-2.5 text-xs font-semibold text-fg hover:border-line-strong hover:bg-surface-hover transition-colors"
        >
          <Leaf className="size-4 text-accent" aria-hidden="true" />
          <span>Khám phá Bách khoa loài</span>
        </Link>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-2.5 text-xs font-semibold text-fg hover:border-line-strong hover:bg-surface-hover transition-colors"
        >
          <Search className="size-4 text-accent" aria-hidden="true" />
          <span>Sàn sinh vật cảnh</span>
        </Link>
      </div>

      {/* Chú thích an toàn */}
      <p className="mt-12 text-xs text-fg-3 flex items-center justify-center gap-1.5">
        <ArrowLeft className="size-3" aria-hidden="true" />
        <span>Nếu bạn nghi ngờ đây là sự cố hệ thống, vui lòng thử lại sau ít phút.</span>
      </p>
    </div>
  );
}
