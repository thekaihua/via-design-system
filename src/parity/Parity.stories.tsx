/**
 * Static states for the parity check against the design: the same content as the masters, with no
 * interaction tests, so a screenshot shows exactly what the master shows.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContactFlow, SessionWarning } from '../patterns/tasks';

const meta = { title: 'Setup/Parity fixtures', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const ContactForm: Story = { render: () => <ContactFlow /> };
export const ReviewDetails: Story = {
  render: () => (
    <ContactFlow initialStep="review" initialValues={{ name: 'Alex Tan', email: 'alex@example.com', country: 'SG', message: 'We need card payments in Singapore.' }} />
  ),
};
export const SessionWarningOpen: Story = { render: () => <SessionWarning seconds={60} /> };
