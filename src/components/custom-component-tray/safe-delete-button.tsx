import { Button, type ButtonProps } from '@mantine/core';
import { type ReactNode, useEffect, useRef, useState } from 'react';

type SafeDeleteButtonProps = {
  onConfirm: () => void | Promise<void>;
  label?: string;
  confirmLabel?: string;
  confirmTimeoutMs?: number;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonProps['variant'];
  leftSection?: ReactNode;
  size?: ButtonProps['size'];
  fullWidth?: boolean;
};

export function SafeDeleteButton({
  onConfirm,
  label = 'Delete',
  confirmLabel = 'Click again to delete',
  confirmTimeoutMs = 4000,
  disabled = false,
  loading = false,
  variant = 'subtle',
  leftSection,
  size = 'xs',
  fullWidth = false,
}: SafeDeleteButtonProps) {
  const [armed, setArmed] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!armed) {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }
    timeoutRef.current = window.setTimeout(() => {
      setArmed(false);
      timeoutRef.current = null;
    }, confirmTimeoutMs);
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [armed, confirmTimeoutMs]);

  return (
    <Button
      variant={armed ? 'filled' : variant}
      color={armed ? 'red' : undefined}
      onClick={() => {
        if (disabled || loading) return;
        if (armed) {
          setArmed(false);
          void onConfirm();
          return;
        }
        setArmed(true);
      }}
      disabled={disabled}
      loading={loading}
      leftSection={leftSection}
      size={size}
      fullWidth={fullWidth}
    >
      {armed ? confirmLabel : label}
    </Button>
  );
}

export default SafeDeleteButton;
