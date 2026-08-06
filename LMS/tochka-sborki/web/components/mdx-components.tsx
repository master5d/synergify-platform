import type { MDXComponents } from 'mdx/types'
import { OsBlock } from './os-block'
import { OsToggle } from './os-toggle'
import { AgentBlock } from './agent-block'
import { AgentToggle } from './agent-toggle'
import { StackMatrix } from './stack-matrix'
import { Phase } from './phase'
import { VideoCheckpoint } from './video-checkpoint'
import { Walkthrough } from './walkthrough'
import { AnnotatedExample } from './annotated-example'
import { PromptAnatomy } from './prompt-anatomy'
import { WillWont } from './will-wont'
import { ModuleSurvey } from './module-survey'
import { CaptureFormBlock } from './capture-form-block'

export const mdxComponents: MDXComponents = {
  h1: ({ children }) => (
    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontSize: '1.375rem', fontWeight: 600, marginTop: '2rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-accent)' }}>{children}</h3>
  ),
  p: ({ children }) => (
    <p style={{ lineHeight: 1.75, marginBottom: '1rem', color: 'var(--text-primary)' }}>{children}</p>
  ),
  code: ({ children }) => (
    <code style={{
      fontFamily: 'var(--font-mono)',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: '3px',
      padding: '0.1em 0.4em',
      fontSize: '0.875em',
      color: 'var(--text-accent)',
    }}>{children}</code>
  ),
  pre: ({ children }) => (
    <pre style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius)',
      padding: '1rem',
      overflow: 'auto',
      marginBottom: '1rem',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.875rem',
    }}>{children}</pre>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: '3px solid var(--text-accent)',
      paddingLeft: '1rem',
      margin: '1rem 0',
      color: 'var(--text-secondary)',
      fontStyle: 'italic',
    }}>{children}</blockquote>
  ),
  ul: ({ children }) => (
    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', lineHeight: 1.75 }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ paddingLeft: '1.5rem', marginBottom: '1rem', lineHeight: 1.75 }}>{children}</ol>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th style={{ borderBottom: '2px solid var(--border-color)', padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--text-accent)', fontFamily: 'var(--font-mono)' }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{ borderBottom: '1px solid var(--border-color)', padding: '0.5rem 0.75rem', color: 'var(--text-primary)' }}>{children}</td>
  ),
  OsBlock,
  OsToggle,
  AgentBlock,
  AgentToggle,
  StackMatrix,
  Phase,
  VideoCheckpoint,
  Walkthrough,
  AnnotatedExample,
  PromptAnatomy,
  WillWont,
  ModuleSurvey,
  CaptureFormBlock,
}
