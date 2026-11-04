import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, type BadgeTone } from './Badge';

const meta = {
  title: 'Status/Badge',
  component: Badge,
  args: { children: 'Draft' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};

const examples: [BadgeTone, string][] = [
  ['neutral', 'Draft'],
  ['info', 'In review'],
  ['positive', 'Live'],
  ['warning', 'Expiring'],
  ['negative', 'Failed'],
  ['urgent', 'Action required'],
];

export const AllTones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {examples.map(([tone, label]) => (
        <Badge key={tone} tone={tone}>
          {label}
        </Badge>
      ))}
    </div>
  ),
};

export const WithoutIcon: Story = { args: { tone: 'positive', icon: false, children: 'Live' } };
