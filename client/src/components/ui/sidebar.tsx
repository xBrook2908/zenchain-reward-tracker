import { cn } from "@/lib/utils"

export function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn("flex h-full flex-col gap-4 p-4")}>
      {children}
    </div>
  )
}
