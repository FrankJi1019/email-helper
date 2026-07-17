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
    // Strip non-digits
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
    // Allow navigation keys, backspace, delete, tab
    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"]
    if (allowedKeys.includes(e.key)) return

    // Only allow digits
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
      className={`w-full h-10 px-3 rounded-md border bg-white text-sm text-ads-text placeholder:text-ads-disabled outline-none transition-all focus:ring-2 font-mono tracking-wider ${
        hasError
          ? "border-ads-red focus:ring-ads-red/20"
          : "border-ads-border focus:border-ads-blue focus:ring-ads-blue/20"
      }`}
    />
  )
}

export default MaskedInput
