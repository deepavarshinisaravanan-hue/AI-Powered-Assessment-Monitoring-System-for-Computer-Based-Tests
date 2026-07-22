import { useNavigate } from "react-router-dom"
import { FiMenu, FiLogOut, FiUser, FiSettings } from "react-icons/fi"
import { useAuth } from "../../context/AuthContext"
import Avatar from "../ui/Avatar"
import Dropdown from "../ui/Dropdown"
import ThemeToggle from "./ThemeToggle"
import NotificationBell from "./NotificationBell"
import Button from "../ui/Button"

export default function Header({ title, onMenu }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/80 bg-card/80 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="text-muted hover:text-foreground lg:hidden"
        >
          <FiMenu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-foreground lg:text-lg">{title}</h1>
      </div>
      <div className="flex items-center gap-2.5">
        <ThemeToggle />
        <NotificationBell />
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 rounded-xl border border-border bg-card py-1 pl-1 pr-2.5 transition-colors hover:bg-muted/10">
              <Avatar name={user?.name} src={user?.avatar} size="sm" />
              <span className="hidden text-sm font-medium text-foreground sm:block">
                {user?.name?.split(" ")[0]}
              </span>
            </button>
          }
          items={[
            { label: "Profile", icon: FiUser, onClick: () => navigate("/profile") },
            { label: "Settings", icon: FiSettings, onClick: () => navigate("/profile") },
            { divider: true },
            { label: "Sign out", icon: FiLogOut, danger: true, onClick: logout },
          ]}
        />
        <Button
          variant="danger"
          size="sm"
          icon={FiLogOut}
          onClick={logout}
          className="hidden sm:inline-flex text-xs px-3"
        >
          Log Out
        </Button>
      </div>
    </header>
  )
}
