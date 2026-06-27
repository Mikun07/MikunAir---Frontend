import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

function renderPagination(props: Partial<Parameters<typeof Pagination>[0]> = {}) {
  const defaults = { currentPage: 1, totalPages: 5, onPageChange: vi.fn() };
  return { onPageChange: defaults.onPageChange, ...render(<Pagination {...defaults} {...props} />) };
}

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const { container } = renderPagination({ totalPages: 1 });
    expect(container.firstChild).toBeNull();
  });

  it('renders nav with previous, page buttons, and next', () => {
    renderPagination();
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^page \d+$/i })).toHaveLength(5);
  });

  it('marks current page with aria-current="page"', () => {
    renderPagination({ currentPage: 3 });
    expect(screen.getByRole('button', { name: /page 3/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /page 1/i })).not.toHaveAttribute('aria-current');
  });

  it('disables previous button on first page', () => {
    renderPagination({ currentPage: 1 });
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
  });

  it('disables next button on last page', () => {
    renderPagination({ currentPage: 5, totalPages: 5 });
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
  });

  it('calls onPageChange with currentPage - 1 when previous is clicked', async () => {
    const user = userEvent.setup();
    const { onPageChange } = renderPagination({ currentPage: 3 });
    await user.click(screen.getByRole('button', { name: /previous page/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with currentPage + 1 when next is clicked', async () => {
    const user = userEvent.setup();
    const { onPageChange } = renderPagination({ currentPage: 3 });
    await user.click(screen.getByRole('button', { name: /next page/i }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('calls onPageChange with the clicked page number', async () => {
    const user = userEvent.setup();
    const { onPageChange } = renderPagination({ currentPage: 1 });
    await user.click(screen.getByRole('button', { name: /page 4/i }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });
});
