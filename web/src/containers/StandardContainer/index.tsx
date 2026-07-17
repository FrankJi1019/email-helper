import type { FC } from "react"
import type { ContainerProps } from "../../types/props"

const StandardContainer: FC<ContainerProps> = ({ children, className = "" }) => {
  return (
    <div className={`rounded-xl bg-white border border-ads-border shadow-[0_1px_2px_0_rgba(9,30,66,0.08),0_0_0_1px_rgba(9,30,66,0.03)] p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  )
}

export default StandardContainer
