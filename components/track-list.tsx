import { useState } from "react"
import { Play, Pause, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Track {
  name: string
  artist: string
  album: string
  duration: number
  url: string
  albumArt: string | null,
}

interface TrackListProps {
  tracks: Track[]
  currentTrackIndex: number | null
  onTrackSelect: (index: number) => void
  isPlaying: boolean
  onTogglePlay: () => void
}

export default function TrackList({
  tracks,
  currentTrackIndex,
  onTrackSelect,
  isPlaying,
  onTogglePlay,
}: TrackListProps) {
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="px-6">
      <h2 className="text-2xl font-bold mb-4">Your Library <br /> {tracks.length} tracks </h2>

      <div className="mb-4">
        <div className="grid grid-cols-[16px_4fr_3fr_2fr_1fr] gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
          <div className="text-center">#</div>
          <div>TITLE</div>
          <div>ALBUM</div>
          <div>ARTIST</div>
          <div className="flex justify-end">
            <Clock size={16} />
          </div>
        </div>

        <div className="mt-2">
          {tracks.map((track, index) => (
            <div
              key={index}
              className={`group grid grid-cols-[16px_4fr_3fr_2fr_1fr] gap-4 px-4 py-2 rounded-md hover:bg-white/10 cursor-pointer ${
                currentTrackIndex === index ? "bg-green-500/20" : ""
              }`}
              onMouseEnter={() => setHoveredTrack(index)}
              onMouseLeave={() => setHoveredTrack(null)}
              onClick={() => onTrackSelect(index)}
            >
              <div className="flex items-center justify-center text-sm">
                {hoveredTrack === index ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (currentTrackIndex === index) {
                        onTogglePlay()
                      } else {
                        onTrackSelect(index)
                      }
                    }}
                  >
                    {currentTrackIndex === index && isPlaying ? (
                      <Pause size={16} className="text-green-500" />
                    ) : (
                      <Play size={16} className="text-white" />
                    )}
                  </Button>
                ) : (
                  <span className={currentTrackIndex === index ? "text-green-500" : "text-gray-400"}>{index + 1}</span>
                )}
              </div>
              <div className="flex items-center overflow-hidden">
                {track.albumArt && (
                  <img
                    src={track.albumArt || "/placeholder.svg"}
                    alt={track.album}
                    className="w-10 h-10 mr-3 object-cover rounded"
                  />
                )}
                <div className="truncate">
                  <div className={`font-medium truncate ${currentTrackIndex === index ? "text-green-500" : ""}`}>
                    {track.name}
                  </div>
                  <div className="text-sm text-gray-400 truncate">{track.artist}</div>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-400 truncate">{track.album} 
              </div>
              <div className="flex items-center text-sm text-gray-400 truncate">{track.artist}</div>
              <div className="flex items-center justify-end text-sm text-gray-400">{formatTime(track.duration)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

