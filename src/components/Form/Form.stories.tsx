import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Button } from '../Button/Button';
import { CurrencyField } from '../CurrencyField/CurrencyField';
import { Select } from '../Select/Select';
import { TextField } from '../TextField/TextField';
import { ErrorSummary, FieldGroup, FormActions, FormRow, FormSection, type ErrorSummaryItem } from './Form';

function CompanyForm() {
  const [values, setValues] = useState({ name: '', email: '', city: '', postcode: '' });
  const [errors, setErrors] = useState<ErrorSummaryItem[]>([]);
  const errorFor = (id: string) => errors.find((e) => e.fieldId === id)?.message;
  const set = (k: keyof typeof values) => (v: string) => setValues((s) => ({ ...s, [k]: v }));

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const next: ErrorSummaryItem[] = [];
        if (!values.name.trim()) next.push({ fieldId: 'company-name', message: 'Enter your company name.' });
        if (!/^\S+@\S+\.\S+$/.test(values.email)) next.push({ fieldId: 'work-email', message: 'Enter an email address like name@company.com.' });
        setErrors(next);
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 1000 }}
    >
      <ErrorSummary errors={errors} />
      <FormSection title="Company details" description="Use your registered company details.">
        <TextField id="company-name" label="Company name" value={values.name} onChange={set('name')} error={errorFor('company-name')} autoComplete="organization" />
        <TextField id="work-email" label="Work email" type="email" value={values.email} onChange={set('email')} error={errorFor('work-email')} autoComplete="email" />
        <FormRow>
          <TextField label="City" value={values.city} onChange={set('city')} autoComplete="address-level2" />
          <TextField label="Postcode" value={values.postcode} onChange={set('postcode')} autoComplete="postal-code" />
        </FormRow>
      </FormSection>
      <FieldGroup legend="Settlement window" description="Payouts are sent once both values are met.">
        <CurrencyField label="Minimum payout" defaultValue={100} />
        <Select
          label="Schedule"
          defaultValue="weekly"
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly, Monday' },
            { value: 'monthly', label: 'Monthly' },
          ]}
        />
      </FieldGroup>
      <FormActions>
        <Button variant="secondary" size="lg">
          Cancel
        </Button>
        <Button type="submit" size="lg">
          Continue
        </Button>
      </FormActions>
    </form>
  );
}

const meta = {
  title: 'Forms/Form layout',
  component: FormSection,
  render: () => <CompanyForm />,
  args: { title: 'Company details', children: null },
} satisfies Meta<typeof FormSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SubmitWithErrors: Story = {
  name: 'Submit with errors',
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }));
    const summary = await canvas.findByRole('alert', { name: 'There are 2 problems' });
    // Focus moves to the summary after a failed submit.
    await waitFor(() => expect(summary).toHaveFocus());
    // Each item links to its field.
    await userEvent.click(canvas.getByRole('link', { name: 'Enter your company name.' }));
    await expect(canvas.getByRole('textbox', { name: 'Company name' })).toHaveFocus();
    await expect(canvas.getByRole('group', { name: 'Settlement window' })).toBeInTheDocument();
  },
};
