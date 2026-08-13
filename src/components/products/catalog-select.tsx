'use client';

import { faCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type KeyboardEvent, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

export type CatalogSelectOption = {
  value: string;
  label: string;
  meta?: string;
};

type CatalogSelectProps = {
  label: string;
  ariaLabel?: string;
  value: string;
  defaultValue: string;
  options: CatalogSelectOption[];
  align?: 'left' | 'right';
  disabled?: boolean;
  onValueChange: (value: string) => void;
};

export function CatalogSelect({
  label,
  ariaLabel,
  value,
  defaultValue,
  options,
  align = 'left',
  disabled = false,
  onValueChange,
}: CatalogSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pendingFocusIndexRef = useRef(0);
  const menuId = useId();
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const selectedOption = options[selectedIndex] ?? options[0];
  const isActive = value !== defaultValue;
  const controlLabel = ariaLabel ?? label;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;

    const index = (pendingFocusIndexRef.current + options.length) % options.length;
    optionRefs.current[index]?.focus();
  }, [open, options.length]);

  function focusOption(index: number) {
    const normalizedIndex = (index + options.length) % options.length;
    optionRefs.current[normalizedIndex]?.focus();
  }

  function openMenu(focusIndex = selectedIndex) {
    if (disabled) return;
    pendingFocusIndexRef.current = focusIndex;
    setOpen(true);
  }

  function closeMenu(returnFocus = false) {
    setOpen(false);
    if (returnFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openMenu(Math.min(selectedIndex + 1, options.length - 1));
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu(Math.max(selectedIndex - 1, 0));
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = optionRefs.current.findIndex(
      (option) => option === document.activeElement
    );

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusOption(currentIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusOption(currentIndex - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusOption(options.length - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
    }
  }

  return (
    <div
      ref={rootRef}
      className={`relative grid min-w-0 gap-1.5 ${open ? 'z-30' : 'z-0'}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <span className='pl-1 text-[10px] font-semibold tracking-[0.14em] text-muted uppercase'>
        {label}
      </span>
      <button
        ref={triggerRef}
        type='button'
        aria-label={`${controlLabel}: ${selectedOption?.label ?? 'Select'}`}
        aria-haspopup='menu'
        aria-expanded={open}
        aria-controls={menuId}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        className={`group flex h-13 w-full min-w-0 items-center justify-between gap-3 rounded-full border px-4 text-left text-sm font-semibold transition-[border-color,background-color,color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-60 ${
          open
            ? 'border-ink bg-white shadow-[0_7px_22px_rgba(25,26,23,0.09)]'
            : isActive
              ? 'border-accent/35 bg-accent-soft/65 text-accent hover:border-accent'
              : 'border-line bg-white text-ink hover:border-ink/60 hover:bg-white/80'
        }`}
      >
        <span className='flex min-w-0 items-center gap-2.5'>
          {isActive ? <span className='size-1.5 shrink-0 rounded-full bg-accent' /> : null}
          <span className='truncate'>{selectedOption?.label}</span>
        </span>
        <span
          className={`flex size-7 shrink-0 items-center justify-center rounded-full transition duration-200 ${
            open
              ? 'rotate-180 bg-ink text-white'
              : isActive
                ? 'bg-white/70 text-accent'
                : 'bg-surface text-muted group-hover:text-ink'
          }`}
        >
          <FontAwesomeIcon
            icon={faChevronDown}
            className='size-2.5'
          />
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          role='menu'
          aria-label={`${controlLabel} options`}
          onKeyDown={handleMenuKeyDown}
          className={`catalog-select-menu absolute top-[calc(100%+0.55rem)] z-40 w-full min-w-[min(18rem,calc(100vw-2.5rem))] overflow-hidden rounded-3xl border border-line bg-[#fffdf9] p-2 shadow-[0_24px_60px_rgba(25,26,23,0.16),0_4px_14px_rgba(25,26,23,0.08)] ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className='flex items-center justify-between gap-3 px-3 pt-1.5 pb-2'>
            <p className='text-[10px] font-bold tracking-[0.14em] text-ink uppercase'>
              Choose {label.toLocaleLowerCase()}
            </p>
            <p className='text-[10px] text-muted tabular-nums'>{options.length} options</p>
          </div>
          <div className='max-h-72 space-y-0.5 overflow-y-auto overscroll-contain rounded-2xl'>
            {options.map((option, index) => {
              const selected = option.value === value;

              return (
                <button
                  key={option.value}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  type='button'
                  role='menuitemradio'
                  aria-checked={selected}
                  data-value={option.value}
                  tabIndex={index === selectedIndex ? 0 : -1}
                  onClick={() => {
                    if (!selected) onValueChange(option.value);
                    closeMenu(true);
                  }}
                  className={`group/option flex min-h-11 w-full items-center justify-between gap-4 rounded-2xl px-3 py-2 text-left text-sm transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink ${
                    selected
                      ? 'bg-ink font-semibold text-white'
                      : 'text-ink hover:bg-surface focus-visible:bg-surface'
                  }`}
                >
                  <span className='flex min-w-0 items-center gap-3'>
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition ${
                        selected
                          ? 'border-white/20 bg-white text-ink'
                          : 'border-line bg-white text-transparent group-hover/option:border-ink/30'
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faCheck}
                        className='size-2.5'
                      />
                    </span>
                    <span className='truncate'>{option.label}</span>
                  </span>
                  {option.meta ? (
                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold tabular-nums ${
                        selected
                          ? 'bg-white/12 text-white/75'
                          : 'bg-surface text-muted group-hover/option:bg-white'
                      }`}
                    >
                      {option.meta}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
