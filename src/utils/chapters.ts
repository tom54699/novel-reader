export interface Chapter { title: string; start: number; end: number }

const reCJK = /^(第[一二三四五六七八九十零百千0-9]+[章回節节])[\s：:.-]?(.*)$/
const reEN = /^(?:CHAPTER|Chapter)\s+([0-9IVXLCDM]+)\b[\s.:;-]?(.*)$/

export function parseChapters(text: string): Chapter[] {
  const lines = text.split(/\n/)
  const marks: { idx: number; title: string }[] = []
  lines.forEach((raw, i) => {
    const line = raw.trim()
    if (!line) return
    let m = reCJK.exec(line)
    if (m) {
      const base = (m[1] ?? '').trim()
      const rest = (m[2] ?? '').trim()
      marks.push({ idx: i, title: rest ? `${base} ${rest}` : base })
      return
    }
    m = reEN.exec(line)
    if (m) {
      const n = (m[1] ?? '').trim()
      const rest = (m[2] ?? '').trim()
      const ch = rest ? `Chapter ${n} ${rest}` : `Chapter ${n}`
      marks.push({ idx: i, title: ch })
    }
  })
  if (marks.length < 2) return []

  const chapters: Chapter[] = []
  const offsets: number[] = []
  // Precompute start offset by line index
  let acc = 0
  for (const [i, raw] of lines.entries()) {
    offsets[i] = acc
    acc += raw.length + 1 // +1 for the newline
  }
  for (let i = 0; i < marks.length; i++) {
    const cur = marks[i]!
    const next = i + 1 < marks.length ? marks[i + 1]! : null
    const startLine = cur.idx
    const endLine = next ? next.idx : lines.length
    const start = offsets[startLine]!
    const end = endLine < offsets.length ? offsets[endLine]! : acc
    chapters.push({ title: cur.title, start, end })
  }
  return chapters
}

// --- Chapter analysis helpers ---

function chineseNumeralToNumber(raw: string): number | null {
  // Supports up to thousands reasonably: 千百十 units
  const map: Record<string, number> = { 零: 0, 一: 1, 二: 2, 兩: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 }
  let total = 0
  let current = 0
  let seen = false
  for (const ch of raw) {
    const v = map[ch]
    if (v !== undefined) {
      current += v
      seen = true
    } else if (ch === '十') {
      current = (current || 1) * 10
      total += current
      current = 0
      seen = true
    } else if (ch === '百') {
      current = (current || 1) * 100
      total += current
      current = 0
      seen = true
    } else if (ch === '千') {
      current = (current || 1) * 1000
      total += current
      current = 0
      seen = true
    }
  }
  if (!seen) return null
  total += current
  return total || null
}

function romanToNumber(roman: string): number | null {
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
  let sum = 0
  let prev = 0
  const s = roman.toUpperCase()
  let seen = false
  for (let i = s.length - 1; i >= 0; i--) {
    const c = s.charAt(i)
    const v = map[c]
    if (!v) continue
    seen = true
    if (v < prev) sum -= v
    else { sum += v; prev = v }
  }
  return seen ? sum : null
}

function extractChapterNumber(title: string): number | null {
  let m = reCJK.exec(title)
  if (m) {
    const token = m[1]?.replace(/^第/, '')?.replace(/[章回節节]$/, '') ?? ''
    // Prefer Arabic digits if present
    const m2 = token.match(/[0-9]+/)
    if (m2) return parseInt(m2[0]!, 10)
    return chineseNumeralToNumber(token)
  }
  m = reEN.exec(title)
  if (m) {
    const token = m[1] ?? ''
    if (/^[0-9]+$/.test(token)) return parseInt(token, 10)
    const roman = romanToNumber(token)
    if (roman != null) return roman
  }
  return null
}

export function findChapterGaps(chapters: Chapter[]): number[] {
  const numbers: number[] = []
  for (const ch of chapters) {
    const n = extractChapterNumber(ch.title)
    if (n != null) numbers.push(n)
  }
  if (numbers.length < 2) return []
  const gaps: number[] = []
  for (let i = 1; i < numbers.length; i++) {
    const prev = numbers[i - 1]!
    const cur = numbers[i]!
    if (cur > prev + 1) {
      for (let x = prev + 1; x < cur; x++) gaps.push(x)
    }
  }
  return gaps
}
