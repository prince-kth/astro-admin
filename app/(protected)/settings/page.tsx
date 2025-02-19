'use client';

import { useThemeStore, type AccentColor } from "@/lib/theme-store";
import { cn } from "@/lib/utils";

const colors: Array<{
  value: AccentColor;
  label: string;
  className: string;
  gradientFrom: string;
  gradientTo: string;
}> = [
  {
    value: 'blue',
    label: 'Blue',
    className: 'bg-gradient-to-br from-blue-400 to-blue-600',
    gradientFrom: 'from-blue-50',
    gradientTo: 'to-blue-600',
  },
  {
    value: 'green',
    label: 'Green',
    className: 'bg-gradient-to-br from-green-400 to-green-600',
    gradientFrom: 'from-green-50',
    gradientTo: 'to-green-600',
  },
  {
    value: 'purple',
    label: 'Purple',
    className: 'bg-gradient-to-br from-purple-400 to-purple-600',
    gradientFrom: 'from-purple-50',
    gradientTo: 'to-purple-600',
  },
  {
    value: 'rose',
    label: 'Rose',
    className: 'bg-gradient-to-br from-rose-400 to-rose-600',
    gradientFrom: 'from-rose-50',
    gradientTo: 'to-rose-600',
  },
  {
    value: 'amber',
    label: 'Amber',
    className: 'bg-gradient-to-br from-amber-400 to-amber-600',
    gradientFrom: 'from-amber-50',
    gradientTo: 'to-amber-600',
  },
  {
    value: 'teal',
    label: 'Teal',
    className: 'bg-gradient-to-br from-teal-400 to-teal-600',
    gradientFrom: 'from-teal-50',
    gradientTo: 'to-teal-600',
  }
];

export default function SettingsPage() {
  const { accentColor, setAccentColor } = useThemeStore();

  return (
    <div className="container max-w-screen-lg mx-auto py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Settings</h1>

      <div className="grid gap-8">
        <div className="flex items-center gap-8">
          <div className="w-48 shrink-0">
            <h2 className="text-sm font-medium text-slate-900">General</h2>
            <p className="text-sm text-slate-500">Configure general settings</p>
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-900 block mb-2">
                Application Name
              </label>
              <input
                type="text"
                value="Astrophi Admin"
                readOnly
                className="w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-200" />

        <div className="flex items-start gap-8">
          <div className="w-48 shrink-0">
            <h2 className="text-sm font-medium text-slate-900">Appearance</h2>
            <p className="text-sm text-slate-500">Customize the interface</p>
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-900 block mb-2">
                Theme Color
              </label>
              <div className="grid grid-cols-6 gap-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setAccentColor(color.value)}
                    className={cn(
                      "group relative w-full aspect-square rounded-xl ring-offset-2 transition-all duration-200 hover:scale-105",
                      color.className,
                      accentColor === color.value && "ring-2 ring-blue-600"
                    )}
                    title={color.label}
                  >
                    <div className={cn(
                      "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                      "bg-gradient-to-br",
                      color.gradientFrom,
                      color.gradientTo,
                      "blur"
                    )} />
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Choose your preferred accent color for the interface
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
