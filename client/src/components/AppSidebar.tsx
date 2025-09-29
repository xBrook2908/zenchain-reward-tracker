import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter 
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Wallet, 
  History, 
  TrendingUp, 
  Settings, 
  Plus,
  Shield
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface AppSidebarProps {
  walletCount: number;
  onAddWallet: () => void;
}

export default function AppSidebar({ walletCount, onAddWallet }: AppSidebarProps) {
  const [location] = useLocation();

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Wallets",
      url: "/wallets",
      icon: Wallet,
    },
    {
      title: "Reward History",
      url: "/history",
      icon: History,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: TrendingUp,
    },
  ];

  const bottomItems = [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    }
  ];

  return (
    <Sidebar data-testid="sidebar-main">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center space-x-2 px-4 py-3">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sm">Zenchain Tracker</h1>
            <p className="text-xs text-muted-foreground">Reward Monitor</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.title === "Wallets" && walletCount > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {walletCount}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddWallet}
              className="justify-start w-full"
              data-testid="button-add-wallet-sidebar"
            >
              <Plus className="h-3 w-3 mr-2" />
              Add Wallet
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                isActive={location === item.url}
                data-testid={`nav-${item.title.toLowerCase()}`}
              >
                <Link href={item.url}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}