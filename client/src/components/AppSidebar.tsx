import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Link, useLocation } from "react-router-dom"

export function AppSidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 py-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/">
              <Button
                variant={pathname === "/" ? "default" : "ghost"}
                size="icon"
                className={cn("rounded-lg")}
              >
                <span className="sr-only">Dashboard</span>
                {/* Add icon here if needed */}
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Dashboard</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  )
    }
