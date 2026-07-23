/**
 * Stable Input Components
 * 
 * These memoized input components manage their own local state to prevent
 * parent re-renders (from Framer Motion, state updates, etc.) from stealing
 * focus and causing the mobile keyboard to disappear.
 * 
 * Usage: Replace all <input>, <textarea>, and <select> elements in forms
 * with these stable equivalents.
 */
import React, { useState, useCallback } from 'react';

interface StableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void;
}

export const StableInput = React.memo(function StableInput({
  value: controlledValue,
  onChange,
  onValueChange,
  onBlur,
  className = '',
  ...props
}: StableInputProps) {
  const [localValue, setLocalValue] = useState(() => controlledValue ?? '');

  // Sync with controlled value when it changes from outside (initial load, reset)
  React.useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== localValue) {
      setLocalValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    onChange?.(e);
    onValueChange?.(e.target.value);
  }, [onChange, onValueChange]);

  return (
    <input
      {...props}
      value={localValue}
      onChange={handleChange}
      onBlur={onBlur}
      className={className}
    />
  );
});

interface StableTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onValueChange?: (value: string) => void;
}

export const StableTextarea = React.memo(function StableTextarea({
  value: controlledValue,
  onChange,
  onValueChange,
  onBlur,
  className = '',
  ...props
}: StableTextareaProps) {
  const [localValue, setLocalValue] = useState(() => controlledValue ?? '');

  React.useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== localValue) {
      setLocalValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
    onChange?.(e);
    onValueChange?.(e.target.value);
  }, [onChange, onValueChange]);

  return (
    <textarea
      {...props}
      value={localValue}
      onChange={handleChange}
      onBlur={onBlur}
      className={className}
    />
  );
});

interface StableSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void;
}

export const StableSelect = React.memo(function StableSelect({
  value: controlledValue,
  onChange,
  onValueChange,
  onBlur,
  children,
  className = '',
  ...props
}: StableSelectProps) {
  const [localValue, setLocalValue] = useState(() => controlledValue ?? '');

  React.useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== localValue) {
      setLocalValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalValue(e.target.value);
    onChange?.(e);
    onValueChange?.(e.target.value);
  }, [onChange, onValueChange]);

  return (
    <select
      {...props}
      value={localValue}
      onChange={handleChange}
      onBlur={onBlur}
      className={className}
    >
      {children}
    </select>
  );
});
