import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function SidebarTrigger() {
  return (
    <div className="sm:hidden">
      <Button variant="ghost" size="icon">
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
    </div>
  )
}
