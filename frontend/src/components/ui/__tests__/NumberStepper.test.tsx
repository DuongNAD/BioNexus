import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberStepper } from '../NumberStepper';

describe('NumberStepper Component', () => {
  it('renders with initial value and buttons', () => {
    const onChange = vi.fn();
    render(<NumberStepper value={3} min={1} max={10} onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: 'Số lượng' });
    expect(input).toHaveValue('3');

    const minusBtn = screen.getByRole('button', { name: 'Giảm số lượng' });
    const plusBtn = screen.getByRole('button', { name: 'Tăng số lượng' });

    expect(minusBtn).not.toBeDisabled();
    expect(plusBtn).not.toBeDisabled();
  });

  it('disables minus button when value <= min', () => {
    const onChange = vi.fn();
    render(<NumberStepper value={1} min={1} max={10} onChange={onChange} />);

    const minusBtn = screen.getByRole('button', { name: 'Giảm số lượng' });
    expect(minusBtn).toBeDisabled();

    fireEvent.click(minusBtn);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables plus button when value >= max', () => {
    const onChange = vi.fn();
    render(<NumberStepper value={10} min={1} max={10} onChange={onChange} />);

    const plusBtn = screen.getByRole('button', { name: 'Tăng số lượng' });
    expect(plusBtn).toBeDisabled();

    fireEvent.click(plusBtn);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('increments value within bounds', () => {
    const onChange = vi.fn();
    render(<NumberStepper value={3} min={1} max={5} onChange={onChange} />);

    const plusBtn = screen.getByRole('button', { name: 'Tăng số lượng' });
    fireEvent.click(plusBtn);

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('decrements value within bounds', () => {
    const onChange = vi.fn();
    render(<NumberStepper value={3} min={1} max={5} onChange={onChange} />);

    const minusBtn = screen.getByRole('button', { name: 'Giảm số lượng' });
    fireEvent.click(minusBtn);

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('handles input manual change and clamps to bounds', () => {
    const onChange = vi.fn();
    render(<NumberStepper value={3} min={1} max={5} onChange={onChange} />);

    const input = screen.getByRole('textbox', { name: 'Số lượng' });
    fireEvent.change(input, { target: { value: '8' } });

    expect(onChange).toHaveBeenCalledWith(5);
  });
});
