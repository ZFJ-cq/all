import { Category, ParsedItem, CATEGORY_KEYWORDS } from '@/types'

const CHINESE_NUMBERS: Record<string, number> = {
  '二十': 20, '十九': 19, '十八': 18, '十七': 17, '十六': 16,
  '十五': 15, '十四': 14, '十三': 13, '十二': 12, '十一': 11,
  '十': 10, '九': 9, '八': 8, '七': 7, '六': 6,
  '五': 5, '四': 4, '三': 3, '两': 2, '二': 2, '一': 1,
}

const UNIT_PATTERN = '(个|只|口|把|条|件|套|双|对|组|包|箱|瓶|罐|桶|袋|盒|本|张|块|床|台|部|支|根|卷|副|顶|盏|柄)'

function inferCategory(name: string): Category {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'other') continue
    for (const keyword of keywords) {
      if (name.includes(keyword)) {
        return category as Category
      }
    }
  }
  return 'other'
}

function extractQuantity(text: string): { quantity: number; unit: string; remaining: string } {
  const arabicMatch = text.match(new RegExp(`^(\\d+)\\s*${UNIT_PATTERN}?`))
  if (arabicMatch && arabicMatch[1]) {
    const quantity = parseInt(arabicMatch[1], 10)
    if (!isNaN(quantity) && quantity > 0) {
      const unit = arabicMatch[2] || '个'
      const remaining = text.slice(arabicMatch[0].length).trim()
      return { quantity, unit, remaining }
    }
  }

  for (const [cnNum, num] of Object.entries(CHINESE_NUMBERS)) {
    if (text.startsWith(cnNum)) {
      const afterNum = text.slice(cnNum.length).trimStart()
      let unit = '个'
      let nameStart = afterNum
      for (const cnUnit of Object.keys({ '个': 1, '只': 1, '口': 1, '把': 1, '条': 1, '件': 1, '套': 1, '双': 1, '对': 1, '组': 1, '包': 1, '箱': 1, '瓶': 1, '罐': 1, '桶': 1, '袋': 1, '盒': 1, '本': 1, '张': 1, '块': 1, '床': 1, '台': 1, '部': 1, '支': 1, '根': 1 })) {
        if (afterNum.startsWith(cnUnit)) {
          unit = cnUnit
          nameStart = afterNum.slice(cnUnit.length).trimStart()
          break
        }
      }
      return { quantity: num, unit, remaining: nameStart }
    }
  }

  return { quantity: 1, unit: '个', remaining: text }
}

export function parseVoiceInput(text: string): ParsedItem[] {
  if (!text.trim()) return []

  const segments = text.split(/[，,、；;。\.\n]+/).filter(s => s.trim())
  const results: ParsedItem[] = []

  for (const segment of segments) {
    let trimmed = segment.trim()
    if (!trimmed) continue

    let location = ''
    const locationPatterns = [
      /(?:在|放于|存于|位于)\s*([^，,；;。\s]{1,10})/,
    ]
    for (const pattern of locationPatterns) {
      const locationMatch = trimmed.match(pattern)
      if (locationMatch) {
        location = locationMatch[1].trim()
        trimmed = trimmed.replace(locationMatch[0], '').trim()
        break
      }
    }

    const { quantity, unit, remaining } = extractQuantity(trimmed)
    const name = remaining.trim() || trimmed.trim()

    if (name) {
      const category = inferCategory(name)
      results.push({
        name,
        quantity,
        unit,
        category,
        location: location || getCategoryDefaultLocation(category),
      })
    }
  }

  return results
}

function getCategoryDefaultLocation(category: Category): string {
  const defaults: Record<Category, string> = {
    kitchen: '厨房',
    bedroom: '卧室',
    living: '客厅',
    bathroom: '卫浴',
    study: '书房',
    daily: '储物间',
    other: '待整理',
  }
  return defaults[category]
}
