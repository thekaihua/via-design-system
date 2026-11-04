export function ThemeCheck() {
  return (
    <section
      style={{
        background: 'var(--via-semantic-surface-default)',
        color: 'var(--via-semantic-text-primary)',
        padding: 24,
        borderRadius: 12,
      }}
    >
      <h1 style={{ margin: 0, fontSize: 24 }}>Theme check</h1>
      <p style={{ color: 'var(--via-semantic-text-secondary)' }}>
        Switch the Theme toolbar between Light and Dark. Surface and text colours should change.
      </p>
    </section>
  );
}
