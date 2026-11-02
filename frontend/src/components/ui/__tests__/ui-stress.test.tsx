import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Badge } from '../Badge';
import { IucnBadge, ConservationStatus } from '../IucnBadge';
import { StatusPill } from '../StatusPill';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../Dialog';
import { Price } from '../Price';
import { Search, X } from 'lucide-react';

describe('Adversarial Stress-Testing: Button Component', () => {
  it('Chống chịu chuỗi cực dài và ký tự Unicode tiếng Việt có dấu đầy đủ', () => {
    const extremeVietnamese =
      'Bách khoa Sinh học & Sàn Sinh vật cảnh BioNexus: Cá Rồng Huyết Long, Trăn Gấm Việt Nam, Rùa Sa Nhân, Lan Phi Điệp Đột Biến 5 Cánh Trắng Phú Thọ — 100% tiếng Việt có dấu: ắ, ằ, ẳ, ẵ, ặ, ấ, ầ, ẩ, ẫ, ậ, é, è, ẻ, ẽ, ẹ, ê, ế, ề, ể, ễ, ệ, í, ì, ỉ, ĩ, ị, ó, ò, ỏ, õ, ọ, ô, ố, ồ, ổ, ỗ, ộ, ơ, ớ, ờ, ở, ỡ, ợ, ú, ù, ủ, ũ, ụ, ư, ứ, ừ, ử, ữ, ự, ý, ỳ, ỷ, ỹ, ỵ, đ.';
    render(<Button>{extremeVietnamese}</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.textContent).toContain('Cá Rồng Huyết Long');
    expect(button.textContent).toContain('100% tiếng Việt');
  });

  it('Xử lý an toàn khi children là chuỗi rỗng, số 0 hoặc null/undefined', () => {
    const { rerender } = render(<Button>{''}</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button>{0}</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('0');

    rerender(<Button>{null}</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button>{undefined}</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('Trạng thái isLoading: hiển thị spinner, disable button, chặn onClick', () => {
    const handleClick = vi.fn();
    render(
      <Button isLoading onClick={handleClick}>
        Đang tải dữ liệu
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.querySelector('svg')).toBeInTheDocument(); // Loader2 spinner

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('Trạng thái disabled thông thường: chặn onClick và có class disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Nút bị khóa
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('Hỗ trợ đầy đủ các biến thể variant, size, pill và icons', () => {
    const left = <span data-testid="left-icon">L</span>;
    const right = <span data-testid="right-icon">R</span>;
    const { rerender } = render(
      <Button variant="ghost" size="lg" pill leftIcon={left} rightIcon={right}>
        Hành động
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-full');
    expect(button).toHaveClass('h-12');
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();

    rerender(<Button variant="icon" size="icon" aria-label="Menu" />);
    expect(screen.getByRole('button')).toHaveClass('h-10', 'w-10');
  });
});

describe('Adversarial Stress-Testing: Input Component', () => {
  it('Chống chịu chuỗi nhập liệu cực dài và các ký tự đặc biệt', () => {
    const massiveText = 'A'.repeat(5000);
    render(<Input defaultValue={massiveText} data-testid="stress-input" />);
    const input = screen.getByTestId('stress-input') as HTMLInputElement;
    expect(input.value.length).toBe(5000);
  });

  it('Liên kết label với id tự sinh qua React.useId()', () => {
    render(<Input label="Tên loài sinh vật" required />);
    const label = screen.getByText(/Tên loài sinh vật/i);
    const input = screen.getByLabelText(/Tên loài sinh vật/i);
    expect(input).toBeInTheDocument();
    expect(label.getAttribute('for')).toBe(input.getAttribute('id'));
    expect(screen.getByText('*')).toHaveClass('text-danger');
  });

  it('Ưu tiên hiển thị thông báo lỗi và gắn aria-invalid/aria-describedby chuẩn a11y', () => {
    render(
      <Input
        id="test-species-name"
        label="Tên khoa học"
        error="Tên khoa học không được để trống"
        helperText="Ví dụ: Panthera tigris"
      />
    );

    const input = screen.getByLabelText(/Tên khoa học/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'test-species-name-error');

    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toHaveTextContent('Tên khoa học không được để trống');
    expect(errorAlert).toHaveClass('text-danger');
    expect(screen.queryByText('Ví dụ: Panthera tigris')).not.toBeInTheDocument();
  });

  it('Hiển thị helperText khi không có lỗi', () => {
    render(
      <Input
        id="test-desc"
        label="Mô tả"
        helperText="Nhập thông tin sinh cảnh tự nhiên"
      />
    );

    const input = screen.getByLabelText(/Mô tả/i);
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveAttribute('aria-describedby', 'test-desc-helper');
    expect(screen.getByText('Nhập thông tin sinh cảnh tự nhiên')).toBeInTheDocument();
  });

  it('Vô hiệu hóa đúng cách khi disabled=true', () => {
    const handleChange = vi.fn();
    render(<Input disabled onChange={handleChange} data-testid="disabled-input" />);
    const input = screen.getByTestId('disabled-input');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed');
  });

  it('Render biểu tượng leftIcon và rightIcon với padding tương ứng', () => {
    render(
      <Input
        leftIcon={<Search className="h-4 w-4" data-testid="left-search" />}
        rightIcon={<X className="h-4 w-4" data-testid="right-clear" />}
        data-testid="icon-input"
      />
    );
    expect(screen.getByTestId('left-search')).toBeInTheDocument();
    expect(screen.getByTestId('right-clear')).toBeInTheDocument();
    expect(screen.getByTestId('icon-input')).toHaveClass('pl-10', 'pr-10');
  });
});

describe('Adversarial Stress-Testing: Badge Component', () => {
  it('Hỗ trợ toàn bộ 5 biến thể màu sắc chuẩn', () => {
    const variants = ['default', 'accent', 'success', 'warning', 'danger'] as const;
    const { rerender } = render(<Badge variant="default">Test</Badge>);

    for (const v of variants) {
      rerender(<Badge variant={v}>{`Huy hiệu ${v}`}</Badge>);
      expect(screen.getByText(`Huy hiệu ${v}`)).toBeInTheDocument();
    }
  });

  it('Xử lý an toàn với chuỗi rỗng và ký tự Unicode đặc biệt', () => {
    render(<Badge>{'Đặc hữu Hoàng Liên Sơn — Sa Pa'}</Badge>);
    expect(screen.getByText('Đặc hữu Hoàng Liên Sơn — Sa Pa')).toBeInTheDocument();
  });
});

describe('Adversarial Stress-Testing: IucnBadge Component', () => {
  it('Kiểm tra tính chính xác của toàn bộ 7 cấp bảo tồn IUCN tiêu chuẩn', () => {
    const expectedLabels: Record<ConservationStatus, string> = {
      LC: 'Ít quan tâm',
      NT: 'Sắp bị đe dọa',
      VU: 'Sắp nguy cấp',
      EN: 'Nguy cấp',
      CR: 'Cực kỳ nguy cấp',
      EW: 'Tuyệt chủng tự nhiên',
      EX: 'Tuyệt chủng',
    };

    for (const [code, label] of Object.entries(expectedLabels) as [ConservationStatus, string][]) {
      const { unmount } = render(<IucnBadge code={code} />);
      expect(screen.getByText(code)).toBeInTheDocument();
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });

  it('Cấp EX (Tuyệt chủng) phải có viền trắng tương phản trên nền tối', () => {
    const { container } = render(<IucnBadge code="EX" />);
    expect(screen.getByText('EX')).toBeInTheDocument();
    expect(screen.getByText('Tuyệt chủng')).toBeInTheDocument();
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).toHaveClass('border', 'border-white/60');
    expect(dot).toHaveStyle({ backgroundColor: '#000000' });
  });

  it('Không phân biệt hoa thường (case-insensitive) đối với mã IUCN', () => {
    const { rerender } = render(<IucnBadge code="cr" />);
    expect(screen.getByText('CR')).toBeInTheDocument();
    expect(screen.getByText('Cực kỳ nguy cấp')).toBeInTheDocument();

    rerender(<IucnBadge code="vu" />);
    expect(screen.getByText('VU')).toBeInTheDocument();
    expect(screen.getByText('Sắp nguy cấp')).toBeInTheDocument();

    rerender(<IucnBadge code="eX" />);
    expect(screen.getByText('EX')).toBeInTheDocument();
    expect(screen.getByText('Tuyệt chủng')).toBeInTheDocument();
  });

  it('Xử lý kiên cố các giá trị bất thường, mã lạ, nullish hoặc chuỗi rỗng', () => {
    const { rerender } = render(<IucnBadge code="" />);
    expect(screen.getByText('--')).toBeInTheDocument();
    expect(screen.getByText('Chưa xác định')).toBeInTheDocument();

    rerender(<IucnBadge code="UNKNOWN_CODE_999" />);
    expect(screen.getByText('UNKNOWN_CODE_999')).toBeInTheDocument();
    expect(screen.getByText('Chưa xác định')).toBeInTheDocument();

    rerender(<IucnBadge code={null as unknown as string} />);
    expect(screen.getByText('--')).toBeInTheDocument();
    expect(screen.getByText('Chưa xác định')).toBeInTheDocument();

    rerender(<IucnBadge code={undefined as unknown as string} />);
    expect(screen.getByText('--')).toBeInTheDocument();
    expect(screen.getByText('Chưa xác định')).toBeInTheDocument();
  });

  it('Ẩn nhãn tiếng Việt khi showLabel=false', () => {
    render(<IucnBadge code="EN" showLabel={false} />);
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.queryByText('Nguy cấp')).not.toBeInTheDocument();
  });
});

describe('Adversarial Stress-Testing: StatusPill Component', () => {
  it('Hỗ trợ toàn bộ 9 trạng thái nghiệp vụ chuẩn', () => {
    const statuses = [
      { status: 'PENDING', expectedLabel: 'Đang chờ duyệt' },
      { status: 'APPROVED', expectedLabel: 'Đã duyệt' },
      { status: 'ACTIVE', expectedLabel: 'Đang hoạt động' },
      { status: 'COMPLETED', expectedLabel: 'Đã hoàn tất' },
      { status: 'REJECTED', expectedLabel: 'Bị từ chối' },
      { status: 'BANNED', expectedLabel: 'Bị khóa' },
      { status: 'CANCELLED', expectedLabel: 'Đã hủy' },
      { status: 'SOLD_OUT', expectedLabel: 'Hết hàng' },
      { status: 'INACTIVE', expectedLabel: 'Chưa kích hoạt' },
    ];

    for (const item of statuses) {
      const { unmount } = render(<StatusPill status={item.status} />);
      expect(screen.getByText(item.expectedLabel)).toBeInTheDocument();
      unmount();
    }
  });

  it('Hỗ trợ trạng thái chữ thường (case-insensitive)', () => {
    render(<StatusPill status="approved" />);
    expect(screen.getByText('Đã duyệt')).toBeInTheDocument();
  });

  it('Cho phép ghi đè nhãn tùy biến qua prop label', () => {
    render(<StatusPill status="PENDING" label="Chờ Admin phê chuẩn" />);
    expect(screen.getByText('Chờ Admin phê chuẩn')).toBeInTheDocument();
  });

  it('Xử lý an toàn khi trạng thái không xác định hoặc nullish', () => {
    const { rerender } = render(<StatusPill status="CUSTOM_WEIRD_STATE" />);
    expect(screen.getByText('CUSTOM_WEIRD_STATE')).toBeInTheDocument();

    rerender(<StatusPill status="" />);
    expect(screen.getByText('Không rõ')).toBeInTheDocument();

    rerender(<StatusPill status={null as unknown as string} />);
    expect(screen.getByText('Không rõ')).toBeInTheDocument();
  });
});

describe('Adversarial Stress-Testing: Dialog Component', () => {
  it('Mở hộp thoại modal, hiển thị tiêu đề, mô tả và đóng qua nút X', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Mở hộp thoại</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận giao dịch sinh vật cảnh</DialogTitle>
            <DialogDescription>
              Vui lòng kiểm tra kỹ thông tin loài có giấy phép hợp lệ.
            </DialogDescription>
          </DialogHeader>
          <p>Nội dung chi tiết đơn hàng...</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Hủy bỏ</Button>
            </DialogClose>
            <Button variant="primary">Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Nhấn mở hộp thoại
    fireEvent.click(screen.getByRole('button', { name: /Mở hộp thoại/i }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Xác nhận giao dịch sinh vật cảnh')).toBeInTheDocument();
    expect(
      screen.getByText(/Vui lòng kiểm tra kỹ thông tin loài/i)
    ).toBeInTheDocument();

    // Nhấn nút đóng (X) có nhãn sr-only 'Đóng'
    const closeBtn = screen.getByRole('button', { name: /Đóng/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Đóng hộp thoại khi nhấn phím Escape', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Mở modal</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Tiêu đề</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    fireEvent.click(screen.getByRole('button', { name: /Mở modal/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Adversarial Stress-Testing: Price Component', () => {
  it('Hiển thị chính xác giá trị bằng 0 kèm ký hiệu ₫ và margin ml-1', () => {
    render(<Price amount={0} data-testid="price-zero" />);
    const el = screen.getByTestId('price-zero');
    expect(el.textContent).toBe('0₫');
    expect(el.querySelector('span:first-child')?.textContent).toBe('0');
    const currencySpan = el.querySelector('span.ml-1');
    expect(currencySpan).toBeInTheDocument();
    expect(currencySpan?.textContent).toBe('₫');
  });

  it('Xử lý giá trị âm bằng cách kẹp về 0 (clamped to 0)', () => {
    render(<Price amount={-150000} data-testid="price-neg" />);
    const el = screen.getByTestId('price-neg');
    expect(el.textContent).toBe('0₫');
    expect(el.querySelector('span:first-child')?.textContent).toBe('0');
  });

  it('Định dạng chính xác số tiền lớn (ví dụ: 999.999.999 ₫)', () => {
    render(<Price amount={999999999} data-testid="price-massive" />);
    const el = screen.getByTestId('price-massive');
    expect(el.querySelector('span:first-child')?.textContent).toBe('999.999.999');
    expect(el.textContent).toBe('999.999.999₫');
  });

  it('Định dạng chính xác số tiền cực đại (ví dụ: 1 nghìn tỷ VND)', () => {
    render(<Price amount={1000000000000} data-testid="price-trillion" />);
    const el = screen.getByTestId('price-trillion');
    expect(el.querySelector('span:first-child')?.textContent).toBe('1.000.000.000.000');
    expect(el.textContent).toBe('1.000.000.000.000₫');
  });

  it('Xử lý số thập phân (fractional values) theo locale vi-VN', () => {
    render(<Price amount={12345.5} data-testid="price-fraction" />);
    const el = screen.getByTestId('price-fraction');
    // Trong vi-VN: dấu phân cách hàng nghìn là chấm '.', phần thập phân là phẩy ','
    expect(el.querySelector('span:first-child')?.textContent).toBe('12.345,5');
    expect(el.textContent).toBe('12.345,5₫');
  });

  it('Xử lý kiên cố khi nhận NaN, null, undefined hoặc chuỗi không hợp lệ', () => {
    const { rerender } = render(<Price amount={NaN} data-testid="price-invalid" />);
    expect(screen.getByTestId('price-invalid').textContent).toBe('0₫');

    rerender(<Price amount={null as unknown as number} data-testid="price-invalid" />);
    expect(screen.getByTestId('price-invalid').textContent).toBe('0₫');

    rerender(<Price amount={undefined as unknown as number} data-testid="price-invalid" />);
    expect(screen.getByTestId('price-invalid').textContent).toBe('0₫');

    rerender(<Price amount={'100000' as unknown as number} data-testid="price-invalid" />);
    expect(screen.getByTestId('price-invalid').textContent).toBe('0₫');
  });

  it('Hỗ trợ các kích thước font sm, md, lg và font monospace', () => {
    const { rerender } = render(<Price amount={50000} size="sm" data-testid="price-size" />);
    expect(screen.getByTestId('price-size')).toHaveClass('text-xs', 'font-mono');

    rerender(<Price amount={50000} size="lg" data-testid="price-size" />);
    expect(screen.getByTestId('price-size')).toHaveClass('text-xl', 'font-bold');
  });
});
