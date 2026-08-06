import { CoursePage } from '../../../components/course-page'
import { resolveCourse } from '../../../lib/course/living-practice'

const t = resolveCourse('en')

export const metadata = {
  title: t.metaTitle,
  description: t.metaDescription,
}

export default function Page() {
  return <CoursePage locale="en" />
}
