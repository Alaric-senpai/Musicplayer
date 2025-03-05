"use client"

import { useState, useEffect, useRef } from "react"
import { Howl } from "howler"
import { parseBlob } from "music-metadata-browser"
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Shuffle, Repeat, Heart, Repeat1Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import TrackList from "@/components/track-list"
import Sidebar from "@/components/sidebar"
import Image from 'next/image'

export default function MusicPlayer() {
  const [sound, setSound] = useState<Howl | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [tracks, setTracks] = useState<any[]>([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null)
  const [currentTrack, setCurrentTrack] = useState<any>(null)
  const [duration, setDuration] = useState(0)
  const [seek, setSeek] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoop, setLoop]=useState(false)

  const seekTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (seekTimer.current) clearInterval(seekTimer.current)
      if (sound) sound.unload()
    }
  }, [sound])


  useEffect(()=>{
      nextTrack()
  }, [currentTrackIndex])

  const handleDirectorySelection = async () => {
    try {
      setIsLoading(true)
      const input = document.createElement("input")
      input.type = "file"
      input.webkitdirectory = true
      input.multiple = true
      input.accept = "audio/mp3,audio/wav,audio/ogg,audio/flac,audio/m4a"

      input.onchange = async (event) => {
        console.log((event.target as HTMLInputElement).baseURI)
        const files = Array.from((event.target as HTMLInputElement).files || [])
        const trackList = []

        for (const file of files) {
          if (file.name.match(/\.(mp3|wav|ogg|flac|m4a)$/i)) {
            try {
              const url = URL.createObjectURL(file)
              const metadata = await parseBlob(file)
              const picture = metadata.common.picture && metadata.common.picture[0]
              let albumArt = null
              if (picture) {
                const blob = new Blob([picture.data], { type: picture.format })
                albumArt = URL.createObjectURL(blob)
              }

              trackList.push({
                name: metadata.common.title || file.name,
                artist: metadata.common.artist || "Unknown Artist",
                album: metadata.common.album || "Unknown Album",
                duration: metadata.format.duration || 0,
                url,
                albumArt,
              })
            } catch (error) {
              console.error("Error parsing metadata:", error)
              // Add track with minimal info if metadata parsing fails
              trackList.push({
                name: file.name,
                artist: "Unknown Artist",
                album: "Unknown Album",
                duration: 0,
                url: URL.createObjectURL(file),
                albumArt: null,
              })
            }
          }
        }

        setTracks(trackList)
        setIsLoading(false)
        if (trackList.length > 0) loadTrack(0, trackList)
      }

      input.click()
    } catch (error) {
      console.error("Error selecting directory:", error)
      setIsLoading(false)
    }
  }

  const loadTrack = (index: number, trackList = tracks) => {
    if (sound) {
      sound.stop()
      sound.unload()
      if (seekTimer.current) clearInterval(seekTimer.current)
    }

    const track = trackList[index]
    setCurrentTrack(track)

    const newSound = new Howl({
      src: [track.url],
      html5: true,
      volume: isMuted ? 0 : volume,
      onplay: () => {
        setIsPlaying(true)
        setDuration(newSound.duration())

        seekTimer.current = setInterval(() => {
          setSeek(newSound.seek())
        }, 1000)
      },
      onpause: () => {
        setIsPlaying(false)
        if (seekTimer.current) clearInterval(seekTimer.current)
      },
      onstop: () => {
        setIsPlaying(false)
        if (seekTimer.current) clearInterval(seekTimer.current)
      },
      onend: () => {
          if (seekTimer.current) clearInterval(seekTimer.current)
          nextTrack()
      },

    })

    setSound(newSound)
    setCurrentTrackIndex(index)
    newSound.play()
  }

  const togglePlayPause = () => {
    if (!sound) return
    if (isPlaying) {
      sound.pause()
    } else {
      sound.play()
    }
  }

  const toggleLoop =()=>{
    setLoop(!isLoop)
  }

  const nextTrack = () => {
    if (currentTrackIndex !== null && tracks.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % tracks.length
      loadTrack(nextIndex)
    }
  }

  const prevTrack = () => {
    if (currentTrackIndex !== null && tracks.length > 0) {
      const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length
      loadTrack(prevIndex)
    }
  }

  const handleSeek = (value: number[]) => {
    if (!sound) return
    const seekValue = value[0]
    sound.seek(seekValue)
    setSeek(seekValue)
  }

  const handleVolumeChange = (value: number[]) => {
    if (!sound) return
    const volumeValue = value[0]
    setVolume(volumeValue)
    sound.volume(isMuted ? 0 : volumeValue)
  }

  const toggleMute = () => {
    if (!sound) return
    const newMuteState = !isMuted
    setIsMuted(newMuteState)
    sound.volume(newMuteState ? 0 : volume)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const VolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX size={20} />
    if (volume < 0.5) return <Volume1 size={20} />
    return <Volume2 size={20} />
  }

  return (
    <div
      className="flex flex-col h-full relative"
      style={{
        backgroundImage: currentTrack?.albumArt ? `url(${currentTrack.albumArt})` : "none",
        backgroundColor: currentTrack?.albumArt ? "transparent" : "rgba(18, 18, 18, 1)",
        backgroundSize: "cover",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: "center",
      }}
    >
      {/* Add an overlay div for the blur effect */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-lg z-0" />

      {/* Wrap the existing content in a relative div to place it above the background */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex flex-1 overflow-y-scroll md:overflow-hidden">
          {/* <Sidebar onSelectDirectory={handleDirectorySelection} isLoading={isLoading} /> */}

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {tracks.length > 0 ? (

                <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full overflow-hidden">
                <div className="w-full my-3">
                  { 
                    currentTrack && (
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <Image src={currentTrack?.albumArt} alt="current track" width={300} height={300} className="mt-5 rounded-md shadow-md" />

                        <div className="truncate space-y-3">
                          <h3 className="text-purple-500">
                            {
                              currentTrack?.album
                            }
                          </h3>
                          <h1 className="font-bold text-lg text-white">
                            {currentTrack?.name}
                          </h1>
                          <h2 className="text-sm italic">
                            {
                              currentTrack?.artist
                            }
                          </h2>
                        </div>

                        <div className="flex items-center gap-4 my-2">
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-teal-500">
                              <Shuffle size={20} />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-teal-500" onClick={prevTrack}>
                              <SkipBack size={20} />
                            </Button>
                            <Button
                              className="bg-white hover:bg-gray-200 text-black  rounded-full w-9 h-9 flex items-center hover:bg-teal-500 justify-center"
                              onClick={togglePlayPause}
                            >
                              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-teal-500" onClick={nextTrack}>
                              <SkipForward size={20} />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-blue-500 hover:text-white hoveR:bg-teal-500" onClick={toggleLoop}>
                              {isLoop ?  
                              (

                                <Repeat1Icon size={20} />
                              ) :(
                                <Repeat size={20} />
                              ) 
                            }
                            {isLoop}
                            </Button>
                          </div>
                          <div className="w-5/6 m-auto flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-10 text-right">{formatTime(seek)}</span>
                            <Slider
                              value={[seek]}
                              min={0}
                              max={duration || 100}
                              step={0.1}
                              
                              onValueChange={handleSeek}
                              className="w-1/2 m-auto"
                            />
                            <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
                          </div>

                          <div className="w-[30%] flex justify-end items-center gap-2">
                              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={toggleMute}>
                                <VolumeIcon />
                              </Button>
                              <Slider
                                value={[volume]}
                                min={0}
                                max={1}
                                step={0.01}
                                onValueChange={handleVolumeChange}
                                className="w-24 bg-blue-500"
                              />
                            </div>


                      </div>
                    )
                  }

                </div>

                  <div className="h-full w-full overflow-y-scroll">

                      <TrackList
                        tracks={tracks}
                        currentTrackIndex={currentTrackIndex}
                        onTrackSelect={loadTrack}
                        isPlaying={isPlaying}
                        onTogglePlay={togglePlayPause}
                      />
                  </div>

                </div>

              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <h2 className="text-2xl font-bold mb-4">Welcome to your Music Player</h2>
                  <p className="text-gray-400 mb-6">Select a directory to load your music files</p>
                  <Button onClick={handleDirectorySelection} className="bg-green-500 hover:bg-green-600 text-white" disabled={isLoading}>
                    Select Music Folder
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}

