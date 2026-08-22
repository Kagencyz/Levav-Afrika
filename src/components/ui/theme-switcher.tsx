import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const OPTIONS = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
] as const;

export function ThemeSwitcher() {
  const { theme = 'system', setTheme } = useTheme();

  return (
    <fieldset className="m-0 flex h-8 rounded-full border border-border bg-background/70 p-0" data-testid="theme-switcher">
      <legend className="sr-only">Select a display theme</legend>
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = theme === value;
        return (
          <div key={value} className="-mt-px first:-ml-px last:-mr-px">
            <input
              aria-label={label}
              id={`theme-switch-${value}`}
              type="radio"
              name="display-theme"
              value={value}
              checked={selected}
              onChange={() => setTheme(value)}
              className="peer sr-only"
            />
            <label
              htmlFor={`theme-switch-${value}`}
              title={label}
              className={`group flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition-colors duration-150 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#C6FF34] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background ${
                selected
                  ? 'border-border bg-muted text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="sr-only">{label}</span>
              <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
            </label>
          </div>
        );
      })}
    </fieldset>
  );
}
