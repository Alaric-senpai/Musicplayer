import { Home, Search, Library, PlusSquare, Heart, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  onSelectDirectory: () => void
  isLoading: boolean
}

export default function Sidebar({ onSelectDirectory, isLoading }: SidebarProps) {
  return (
    <div className="w-60 bg-black flex-shrink-0 flex flex-col h-full">
      <div className="p-6">
        <div className="text-2xl font-bold mb-8 text-white">
          <span className="text-green-500">Offline</span>Music
        </div>

        <nav className="space-y-4">
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-emerald-400 hover:text-white ">
            <Home size={20} className="mr-3" />
            Home
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-emerald-400 hover:text-white">
            <Search size={20} className="mr-3" />
            Search
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:bg-emerald-400 hover:text-white "
            onClick={onSelectDirectory}
            disabled={isLoading}
          >
            <Library size={20} className="mr-3" />
            {isLoading ? "Loading..." : "Your Library"}
          </Button>
        </nav>
      </div>

      <div className="mt-6 p-6">
        <div className="space-y-4">
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-emerald-400 hover:text-white">
            <PlusSquare size={20} className="mr-3" />
            Create Playlist
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-emerald-400 hover:text-white">
            <Heart size={20} className="mr-3" />
            Liked Songs
          </Button>
        </div>
      </div>

      <div className="mt-auto p-6">
        <Button
          onClick={onSelectDirectory}
          className="w-full bg-green-500 hover:bg-green-600 text-white"
          disabled={isLoading}
        >
          <Download size={16} className="mr-2" />
          {isLoading ? "Loading..." : "Select Music Folder"}
        </Button>
      </div>
    </div>
  )
}

