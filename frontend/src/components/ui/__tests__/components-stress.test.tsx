import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from '../Card';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../Tabs';
import { Skeleton } from '../Skeleton';
import { Kbd } from '../Kbd';
import { Logo, LogoText } from '../Logo';
import { Photo } from '@/components/media/Photo';
import { PhotoCredit } from '@/components/media/PhotoCredit';
import type { PhotoMetadata } from '@/content/photos';

describe('Adversarial Stress-Testing: Card Component', () => {
  it('Chống chịu nội dung cực lớn và nhiều đoạn văn bản phức tạp', () => {
    const massiveContent = 'Sinh vật cảnh quý hiếm '.repeat(100);
    render(<Card data-testid="stress-card">{massiveContent}</Card>);
    const card = screen.getByTestId('stress-card');
    expect(card).toBeInTheDocument();
    expect(card.textContent).toContain('Sinh vật cảnh quý hiếm');
  });

  it('Hỗ trợ đầy đủ các biến thể padding: none, sm, md, lg', () => {
    const { rerender } = render(<Card padding="none" data-testid="card-pad">Content</Card>);
    expect(screen.getByTestId('card-pad')).toHaveClass('p-0');

    rerender(<Card padding="sm" data-testid="card-pad">Content</Card>);
    expect(screen.getByTestId('card-pad')).toHaveClass('p-4');

    rerender(<Card padding="md" data-testid="card-pad">Content</Card>);
    expect(screen.getByTestId('card-pad')).toHaveClass('p-6');

    rerender(<Card padding="lg" data-testid="card-pad">Content</Card>);
    expect(screen.getByTestId('card-pad')).toHaveClass('p-8');
  });

  it('Trạng thái tương tác interactive và hiệu ứng glow', () => {
    const handleClick = vi.fn();
    render(
      <Card interactive glow onClick={handleClick} data-testid="card-interactive">
        Interactive Card
      </Card>
    );
    const card = screen.getByTestId('card-interactive');
    expect(card).toHaveClass('cursor-pointer');
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('Adversarial Stress-Testing: Select Component', () => {
  it('Chịu tải danh sách 1.000 tùy chọn (options) kèm tiếng Việt có dấu', () => {
    const thousandsOptions = Array.from({ length: 1000 }, (_, i) => ({
      value: `val-${i}`,
      label: `Cá thể sinh học thứ ${i}: Lan Đột Biến Phú Thọ 5 Cánh Trắng`,
    }));

    render(
      <Select
        label="Chọn mẫu vật"
        options={thousandsOptions}
        data-testid="stress-select"
      />
    );
    const select = screen.getByTestId('stress-select') as HTMLSelectElement;
    expect(select.options.length).toBe(1000);
    expect(select.options[999]?.textContent).toContain('thứ 999');
  });

  it('Xử lý placeholder, disabled, required và sự kiện onChange', () => {
    const handleChange = vi.fn();
    render(
      <Select
        label="Phân loại"
        required
        placeholder="-- Vui lòng chọn --"
        options={[
          { value: 'opt1', label: 'Bò sát (Reptilia)' },
          { value: 'opt2', label: 'Lưỡng cư (Amphibia)' },
        ]}
        onChange={handleChange}
        data-testid="select-action"
      />
    );

    const select = screen.getByTestId('select-action') as HTMLSelectElement;
    expect(screen.getByText('*')).toHaveClass('text-danger');
    expect(select.options[0]?.text).toBe('-- Vui lòng chọn --');
    expect(select.options[0]?.disabled).toBe(true);

    fireEvent.change(select, { target: { value: 'opt2' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(select.value).toBe('opt2');
  });

  it('Hiển thị thông báo lỗi và gắn aria-invalid/aria-describedby chuẩn a11y', () => {
    render(
      <Select
        id="species-select"
        label="Loài"
        error="Bạn phải chọn loài hợp lệ"
        options={[{ value: '1', label: 'Axolotl' }]}
      />
    );

    const select = screen.getByLabelText(/Loài/i);
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAttribute('aria-describedby', 'species-select-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Bạn phải chọn loài hợp lệ');
  });
});

describe('Adversarial Stress-Testing: Textarea Component', () => {
  it('Chống chịu khối văn bản 10.000 ký tự', () => {
    const massiveText = 'Mô tả sinh cảnh chi tiết: '.repeat(400);
    render(<Textarea defaultValue={massiveText} data-testid="stress-textarea" />);
    const textarea = screen.getByTestId('stress-textarea') as HTMLTextAreaElement;
    expect(textarea.value.length).toBeGreaterThan(10000);
  });

  it('Hỗ trợ tùy biến số dòng rows, disabled, required và auto-id', () => {
    render(
      <Textarea
        label="Ghi chú hồ sơ"
        required
        rows={8}
        disabled
        helperText="Tối đa 500 từ"
        data-testid="textarea-advanced"
      />
    );

    const textarea = screen.getByTestId('textarea-advanced');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute('rows', '8');
    expect(screen.getByText('*')).toHaveClass('text-danger');
    expect(screen.getByText('Tối đa 500 từ')).toBeInTheDocument();
  });

  it('Hiển thị thông báo lỗi và aria-invalid trên Textarea', () => {
    render(
      <Textarea
        id="desc-textarea"
        label="Mô tả"
        error="Mô tả không được để trống"
      />
    );

    const textarea = screen.getByLabelText(/Mô tả/i);
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAttribute('aria-describedby', 'desc-textarea-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Mô tả không được để trống');
  });
});

describe('Adversarial Stress-Testing: Tabs Component', () => {
  it('Render cấu trúc Tabs WAI-ARIA và hỗ trợ các thuộc tính aria chuẩn', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tổng quan</TabsTrigger>
          <TabsTrigger value="tab2">Sinh học</TabsTrigger>
          <TabsTrigger value="tab3" disabled>Khóa</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Nội dung Tổng quan</TabsContent>
        <TabsContent value="tab2">Nội dung Sinh học</TabsContent>
        <TabsContent value="tab3">Nội dung Bị Khóa</TabsContent>
      </Tabs>
    );

    expect(screen.getByText('Nội dung Tổng quan')).toBeInTheDocument();

    const tab1 = screen.getByRole('tab', { name: 'Tổng quan' });
    const tab2 = screen.getByRole('tab', { name: 'Sinh học' });
    const tab3 = screen.getByRole('tab', { name: 'Khóa' });

    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(tab2).toHaveAttribute('aria-selected', 'false');
    expect(tab3).toHaveAttribute('data-disabled');

    // Kích hoạt tab 2 qua phím mũi tên hoặc focus/click
    fireEvent.focus(tab2);
    fireEvent.keyDown(tab2, { key: 'Enter' });
    expect(tab2).toHaveAttribute('role', 'tab');
  });
});

describe('Adversarial Stress-Testing: Skeleton, Kbd & Logo Components', () => {
  it('Skeleton render đúng class pulse, aria-busy và variant', () => {
    const { container, rerender } = render(<Skeleton className="h-10 w-48 rounded-full" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('animate-pulse');
    expect(el).toHaveAttribute('aria-busy', 'true');
    expect(el).toHaveAttribute('aria-live', 'polite');

    rerender(<Skeleton variant="circular" />);
    expect(container.firstChild).toHaveClass('rounded-full');

    rerender(<Skeleton variant="text" />);
    expect(container.firstChild).toHaveClass('h-4', 'w-full');
  });

  it('Kbd render phím tắt với font monospace và border bo tròn', () => {
    render(<Kbd data-testid="kbd-test">⌘K</Kbd>);
    const kbd = screen.getByTestId('kbd-test');
    expect(kbd).toHaveTextContent('⌘K');
    expect(kbd).toHaveClass('font-mono', 'rounded-md');
  });

  it('Logo render SVG vector sạch sẽ, hỗ trợ kích thước và chế độ tiếp cận', () => {
    const { rerender } = render(<Logo size={32} data-testid="logo-test" />);
    const svg = screen.getByTestId('logo-test');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
    expect(svg).toHaveAttribute('aria-hidden', 'true');

    // Chế độ semantic có aria-label
    rerender(<Logo size={24} aria-label="Biểu trưng BioNexus" data-testid="logo-test" />);
    const semanticSvg = screen.getByTestId('logo-test');
    expect(semanticSvg).toHaveAttribute('role', 'img');
    expect(semanticSvg).toHaveAttribute('aria-label', 'Biểu trưng BioNexus');
    expect(semanticSvg).not.toHaveAttribute('aria-hidden');

    // LogoText
    render(<LogoText data-testid="logo-text" />);
    expect(screen.getByTestId('logo-text')).toHaveTextContent('BioNexus');
  });
});

describe('Adversarial Stress-Testing: Media Components (Photo & PhotoCredit)', () => {
  const mockPhoto: PhotoMetadata = {
    id: 'test-species/hero-1',
    title: 'Kỳ giông Mexico Axolotl',
    scientificName: 'Ambystoma mexicanum',
    width: 1920,
    height: 1080,
    focus: '50% 50%',
    sources: {
      avif: [
        { width: 960, src: 'photos/test/hero-960.avif' },
        { width: 1920, src: 'photos/test/hero-1920.avif' },
      ],
      webp: [
        { width: 960, src: 'photos/test/hero-960.webp' },
        { width: 1920, src: 'photos/test/hero-1920.webp' },
      ],
      jpg: 'photos/test/hero-1920.jpg',
    },
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0...',
    credit: {
      author: 'John Doe',
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Axolotl.jpg',
    },
    role: 'hero',
    aspectRatio: 16 / 9,
    alt: 'Ảnh thử nghiệm',
  };

  it('Photo: Render responsive picture với AVIF, WebP srcset và fallback JPG', () => {
    const { container } = render(<Photo photo={mockPhoto} priority alt="Ảnh thử nghiệm" />);
    const pic = container.querySelector('picture');
    expect(pic).toBeInTheDocument();

    const sources = container.querySelectorAll('source');
    expect(sources.length).toBe(2);
    expect(sources[0]?.getAttribute('type')).toBe('image/avif');
    expect(sources[0]?.getAttribute('srcset')).toContain('photos/test/hero-960.avif 960w');
    expect(sources[1]?.getAttribute('type')).toBe('image/webp');

    const img = container.querySelector('img:not([aria-hidden="true"])');
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute('src')).toBe('photos/test/hero-1920.jpg');
    expect(img?.getAttribute('alt')).toBe('Ảnh thử nghiệm');
    expect(img?.getAttribute('loading')).toBe('eager');
  });

  it('Photo: Fallback an toàn khi không tìm thấy dữ liệu ảnh', () => {
    render(<Photo id="non-existent-photo-id-9999" data-testid="missing-photo" />);
    const missing = screen.getByTestId('missing-photo');
    expect(missing).toHaveTextContent('Chưa có ảnh');
  });

  it('PhotoCredit: Variant hover-chip hiển thị thông tin bản quyền và link Commons an toàn', () => {
    render(<PhotoCredit credit={mockPhoto.credit} variant="hover-chip" />);
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText('CC BY-SA 4.0')).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('PhotoCredit: Variant mobile-popover tương tác mở và đóng an toàn', () => {
    render(<PhotoCredit credit={mockPhoto.credit} variant="mobile-popover" />);
    const toggleBtn = screen.getByRole('button', { name: 'Thông tin bản quyền ảnh' });
    expect(toggleBtn).toBeInTheDocument();

    expect(screen.queryByText('Bản quyền hình ảnh')).not.toBeInTheDocument();

    // Mở popover
    fireEvent.click(toggleBtn);
    expect(screen.getByText('Bản quyền hình ảnh')).toBeInTheDocument();
    expect(screen.getByText(/Tác giả: John Doe/)).toBeInTheDocument();

    // Đóng popover
    fireEvent.click(toggleBtn);
    expect(screen.queryByText('Bản quyền hình ảnh')).not.toBeInTheDocument();
  });
});
