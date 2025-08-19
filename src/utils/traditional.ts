// Minimal Simplified -> Traditional converter
// Note: For full accuracy, consider integrating OpenCC in a future iteration.

const mapPairs: Array<[string, string]> = [
  // Common radicals and words
  ['云','雲'],['为','為'],['于','於'],['与','與'],['专','專'],['业','業'],['东','東'],['丝','絲'],['丛','叢'],['临','臨'],['为','為'],
  ['么','麼'],['义','義'],['乌','烏'],['乐','樂'],['乔','喬'],['习','習'],['书','書'],['买','買'],['乱','亂'],['争','爭'],['亏','虧'],
  ['亚','亞'],['产','產'],['会','會'],['众','眾'],['优','優'],['传','傳'],['伤','傷'],['体','體'],['余','餘'],['价','價'],['伦','倫'],
  ['们','們'],['儿','兒'],['党','黨'],['军','軍'],['农','農'],['净','淨'],['医','醫'],['华','華'],['协','協'],['单','單'],['卖','賣'],
  ['变','變'],['发','發'],['台','臺'],['后','後'],['启','啟'],['吗','嗎'],['团','團'],['国','國'],['图','圖'],['圆','圓'],
  ['处','處'],['备','備'],['复','復'],['实','實'],['对','對'],['将','將'],['师','師'],['广','廣'],['庆','慶'],['应','應'],['库','庫'],
  ['录','錄'],['当','當'],['彻','徹'],['恒','恆'],['恶','惡'],['惯','慣'],['戏','戲'],['护','護'],['据','據'],['时','時'],['术','術'],
  ['条','條'],['极','極'],['权','權'],['构','構'],['枪','槍'],['欢','歡'],['气','氣'],['汉','漢'],['汇','匯'],['没','沒'],['历','歷'],
  ['辞','辭'],['杂','雜'],['条','條'],['来','來'],['杨','楊'],['楼','樓'],['标','標'],['检','檢'],['沟','溝'],['测','測'],['湾','灣'],
  ['灯','燈'],['炼','煉'],['点','點'],['热','熱'],['爱','愛'],['爷','爺'],['猫','貓'],['鱼','魚'],['鸟','鳥'],['龙','龍'],['马','馬'],
  ['门','門'],['风','風'],['电','電'],['这','這'],['这','這'],['机','機'],['学','學'],['习','習'],['语','語'],['读','讀'],['写','寫'],
  ['说','說'],['试','試'],['听','聽'],['见','見'],['观','觀'],['买','買'],['卖','賣'],['问','問'],['题','題'],['页','頁'],['网','網'],
]

const mapS2T = new Map(mapPairs)

export function toTraditionalQuick(input: string): string {
  let out = ''
  for (const ch of input) out += mapS2T.get(ch) ?? ch
  return out
}

let openccConverter: any | null = null
let openccLoading: Promise<any> | null = null

export async function ensureOpenCC(): Promise<void> {
  if (openccConverter) return
  if (!openccLoading) {
    openccLoading = (async () => {
      try {
        const mod: any = await import('opencc-js')
        // opencc-js@1.x full ESM: namespace export with Converter factory
        if (mod && typeof mod.Converter === 'function') {
          const conv = mod.Converter({ from: 'cn', to: 'tw' })
          return { convert: (s: string) => conv(s) }
        }
        // Some builds may expose default.Converter
        if (mod?.default && typeof mod.default.Converter === 'function') {
          const conv = mod.default.Converter({ from: 'cn', to: 'tw' })
          return { convert: (s: string) => conv(s) }
        }
        return null
      } catch (e) {
        return null
      }
    })()
  }
  openccConverter = await openccLoading
}

export function hasOpenCC(): boolean {
  return !!openccConverter
}

// Synchronous converter for UI (best-effort):
// if OpenCC is ready and exposes sync convert, use it; otherwise quick map.
export function toTraditional(input: string): string {
  try {
    if (openccConverter && typeof openccConverter.convert === 'function') {
      const res = openccConverter.convert(input)
      // If convert returns a promise, fall back to quick to keep sync
      if (res && typeof (res as any).then === 'function') return toTraditionalQuick(input)
      return res
    }
  } catch (_) {}
  return toTraditionalQuick(input)
}

export async function toTraditionalOpenCC(input: string): Promise<string> {
  if (!openccConverter) return toTraditionalQuick(input)
  try {
    // Wrapper object with sync convert(s: string)
    if (typeof openccConverter.convert === 'function' && openccConverter.convert.length >= 1) {
      const res = openccConverter.convert(input)
      if (res && typeof res.then === 'function') return await res
      return res
    }
    if (typeof openccConverter.convertPromise === 'function') {
      return await openccConverter.convertPromise(input)
    }
  } catch (_) {
    // ignore
  }
  return toTraditionalQuick(input)
}

// Note: `toTraditional` is now a real function above that prefers OpenCC
