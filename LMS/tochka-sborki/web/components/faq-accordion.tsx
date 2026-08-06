interface FaqItem { q: string; a: string }

interface Props { items: FaqItem[] }

export function FaqAccordion({ items }: Props) {
  return (
    <div style={{ borderTop: '1px solid var(--border-color)' }}>
      <style>{`
        .faq-acc { border-bottom: 1px solid var(--border-color); }
        .faq-acc summary {
          list-style: none;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 1rem;
          padding: 1.25rem 0;
        }
        .faq-acc summary::-webkit-details-marker { display: none; }
        .faq-acc-icon { font-family: var(--font-mono); color: var(--text-accent); flex-shrink: 0; }
        .faq-acc[open] .faq-acc-plus { display: none; }
        .faq-acc:not([open]) .faq-acc-minus { display: none; }
      `}</style>
      {items.map(item => (
        <details key={item.q} className="faq-acc" name="faq">
          <summary>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {item.q}
            </span>
            <span className="faq-acc-icon" aria-hidden="true">
              <span className="faq-acc-plus">+</span>
              <span className="faq-acc-minus">−</span>
            </span>
          </summary>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, padding: '0 0 1.25rem', maxWidth: '60ch' }}>
            {item.a}
          </p>
        </details>
      ))}
    </div>
  )
}
