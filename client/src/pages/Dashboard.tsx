import { AppSidebar } from "@/components/AppSidebar"
import { SidebarTrigger } from "@/components/SidebarTrigger"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppSidebar />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <SidebarTrigger />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Add dashboard widgets here */}
        </div>
      </div>
    </div>
  )
}
