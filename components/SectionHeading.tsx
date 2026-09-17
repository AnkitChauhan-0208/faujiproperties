type SectionHeadingProps = { eyebrow?: string; title: string; description?: string; align?: "left" | "center" };

export function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  return <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--brand-dark)] sm:text-4xl">{title}</h2>{description && <p className="mt-4 text-lg leading-8 text-[var(--muted)]">{description}</p>}</div>;
}
