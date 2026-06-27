import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from './Tooltip';

function renderTooltip(props: Partial<Parameters<typeof Tooltip>[0]> = {}) {
  const defaults = { content: 'Helpful hint', children: <button>Hover me</button> };
  const result = render(<Tooltip {...defaults} {...props} />);
  const wrapper = result.container.firstElementChild as HTMLElement;
  return { ...result, wrapper };
}

describe('Tooltip', () => {
  it('does not show tooltip initially', () => {
    renderTooltip();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on mouse enter', async () => {
    const user = userEvent.setup();
    const { wrapper } = renderTooltip();
    await user.hover(wrapper);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Helpful hint');
  });

  it('hides tooltip on mouse leave', async () => {
    const user = userEvent.setup();
    const { wrapper } = renderTooltip();
    await user.hover(wrapper);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await user.unhover(wrapper);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus', async () => {
    const user = userEvent.setup();
    renderTooltip();
    await user.tab();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Helpful hint');
  });

  it('hides tooltip on blur', async () => {
    const user = userEvent.setup();
    renderTooltip();
    await user.tab();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await user.tab();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('renders children', () => {
    renderTooltip({ children: <span>Target</span> });
    expect(screen.getByText('Target')).toBeInTheDocument();
  });
});
