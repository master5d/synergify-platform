// Стаб course-pack (Ф1 S1): данные живут в packs/tochka-sborki/course.config.ts.
// Единственная легитимная точка входа движка в pack до появления @pack-alias (S4).
// Boundary-гвард (lib/boundary.test.ts) следит, что packs/ не импортится мимо стабов.
export * from '../packs/tochka-sborki/course.config'
