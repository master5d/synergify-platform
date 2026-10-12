// Контракт сквозной картины (спека docs/superpowers/specs/2026-10-12-assembly-map-design.md).
// Движок считает состояния и красит; pack даёт соответствие юнит→деталь и геометрию машины.
import type { KeyboardEvent, ReactElement, SVGProps } from 'react'

export interface Bi { ru: string; en: string }

/** Узел машины — один на модуль курса. */
export interface AssemblyNode { id: string; module: string; label: Bi; optional: boolean }

/** Деталь узла — один на юнит (кроме юнитов-фаз). */
export interface AssemblyPart { id: string; node: string; label: Bi }

/** Юнит-фаза (activation, reflect…) отвечает за корпус узла целиком. */
export const NODE_TARGET = 'node'

export interface AssemblyMap {
  nodes: readonly AssemblyNode[]
  parts: readonly AssemblyPart[]
  /** Ключ — `<модуль>/<юнит>`, значение — id детали или NODE_TARGET. */
  units: Readonly<Record<string, string>>
}

export type PartState = 'built' | 'ghost'

export interface NodeProgress { built: number; total: number; shell: PartState }

export interface AssemblyState {
  parts: Record<string, PartState>
  nodes: Record<string, NodeProgress>
  /** Узел и деталь текущего юнита; part = null — текущий юнит-фаза (подсвечен корпус). */
  current: { node: string; part: string | null } | null
}

export type ElementAttrs = SVGProps<SVGGElement> & {
  [key: `data-${string}`]: string | undefined
  onKeyDown?: (e: KeyboardEvent<SVGGElement>) => void
}

/**
 * Пропсы геометрии. Автор машины раскладывает `{...node(id)}` на группу узла и `{...part(id)}` на группу детали,
 * кладёт `<title>{title(id)}</title>` первым потомком группы. Закрашиваемые фигуры (polygon, path, rect, ellipse,
 * circle, polyline) — прямые потомки своей группы: стили состояния действуют через `>` и не протекают во вложенные детали.
 */
export interface MachineProps {
  part: (id: string) => ElementAttrs
  node: (id: string) => ElementAttrs
  title: (id: string) => string
}

export interface MachineDef {
  viewBox: string
  nodeIds: readonly string[]
  partIds: readonly string[]
  Art: (props: MachineProps) => ReactElement
}
