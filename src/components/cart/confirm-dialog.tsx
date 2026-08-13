'use client';

import { useEffect, useRef } from 'react';

import type { CartProduct } from '@/types/product';

type ConfirmDialogProps = {
  eyebrow: string;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  eyebrow,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
      aria-labelledby='confirm-dialog-title'
      className='confirm-dialog m-auto w-[calc(100vw-2.5rem)] max-w-md rounded-3xl bg-white text-left shadow-2xl backdrop:bg-ink/40'
    >
      <div className='p-7 sm:p-8'>
        <p className='text-xs font-semibold tracking-[0.18em] text-muted uppercase'>{eyebrow}</p>
        <h2
          id='confirm-dialog-title'
          className='mt-3 text-2xl font-semibold tracking-[-0.03em] text-balance text-ink'
        >
          {title}
        </h2>
        <p className='mt-3 text-sm leading-6 text-muted'>{description}</p>
        <div className='mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
          <button
            type='button'
            onClick={onCancel}
            className='inline-flex h-11 items-center justify-center rounded-full border border-line bg-white px-6 text-xs font-semibold tracking-[0.12em] text-ink uppercase transition hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
          >
            {cancelLabel}
          </button>
          <button
            type='button'
            onClick={onConfirm}
            className='inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-xs font-semibold tracking-[0.12em] text-white uppercase transition hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}

type ConfirmRemoveDialogProps = {
  item: CartProduct;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmRemoveDialog({ item, onConfirm, onCancel }: ConfirmRemoveDialogProps) {
  return (
    <ConfirmDialog
      eyebrow='Remove item'
      title={`Remove “${item.title}” from your cart?`}
      description='This takes the quantity to zero and removes the piece from your selection.'
      confirmLabel='Remove'
      cancelLabel='Keep it'
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
