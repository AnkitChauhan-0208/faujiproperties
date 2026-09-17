export default function PropertyDetailLoading() {
  return (
    <main className="site-container flex-1 py-16" aria-busy="true" aria-live="polite">
      <p className="eyebrow">Fauji Properties</p>
      <p className="mt-4 text-lg text-[var(--muted)]">Loading property details...</p>
    </main>
  );
}