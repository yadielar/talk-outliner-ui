import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

interface NavTabsProps {
  children: React.ReactNode;
  className?: string;
}

export function NavTabs({ children, className }: NavTabsProps) {
  return (
    <nav
      className={cn(
        'inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className,
      )}
    >
      {children}
    </nav>
  );
}

type NavTabsLinkProps = React.ComponentProps<typeof Link>;

export function NavTabsLink({ to, className, ...props }: NavTabsLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&.active]:bg-background [&.active]:text-foreground [&.active]:shadow-sm',
        className,
      )}
      {...props}
    />
  );
}
