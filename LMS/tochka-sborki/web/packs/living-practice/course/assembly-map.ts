// Сквозной картины у курса нет (features.assemblyMap = false); пустое соответствие — чтобы стаб движка резолвился.
import type { AssemblyMap } from '@/lib/assembly/types'

export const ASSEMBLY_MAP: AssemblyMap = { nodes: [], parts: [], units: {} }
