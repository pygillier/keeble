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
};

export function TagBadge({ tag, href, variant, className, title }: TagBadgeProps) {
  const resolvedVariant =
    variant ?? (tag.toLowerCase() === "urgent" ? "amber" : "green");
  const classes = cn(
    "inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-medium",
    variantClasses[resolvedVariant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} title={title}>
        {tag}
      </Link>
    );
  }
  return (
    <span className={classes} title={title}>
      {tag}
    </span>
  );
}
