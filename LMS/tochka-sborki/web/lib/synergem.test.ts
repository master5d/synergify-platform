import { describe, it, expect } from 'vitest'
import { clusterAlumni, type AlumniEntry } from './synergem'

const e = (effort: string | null, niche: string | null = null, blurb = 'x'): AlumniEntry =>
  ({ effort, niche, contact: 'c', blurb })

describe('clusterAlumni', () => {
  it('groups entries by effort into synergem clusters with counts', () => {
    const clusters = clusterAlumni([e('co-build'), e('co-build'), e('mastermind')])
    const cobuild = clusters.find(c => c.key === 'co-build')!
    expect(cobuild.count).toBe(2)
    expect(cobuild.entries).toHaveLength(2)
    expect(clusters.find(c => c.key === 'mastermind')!.count).toBe(1)
  })

  it('maps a null effort to the "other" cluster', () => {
    const clusters = clusterAlumni([e(null)])
    expect(clusters).toHaveLength(1)
    expect(clusters[0].key).toBe('other')
  })

  it('sorts clusters by count desc, then key asc, with "other" always last', () => {
    const clusters = clusterAlumni([e(null), e('mastermind'), e('co-build'), e('co-build')])
    expect(clusters.map(c => c.key)).toEqual(['co-build', 'mastermind', 'other'])
  })

  it('carries each entry\'s niche through untouched', () => {
    const clusters = clusterAlumni([e('co-build', 'coach')])
    expect(clusters[0].entries[0].niche).toBe('coach')
  })

  it('returns an empty array for no entries', () => {
    expect(clusterAlumni([])).toEqual([])
  })
})
