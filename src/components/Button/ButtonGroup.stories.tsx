import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { ButtonGroup } from './ButtonGroup';

const meta = {
  title: 'Actions/ButtonGroup',
  component: ButtonGroup,
  args: {
    children: (
      <>
        <Button variant="secondary">Cancel</Button>
        <Button variant="destructive">Revoke key</Button>
      </>
    ),
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const End: Story = {};
export const Start: Story = { args: { align: 'start' } };
