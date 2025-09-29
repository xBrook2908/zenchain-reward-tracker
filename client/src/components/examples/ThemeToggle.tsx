import ThemeToggle from '../ThemeToggle';

export default function ThemeToggleExample() {
  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-muted-foreground">Theme:</span>
      <ThemeToggle />
    </div>
  );
}