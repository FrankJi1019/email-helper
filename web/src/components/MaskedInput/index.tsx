import { useCallback, useRef } from "react"
import type { FC } from "react"

type MaskType = "date" | "time"

interface MaskedInputProps {
  type: MaskType
  value: string
  onChange: (value: string) => void
  id?: string
  hasError?: boolean
}

const MASKS: Record<MaskType, { placeholder: string; maxLength: number; separator: string; segments: number[] }> = {
  date: { placeholder: "DD/MM/YYYY", maxLength: 10, separator: "/", segments: [2, 2, 4] },
  time: { placeholder: "HH:MM", maxLength: 5, separator: ":", segments: [2, 2] },
}

const MaskedInput: FC<MaskedInputProps> = ({ type, value, onChange, id, hasError }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const mask = MASKS[type]

  const applyMask = useCallback((raw: string): string => {
    const digits = raw.replace(/\D/g, "")
    const parts: string[] = []
    let offset = 0

    for (const segLen of mask.segments) {
      if (offset >= digits.length) break
      parts.push(digits.slice(offset, offset + segLen))
      offset += segLen
    }

    return parts.join(mask.separator)
  }, [mask])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    const masked = applyMask(rawValue)
    onChange(masked)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"]
    if (allowedKeys.includes(e.key)) return

    if (!/^\d$/.test(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      inputMode="numeric"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={mask.placeholder}
      maxLength={mask.maxLength}
      className={`w-full h-11 px-4 rounded-xl border bg-white/80 backdrop-blur-sm text-sm text-ads-text placeholder:text-ads-disabled outline-none transition-all duration-200 focus:ring-2 focus:bg-white font-mono tracking-wider ${
        hasError
          ? "border-ads-red/60 focus:ring-ads-red/20 focus:border-ads-red"
          : "border-slate-200/80 focus:border-ads-blue focus:ring-ads-blue/20"
      }`}
    />
  )
}

export default MaskedInput
