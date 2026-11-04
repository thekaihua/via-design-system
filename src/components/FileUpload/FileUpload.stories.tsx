import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent } from 'storybook/test';
import { FileUpload, type UploadedFile } from './FileUpload';

const MB = 1024 * 1024;
const onReject = fn();

function Demo({ initial = [] as UploadedFile[] }) {
  const [files, setFiles] = useState<UploadedFile[]>(initial);
  return (
    <FileUpload
      label="Upload documents"
      description="Upload the documents requested for this review: business registration and a director's ID."
      accept="application/pdf,image/jpeg,image/png"
      maxSize={10 * MB}
      maxFiles={5}
      files={files}
      onFiles={(list) =>
        setFiles((f) => [...f, ...list.map((file, i) => ({ id: `${file.name}-${Date.now()}-${i}`, name: file.name, size: file.size, status: 'done' as const }))])
      }
      onReject={onReject}
      onRemove={(id) => setFiles((f) => f.filter((x) => x.id !== id))}
    />
  );
}

const meta = {
  title: 'Forms/FileUpload',
  component: FileUpload,
  render: () => <Demo />,
  args: { label: 'Upload documents', accept: '', maxSize: 0, files: [], onFiles: () => {} },
  decorators: [(Story) => <div style={{ maxWidth: 720 }}>{Story()}</div>],
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Upload documents' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Choose files' })).toBeInTheDocument();
    await expect(canvas.getByText(/PDF, JPG or PNG, up to 10.0 MB each, 5 files at most/)).toBeInTheDocument();
  },
};

export const WithFiles: Story = {
  render: () => (
    <Demo
      initial={[
        { id: '1', name: 'business-registration.pdf', size: 1.2 * MB, status: 'done' },
        { id: '2', name: 'director-id.jpg', size: 3.4 * MB, status: 'uploading', progress: 45 },
        { id: '3', name: 'bank-statement.pdf', size: 0.8 * MB, status: 'error', error: 'Upload failed. Try again.' },
      ]}
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('progressbar', { name: 'Uploading director-id.jpg' })).toHaveAttribute('aria-valuenow', '45');
    await userEvent.click(canvas.getByRole('button', { name: 'Remove bank-statement.pdf' }));
    await expect(canvas.queryByText('bank-statement.pdf')).not.toBeInTheDocument();
  },
};
