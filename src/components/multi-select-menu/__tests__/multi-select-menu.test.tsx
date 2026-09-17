import { renderWithProviders } from '@/test/utils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { expect, it, vi } from 'vitest';
import { MultiSelectMenu } from '../multi-select-menu';

it('toggles selected options', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  const { Wrapper } = renderWithProviders(<></>);

  const TestHarness = () => {
    const [selected, setSelected] = React.useState<string[]>([]);
    return (
      <MultiSelectMenu
        title="Columns"
        choices={[
          { value: 'trace', label: 'Trace' },
          { value: 'span', label: 'Span' },
          { value: 'service', label: 'Service' },
        ]}
        value={selected}
        onChange={(next) => {
          setSelected(next);
          onChange(next);
        }}
      />
    );
  };

  render(<TestHarness />, { wrapper: Wrapper });

  await user.click(screen.getByRole('button', { name: 'Columns' }));
  await user.click(screen.getByLabelText('Trace'));
  await user.click(screen.getByLabelText('Service'));

  expect(screen.getByLabelText('Trace')).toBeChecked();
  expect(screen.getByLabelText('Service')).toBeChecked();
  expect(screen.getByLabelText('Span')).not.toBeChecked();
  expect(onChange).toHaveBeenCalledWith(['trace']);
  expect(onChange).toHaveBeenCalledWith(['trace', 'service']);
});

it('filters choices when searchable', async () => {
  const user = userEvent.setup();
  const { Wrapper } = renderWithProviders(<></>);

  render(
    <MultiSelectMenu
      title="Columns"
      choices={[
        { value: 'trace', label: 'Trace' },
        { value: 'service', label: 'Service' },
      ]}
      value={[]}
      onChange={vi.fn()}
      searchable
    />,
    { wrapper: Wrapper },
  );

  await user.click(screen.getByRole('button', { name: 'Columns' }));
  await user.type(screen.getByRole('textbox', { name: 'Search choices' }), 'serv');

  expect(screen.queryByLabelText('Service')).toBeInTheDocument();
  expect(screen.queryByLabelText('Trace')).not.toBeInTheDocument();
});
