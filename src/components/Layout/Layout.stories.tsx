import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Link } from '../Link/Link';
import { PropertyList } from '../PropertyList/PropertyList';
import { ContentPanel, Divider, SupportingResources } from './Layout';

const meta = {
  title: 'Layout/ContentPanel',
  component: ContentPanel,
  args: {
    title: 'Business details',
    description: 'Shown on receipts and to reviewers.',
    actions: <Link href="#edit">Edit</Link>,
    children: (
      <PropertyList
        items={[
          { label: 'Legal name', value: 'Kopi Labs Pte. Ltd.' },
          { label: 'UEN', value: '201912345K' },
          { label: 'Country', value: 'Singapore' },
        ]}
      />
    ),
  },
} satisfies Meta<typeof ContentPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('region', { name: 'Business details' })).toBeVisible();
  },
};

export const Dividers: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <Divider />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span>Sandbox</span>
        <Divider orientation="vertical" />
        <span>Live</span>
      </div>
    </div>
  ),
};

export const Resources: StoryObj = {
  name: 'Supporting resources',
  render: () => (
    <SupportingResources
      links={[
        { label: 'API documentation', href: '#docs' },
        { label: 'API use cases', href: '#use-cases' },
      ]}
    />
  ),
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'Supporting resources' });
    await expect(nav).toBeVisible();
  },
};
