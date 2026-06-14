import Link from "next/link";

import { cn } from "@/lib/utils";

const variantClasses = {
  green: "bg-mist text-forest",
  amber: "bg-amber-bg text-amber",
  slate: "bg-stone-light/40 text-slate",
};

type TagBadgeProps = {
  tag: string;
  href?: string;
  variant?: keyof typeof variantClasses;
  className?: string;
  title?: string;
  children?: React.ReactNode;
};

export function TagBadge({ tag, href, variant, className, title, children }: TagBadgeProps) {
  const resolvedVariant =
    variant ?? (tag.toLowerCase() === "urgent" ? "amber" : "green");
  const classes = cn(
    "inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-medium",
    variantClasses[resolvedVariant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} title={title}>
        {tag}
        {children}
      </Link>
    );
  }
  return (
    <span className={classes} title={title}>
      {tag}
      {children}
    </span>
  );
}
