export const BOOKLET_STYLE = `
.bk-grid{display:grid;grid-template-columns:minmax(18rem,.9fr) minmax(20rem,1.1fr);gap:1.25rem}
.bk-panel{border:1px solid var(--border-soft);border-radius:var(--radius);padding:1rem;background:var(--bg-surface)}
.bk-fields{display:grid;gap:.7rem}.bk-fields label{display:grid;gap:.25rem;color:var(--text-secondary);font-size:var(--text-sm)}
.bk-fields input,.bk-fields textarea,.bk-fields select{font:inherit;color:var(--text-body);background:var(--bg-primary);border:1px solid var(--border-soft);
border-radius:.35rem;padding:.55rem}
.bk-fields textarea{min-height:5rem;resize:vertical}.bk-section{border-top:1px solid var(--border-soft);padding-top:.8rem;margin-top:.8rem}
.bk-row{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}.bk-actions{display:flex;gap:.6rem;flex-wrap:wrap;margin:1rem 0}
 .bk-preview{font-family:var(--font-body);line-height:1.6}.bk-page{background:var(--bg-surface);color:var(--text-body);padding:2rem;
 min-height:12rem;margin-bottom:1rem;box-shadow:0 4px 24px var(--shadow-soft)}
.bk-cover{min-height:22rem;display:grid;align-content:end;background:linear-gradient(145deg,var(--bk-accent,var(--accent-wash)),var(--bg-surface))}
 .bk-card{border:1px solid var(--border-soft);padding:1rem;margin:.6rem 0;break-inside:avoid}.bk-meta{color:var(--text-secondary);
 font-size:var(--text-sm)}.bk-print-errors{break-after:page;border:2px solid var(--crit);padding:1rem}
@media(max-width:900px){.bk-grid{grid-template-columns:1fr}}
@media print{@page{size:var(--bk-paper, A4);margin:16mm}.bk-noprint{display:none!important}.bk-preview{color:var(--text-body)}.bk-page{box-shadow:none;margin:0;break-inside:avoid}
.bk-cover{break-after:page}.bk-card{break-inside:avoid}}
`
