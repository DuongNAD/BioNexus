import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClimateBar } from '../ClimateBar';
import { parseEnvironmentSpecs } from '@/lib/parseEnvironmentSpecs';

describe('ClimateBar Component', () => {
  it('hiển thị nhiệt độ chính xác cho loài sống trên cạn', () => {
    const raw = 'Nhiệt độ: 26-32°C (điểm sưởi 32-34°C), Độ ẩm: 55-65%';
    const specs = parseEnvironmentSpecs(raw);

    render(<ClimateBar specs={specs} />);

    expect(screen.getByText('Nhiệt độ không khí')).toBeInTheDocument();
    expect(screen.getByText('26°C — 32°C')).toBeInTheDocument();
    expect(screen.getByText(/Điểm sưởi/i)).toBeInTheDocument();
    expect(screen.getByText('32°C — 34°C')).toBeInTheDocument();
  });

  it('đổi nhãn thành "Nhiệt độ nước" khi là loài thủy sinh', () => {
    const raw = 'Nhiệt độ nước: 14-18°C, pH: 7.4-7.6';
    const specs = parseEnvironmentSpecs(raw);

    render(<ClimateBar specs={specs} isWaterTemp={true} />);

    expect(screen.getByText('Nhiệt độ nước')).toBeInTheDocument();
    expect(screen.getByText('14°C — 18°C')).toBeInTheDocument();
  });

  it('hiển thị điểm sưởi đơn lẻ an toàn', () => {
    const raw = 'Nhiệt độ: 26-32°C (điểm sưởi 35°C), Độ ẩm: 60-75%';
    const specs = parseEnvironmentSpecs(raw);

    render(<ClimateBar specs={specs} />);

    expect(screen.getByText('35°C')).toBeInTheDocument();
  });
});
