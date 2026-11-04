import type { Meta, StoryObj } from '@storybook/react-vite';
import { KeyRound, Layers } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';
import { Button } from '../Button/Button';
import { CommandSearch, useCommandSearchShortcut, type CommandSearchGroup } from './CommandSearch';

const all: CommandSearchGroup[] = [
  {
    group: 'Services',
    items: [
      { id: 'svc_a', label: 'App A', description: 'Live · Card payments', icon: Layers },
      { id: 'svc_b', label: 'Service B', description: 'Sandbox · Card payments', icon: Layers },
    ],
  },
  {
    group: 'API keys',
    items: [{ id: 'key_prod', label: 'Production server', description: 'sk_live_…a9Q', icon: KeyRound }],
  },
];

const onSelect = fn();

function Demo() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const openSearch = useCallback(() => setOpen(true), []);
  useCommandSearchShortcut(openSearch);
  const results = useMemo(
    () =>
      all.map((g) => ({
        ...g,
        items: g.items.filter((i) => `${i.label} ${i.description}`.toLowerCase().includes(query.toLowerCase())),
      })),
    [query],
  );
  return (
    <>
      <Button variant="secondary" onClick={openSearch}>
        Search (⌘K)
      </Button>
      <CommandSearch
        open={open}
        onClose={() => {
          setOpen(false);
          setQuery('');
        }}
        query={query}
        onQueryChange={setQuery}
        results={results}
        onSelect={onSelect}
      />
    </>
  );
}

const meta = {
  title: 'Overlays/CommandSearch',
  component: CommandSearch,
  render: () => <Demo />,
  args: { open: false, onClose: () => {}, query: '', onQueryChange: () => {}, results: [], onSelect: () => {} },
} satisfies Meta<typeof CommandSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Search (⌘K)' });
    trigger.focus();
    await userEvent.keyboard('{Control>}k{/Control}');
    const input = await screen.findByRole('searchbox', { name: 'Search workspace' });
    await waitFor(() => expect(input).toHaveFocus());
    await userEvent.type(input, 'service');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(onSelect).toHaveBeenCalledWith('svc_b');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  },
};

export const NoResults: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button'));
    const input = await screen.findByRole('searchbox');
    await userEvent.type(input, 'zzz');
    await expect(await screen.findByText('No results for “zzz”')).toBeInTheDocument();
  },
};
