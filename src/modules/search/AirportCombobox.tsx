import type { KeyboardEvent } from 'react';
import { useRef, useState, useId } from 'react';
import { useDebounce, useClickOutside } from '@shared/hooks';
import type { AirportOption } from './airports';
import { searchAirports } from './airports';

interface AirportComboboxProps {
  label: string;
  value: string;
  onChange: (iataCode: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

export function AirportCombobox({
  label,
  value,
  onChange,
  error,
  placeholder = 'City or airport',
  required,
}: AirportComboboxProps) {
  const id = useId();
  const inputId = `airport-${id}`;
  const listboxId = `airport-list-${id}`;
  const errorId = `airport-error-${id}`;

  const [inputValue, setInputValue] = useState(() => {
    return value || '';
  });
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQuery = useDebounce(inputValue, 150);
  const suggestions = searchAirports(debouncedQuery);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useClickOutside(containerRef, () => {
    setIsOpen(false);
    setActiveIndex(-1);
    if (!value) setInputValue('');
  });

  function handleInputChange(raw: string) {
    setInputValue(raw);
    setIsOpen(true);
    setActiveIndex(-1);
    if (raw === '') onChange('');
  }

  function selectOption(airport: AirportOption) {
    onChange(airport.iataCode);
    setInputValue(`${airport.city} (${airport.iataCode})`);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        selectOption(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  const activeOptionId =
    activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-white/70">
        {label}
        {required && (
          <span className="text-red-400 ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/30">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          ref={inputRef}
          id={inputId}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && suggestions.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-required={required}
          type="text"
          value={inputValue}
          placeholder={placeholder}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { if (inputValue) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
          className={`
            w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-white/5 text-white
            placeholder:text-white/25
            focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-sky-400
            transition-colors
            ${error ? 'border-red-400/60 bg-red-500/10' : 'border-white/10 hover:border-white/20'}
          `}
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
        >
          {suggestions.map((airport, i) => (
            <li
              key={airport.iataCode}
              id={`${listboxId}-option-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(airport);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`
                flex items-center gap-3 px-4 py-3 cursor-pointer text-sm transition-colors
                ${i === activeIndex ? 'bg-sky-500/20 text-sky-300' : 'text-white/70 hover:bg-white/5 hover:text-white'}
                ${i < suggestions.length - 1 ? 'border-b border-white/5' : ''}
              `}
            >
              <span className="w-10 shrink-0 font-mono font-bold text-base text-sky-400">
                {airport.iataCode}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-medium text-white">{airport.city}</span>
                <span className="text-xs text-white/40">{airport.name} · {airport.country}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
