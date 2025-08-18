export interface Chapter { title: string; start: number; end: number }

const reCJK = /^(第[一二三四五六七八九十零百千0-9]+[章回節节])[\s：:.-]?(.*)$/
const reEN = /^(?:CHAPTER|Chapter)\s+([0-9IVXLCDM]+)\b[\s.:;-]?(.*)$/

export function parseChapters(text: string): Chapter[] {
  const lines = text.split(/\n/)
  const marks: { idx: number; title: string }[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    let m = reCJK.exec(line)
    if (m) {
      const rest = m[2]?.trim()
      marks.push({ idx: i, title: rest ? `${m[1]} ${rest}` : m[1] })
      continue
    }
    m = reEN.exec(line)
    if (m) {
      const rest = m[2]?.trim()
      const ch = rest ? `Chapter ${m[1]} ${rest}` : `Chapter ${m[1]}`
      marks.push({ idx: i, title: ch })
    }
  }
  if (marks.length < 2) return []

  const chapters: Chapter[] = []
  const offsets: number[] = []
  // Precompute start offset by line index
  let acc = 0
  for (let i = 0; i < lines.length; i++) {
    offsets[i] = acc
    acc += lines[i].length + 1 // +1 for the newline
  }
  for (let i = 0; i < marks.length; i++) {
    const startLine = marks[i].idx
    const endLine = i + 1 < marks.length ? marks[i + 1].idx : lines.length
    const start = offsets[startLine]
    const end = endLine < offsets.length ? offsets[endLine] : acc
    chapters.push({ title: marks[i].title, start, end })
  }
  return chapters
}

