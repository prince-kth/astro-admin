'use client';

import * as React from "react";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  BarChart3,
  Users,
  Star,
  Key,
  Search,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { DialogTitle } from "@/components/ui/dialog";

interface Route {
  title: string;
  icon: React.ReactNode;
  path: string;
  shortcut?: string;
  group: 'pages' | 'settings' | 'other';
}

const routes: Route[] = [
  {
    title: "Dashboard",
    icon: <BarChart3 className="mr-2 h-4 w-4" />,
    path: "/dashboard",
    shortcut: "⌘D",
    group: 'pages'
  },
  {
    title: "Kundli Generation",
    icon: <Star className="mr-2 h-4 w-4" />,
    path: "/kundli",
    shortcut: "⌘K",
    group: 'pages'
  },
  {
    title: "Users",
    icon: <Users className="mr-2 h-4 w-4" />,
    path: "/users",
    shortcut: "⌘U",
    group: 'pages'
  },
  {
    title: "API Management",
    icon: <Key className="mr-2 h-4 w-4" />,
    path: "/api",
    shortcut: "⌘A",
    group: 'pages'
  },
  {
    title: "Settings",
    icon: <Settings className="mr-2 h-4 w-4" />,
    path: "/settings",
    shortcut: "⌘S",
    group: 'settings'
  },
  {
    title: "Profile",
    icon: <User className="mr-2 h-4 w-4" />,
    path: "/profile",
    group: 'settings'
  },
];

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative w-full max-w-sm"
      >
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            className="h-9 w-full rounded-md border border-input bg-muted/50 px-8 text-sm text-muted-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Search or jump to... (Press ⌘K)"
            readOnly
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <kbd className="hidden rounded bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-block">
              ⌘K
            </kbd>
          </div>
        </div>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Search commands</DialogTitle>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {routes.filter(route => route.group === 'pages').map((route) => (
              <CommandItem
                key={route.path}
                onSelect={() => runCommand(() => router.push(route.path))}
              >
                {route.icon}
                <span>{route.title}</span>
                {route.shortcut && <CommandShortcut>{route.shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            {routes.filter(route => route.group === 'settings').map((route) => (
              <CommandItem
                key={route.path}
                onSelect={() => runCommand(() => router.push(route.path))}
              >
                {route.icon}
                <span>{route.title}</span>
                {route.shortcut && <CommandShortcut>{route.shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
