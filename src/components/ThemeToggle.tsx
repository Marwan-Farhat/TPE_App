import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <Sun className="h-4 w-4 text-muted-foreground" />
        <Switch disabled className="data-[state=unchecked]:bg-muted" />
        <Moon className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center gap-2">
      <motion.div
        animate={{ 
          scale: isDark ? 0.9 : 1,
          opacity: isDark ? 0.5 : 1 
        }}
        transition={{ duration: 0.2 }}
      >
        <Sun className="h-4 w-4 text-warning" />
      </motion.div>
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
      />
      <motion.div
        animate={{ 
          scale: isDark ? 1 : 0.9,
          opacity: isDark ? 1 : 0.5 
        }}
        transition={{ duration: 0.2 }}
      >
        <Moon className="h-4 w-4 text-primary" />
      </motion.div>
    </div>
  );
}

export function ThemeToggleCompact() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-muted">
        <Sun className="h-4 w-4 text-muted-foreground" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-primary" />
        ) : (
          <Sun className="h-4 w-4 text-warning" />
        )}
      </motion.div>
    </motion.button>
  );
}