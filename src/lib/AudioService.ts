/**
 * AudioService.ts
 * Singleton audio service — one player instance shared across the entire app.
 * Manages queue, lock screen, Now Playing metadata, and background playback.
 */

import {
  AudioPlayer,
  AudioStatus,
  createAudioPlayer,
  setAudioModeAsync,
} from 'expo-audio'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Track {
  id: string
  url: string
  title: string
  artist: string
  albumTitle?: string
  artworkUrl?: string
  duration?: number // seconds, optional — populated from status
}

export interface PlayerState {
  currentIndex: number
  queue: Track[]
  playing: boolean
  position: number // seconds
  duration: number // seconds
  volume: number // 0.0 – 1.0
  muted: boolean
  rate: number
  buffering: boolean
}

type Listener = (state: PlayerState) => void

// ─── Singleton ────────────────────────────────────────────────────────────────

class AudioService {
  private static _instance: AudioService | null = null

  // Underlying expo-audio player (created once, reused via player.replace())
  readonly player: AudioPlayer

  // Internal state — mutated, then broadcast to subscribers
  private _state: PlayerState = {
    currentIndex: -1,
    queue: [],
    playing: false,
    position: 0,
    duration: 0,
    volume: 1.0,
    muted: false,
    rate: 1.0,
    buffering: false,
  }

  private _listeners = new Set<Listener>()
  private _statusSub: ReturnType<AudioPlayer['addListener']> | null = null

  // ── Constructor (private — use getInstance()) ────────────────────────────

  private constructor() {
    this.player = createAudioPlayer()
    this._setupAudioMode()
    this._subscribeToStatus()
  }

  static getInstance(): AudioService {
    if (!AudioService._instance) {
      AudioService._instance = new AudioService()
    }
    return AudioService._instance
  }

  // ── Setup ────────────────────────────────────────────────────────────────

  private async _setupAudioMode() {
    await setAudioModeAsync({
      playsInSilentMode: true, // respect iOS silent switch for music apps
      shouldPlayInBackground: true, // keep playing when app is backgrounded
      interruptionMode: 'doNotMix', // pause other apps' audio
    })
  }

  private _subscribeToStatus() {
    this._statusSub = this.player.addListener(
      'playbackStatusUpdate',
      (status: AudioStatus) => {
        this._state = {
          ...this._state,
          playing: status.playing ?? this._state.playing,
          position: status.currentTime ?? this._state.position,
          duration: status.duration ?? this._state.duration,
          buffering: status.isBuffering ?? false,
        }

        // Auto-advance on track finish
        if (status.didJustFinish) {
          this._handleTrackEnd()
        }

        this._emit()
      },
    )
  }

  private _handleTrackEnd() {
    // Advance; `next()` stops on the last track rather than wrapping.
    this.next()
  }

  // ── Playback ─────────────────────────────────────────────────────────────

  /**
   * Load a queue and start playing from the given index.
   */
  async loadQueue(tracks: Track[], startIndex = 0): Promise<void> {
    this._state = { ...this._state, queue: tracks }
    await this._loadTrackAt(startIndex)
  }

  /**
   * Jump to a specific index in the current queue.
   */
  async playAt(index: number): Promise<void> {
    if (index < 0 || index >= this._state.queue.length) return
    await this._loadTrackAt(index)
  }

  private async _loadTrackAt(index: number): Promise<void> {
    const track = this._state.queue[index]
    if (!track) return

    this._state = {
      ...this._state,
      currentIndex: index,
      position: 0,
      duration: 0,
      playing: false,
    }
    this._emit()

    // Replace source without creating a new player instance
    this.player.replace({ uri: track.url })

    // Activate lock screen controls with track metadata
    this.player.setActiveForLockScreen(true, {
      title: track.title,
      artist: track.artist,
      albumTitle: track.albumTitle ?? '',
      artworkUrl: track.artworkUrl,
    })

    this.player.play()
  }

  toggle(): void {
    if (this._state.currentIndex < 0) {
      this.playAt(0)
      return
    }
    if (this._state.playing) {
      this.player.pause()
    } else {
      this.player.play()
    }
  }

  next(): void {
    const { queue, currentIndex } = this._state
    if (queue.length === 0) return

    const nextIdx = currentIndex + 1
    if (nextIdx >= queue.length) {
      // End of the queue — stay on the last track and stop.
      this.player.pause()
      return
    }
    this.playAt(nextIdx)
  }

  prev(): void {
    const { queue, currentIndex } = this._state
    if (queue.length === 0) return

    // If more than 3s in, restart current track; otherwise go to previous
    if (this._state.position > 3) {
      this.seekTo(0)
      return
    }

    if (currentIndex - 1 < 0) {
      this.seekTo(0)
      return
    }
    this.playAt(currentIndex - 1)
  }

  get hasNext(): boolean {
    const { queue, currentIndex } = this._state
    return currentIndex + 1 < queue.length
  }

  get hasPrev(): boolean {
    return this._state.queue.length > 0 && this._state.currentIndex > 0
  }

  seekTo(seconds: number): void {
    this.player.seekTo(seconds)
  }

  // ── Controls ─────────────────────────────────────────────────────────────

  setVolume(volume: number): void {
    const v = Math.max(0, Math.min(1, volume))
    this.player.volume = v
    this._state = { ...this._state, volume: v }
    this._emit()
  }

  setMuted(muted: boolean): void {
    this.player.muted = muted
    this._state = { ...this._state, muted }
    this._emit()
  }

  /**
   * Update Now Playing metadata on the lock screen without reloading the track.
   * Useful if artwork URL becomes available after initial load.
   */
  updateLockScreenMetadata(meta: {
    title?: string
    artist?: string
    albumTitle?: string
    artworkUrl?: string
  }): void {
    const track = this._state.queue[this._state.currentIndex]
    if (!track) return
    this.player.setActiveForLockScreen(true, {
      title: meta.title ?? track.title,
      artist: meta.artist ?? track.artist,
      albumTitle: meta.albumTitle ?? track.albumTitle ?? '',
      artworkUrl: meta.artworkUrl ?? track.artworkUrl,
    })
  }

  /**
   * Deactivate the lock screen / Now Playing widget (e.g. on app close).
   */
  deactivateLockScreen(): void {
    this.player.setActiveForLockScreen(false)
  }

  // ── State / Subscriptions ────────────────────────────────────────────────

  get state(): Readonly<PlayerState> {
    return this._state
  }

  get currentTrack(): Track | null {
    return this._state.queue[this._state.currentIndex] ?? null
  }

  subscribe(listener: Listener): () => void {
    this._listeners.add(listener)
    // Immediately deliver current state
    listener(this._state)
    return () => this._listeners.delete(listener)
  }

  private _emit(): void {
    this._listeners.forEach((fn) => fn(this._state))
  }

  // ── Cleanup ──────────────────────────────────────────────────────────────

  clearQueue(): void {
    this.player.pause()
    this.deactivateLockScreen()
    this._state = {
      ...this._state,
      queue: [],
      currentIndex: -1,
      position: 0,
      duration: 0,
      playing: false,
    }
    this._emit()
  }

  destroy(): void {
    this._statusSub?.remove()
    this.player.setActiveForLockScreen(false)
    this.player.pause()
    this._listeners.clear()
    AudioService._instance = null
  }
}

// Export the singleton instance — import this anywhere in your app
export const audioService = AudioService.getInstance()
