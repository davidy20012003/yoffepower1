type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageShell({ eyebrow, title, description }: PageShellProps) {
  return (
    <section className="w-full py-10 sm:py-16">
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase text-[var(--muted)]">
          {eyebrow}
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          {description}
        </p>
      </div>
    </section>
  );
}
