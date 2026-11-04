import { CircleAlert, CircleCheck, FileText, Upload, X } from 'lucide-react';
import { useId, useState } from 'react';
import {
  Button as AriaButton,
  DropZone,
  FileTrigger,
  ProgressBar,
  type DropItem,
  type FileDropItem,
} from 'react-aria-components';
import { cx } from '../../utils/cx';
import { Button } from '../Button/Button';
import styles from './FileUpload.module.css';

export interface UploadedFile {
  id: string;
  name: string;
  /** Bytes. */
  size: number;
  status: 'uploading' | 'done' | 'error';
  /** 0–100 while uploading. */
  progress?: number;
  error?: string;
}

export interface FileRejection {
  file: File;
  reason: string;
}

export interface FileUploadProps {
  label: string;
  description?: string;
  /** Comma-separated MIME types or extensions, e.g. "application/pdf,image/jpeg,image/png". */
  accept: string;
  /** Maximum size per file in bytes. */
  maxSize: number;
  multiple?: boolean;
  /** Maximum number of files in total. */
  maxFiles?: number;
  files: UploadedFile[];
  /** Files that passed the type and size checks. */
  onFiles: (files: File[]) => void;
  onReject?: (rejections: FileRejection[]) => void;
  onRemove?: (id: string) => void;
  /** Field-level error, e.g. "Upload at least one document." */
  error?: string;
  disabled?: boolean;
  className?: string;
}

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** Human list of accepted types: "PDF, JPG or PNG". */
function describeAccept(accept: string) {
  const names = accept
    .split(',')
    .map((t) => t.trim())
    .map((t) => (t.startsWith('.') ? t.slice(1) : (t.split('/')[1] ?? t)).replace('jpeg', 'jpg').toUpperCase());
  const unique = [...new Set(names)];
  return unique.length > 1 ? `${unique.slice(0, -1).join(', ')} or ${unique.at(-1)}` : unique[0];
}

function matches(file: File, accept: string) {
  return accept.split(',').some((rule) => {
    const r = rule.trim().toLowerCase();
    if (r.startsWith('.')) return file.name.toLowerCase().endsWith(r);
    if (r.endsWith('/*')) return file.type.startsWith(r.slice(0, -1));
    return file.type === r;
  });
}

/**
 * Upload documents (Field / File upload). The "Choose files" button opens the picker; dropping files on
 * the area is an extra. Type and size are checked here; rejected files get a specific message.
 */
export function FileUpload({
  label,
  description,
  accept,
  maxSize,
  multiple = true,
  maxFiles,
  files,
  onFiles,
  onReject,
  onRemove,
  error,
  disabled,
  className,
}: FileUploadProps) {
  const id = useId();
  const [rejections, setRejections] = useState<FileRejection[]>([]);
  const types = describeAccept(accept);
  const limit = formatSize(maxSize);

  const take = (incoming: File[]) => {
    const room = maxFiles !== undefined ? Math.max(0, maxFiles - files.length) : Infinity;
    const accepted: File[] = [];
    const rejected: FileRejection[] = [];
    for (const file of incoming) {
      if (!matches(file, accept)) rejected.push({ file, reason: `Upload a ${types}.` });
      else if (file.size > maxSize) rejected.push({ file, reason: `This file is larger than ${limit}.` });
      else if (accepted.length >= room) rejected.push({ file, reason: `You can upload up to ${maxFiles} files.` });
      else accepted.push(file);
    }
    setRejections(rejected);
    if (rejected.length) onReject?.(rejected);
    if (accepted.length) onFiles(accepted);
  };

  const fromDrop = async (items: DropItem[]) => {
    const fileItems = items.filter((i): i is FileDropItem => i.kind === 'file');
    take(await Promise.all(fileItems.map((i) => i.getFile())));
  };

  const descId = `${id}-desc`;
  const errId = `${id}-err`;

  return (
    <div className={cx(styles.root, className)} role="group" aria-labelledby={`${id}-label`} aria-describedby={descId}>
      <span id={`${id}-label`} className={styles.label}>
        {label}
      </span>
      <DropZone
        className={cx(styles.zone, error && styles.zoneInvalid)}
        isDisabled={disabled}
        onDrop={(e) => void fromDrop(e.items)}
        aria-label={`Drop files for ${label}`}
      >
        <Upload size={24} className={styles.icon} aria-hidden="true" />
        <span className={styles.instruction}>
          Drag files here or choose them. {types}, up to {limit} each
          {maxFiles ? `, ${maxFiles} files at most` : ''}.
        </span>
        <FileTrigger acceptedFileTypes={accept.split(',').map((t) => t.trim())} allowsMultiple={multiple} onSelect={(list) => list && take([...list])}>
          <Button variant="secondary" size="lg" disabled={disabled}>
            Choose files
          </Button>
        </FileTrigger>
      </DropZone>
      <p id={descId} className={styles.description}>
        {description}
      </p>
      {(error || rejections.length > 0) && (
        <div id={errId} className={styles.errors} role="alert">
          {error && (
            <p className={styles.error}>
              <CircleAlert size={16} aria-hidden="true" />
              {error}
            </p>
          )}
          {rejections.map((r) => (
            <p key={r.file.name} className={styles.error}>
              <CircleAlert size={16} aria-hidden="true" />
              {r.file.name}: {r.reason}
            </p>
          ))}
        </div>
      )}
      {files.length > 0 && (
        <ul className={styles.list} aria-label="Uploaded files">
          {files.map((f) => (
            <li key={f.id} className={cx(styles.file, f.status === 'error' && styles.fileError)}>
              <FileText size={20} className={styles.fileIcon} aria-hidden="true" />
              <span className={styles.fileText}>
                <span className={styles.fileName}>{f.name}</span>
                <span className={styles.fileMeta}>
                  {formatSize(f.size)} ·{' '}
                  {f.status === 'uploading' ? `Uploading ${f.progress ?? 0}%` : f.status === 'done' ? 'Uploaded' : (f.error ?? 'Upload failed')}
                </span>
                {f.status === 'uploading' && (
                  <ProgressBar value={f.progress ?? 0} aria-label={`Uploading ${f.name}`} className={styles.progress}>
                    {({ percentage }) => (
                      <span className={styles.track}>
                        <span className={styles.fill} style={{ width: `${percentage}%` }} />
                      </span>
                    )}
                  </ProgressBar>
                )}
              </span>
              {f.status === 'done' && <CircleCheck size={20} className={styles.doneIcon} aria-hidden="true" />}
              {f.status === 'error' && <CircleAlert size={20} className={styles.errorIcon} aria-hidden="true" />}
              {onRemove && (
                <AriaButton className={styles.remove} aria-label={`Remove ${f.name}`} onPress={() => onRemove(f.id)}>
                  <X size={16} aria-hidden="true" />
                </AriaButton>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
