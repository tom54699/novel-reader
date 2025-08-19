// OpenCC Web Worker: tries multiple opencc-js APIs to support versions

let initialized = false as boolean
let convertFn: (s: string) => Promise<string> = async (s) => s

async function init() {
  if (initialized) return
  try {
    const mod: any = await import('opencc-js')
    // Newer API: default export with Converter factory
    if (mod?.default && typeof mod.default.Converter === 'function') {
      const conv = mod.default.Converter({ from: 'cn', to: 'tw' })
      convertFn = async (s: string) => conv(s)
      initialized = true
      return
    }
    // Older API: OpenCC class with s2tw.json
    if (typeof mod?.OpenCC === 'function') {
      const inst = new mod.OpenCC('s2tw.json')
      if (typeof inst.init === 'function') await inst.init()
      convertFn = async (s: string) => inst.convertPromise(s)
      initialized = true
      return
    }
    // Fallback: try default as ctor
    if (typeof mod?.default === 'function') {
      const inst = new mod.default('s2tw.json')
      if (typeof inst.init === 'function') await inst.init()
      // @ts-ignore
      convertFn = async (s: string) => (typeof inst.convertPromise === 'function' ? inst.convertPromise(s) : inst.convert(s))
      initialized = true
      return
    }
  } catch (err) {
    // keep no-op convert
  }
  initialized = true
}

self.onmessage = async (ev: MessageEvent) => {
  const { id, text } = ev.data || {}
  if (!initialized) await init()
  const out = await convertFn(String(text ?? ''))
  ;(self as any).postMessage({ id, text: out })
}

