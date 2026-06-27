import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Banner } from './Banner';

describe('Banner', () => {
  it('renders children with role="status"', () => {
    render(<Banner>Flight sale ends tonight</Banner>);
    expect(screen.getByRole('status')).toHaveTextContent('Flight sale ends tonight');
  });

  it('renders without dismiss button when onDismiss is not provided', () => {
    render(<Banner>Info message</Banner>);
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
  });

  it('renders dismiss button when onDismiss is provided', () => {
    render(<Banner onDismiss={vi.fn()}>Dismissable</Banner>);
    expect(screen.getByRole('button', { name: /dismiss banner/i })).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Banner onDismiss={onDismiss}>Dismissable</Banner>);
    await user.click(screen.getByRole('button', { name: /dismiss banner/i }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('renders with default info variant', () => {
    const { container } = render(<Banner>Info</Banner>);
    expect(container.firstChild).toHaveClass('bg-blue-50');
  });

  it('renders warning variant styles', () => {
    const { container } = render(<Banner variant="warning">Warning</Banner>);
    expect(container.firstChild).toHaveClass('bg-amber-50');
  });

  it('renders success variant styles', () => {
    const { container } = render(<Banner variant="success">Done</Banner>);
    expect(container.firstChild).toHaveClass('bg-green-50');
  });

  it('renders promo variant styles', () => {
    const { container } = render(<Banner variant="promo">Promo</Banner>);
    expect(container.firstChild).toHaveClass('bg-gradient-to-r');
  });
});
