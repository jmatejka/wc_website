import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'

const featureCards = [
  {
    title: 'One-Pound Rewards',
    body: 'Every pound of progress unlocks a new collectible reward in your set.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
        <polyline points="20 12 20 22 4 22 4 12"></polyline>
        <rect x="2" y="7" width="20" height="5"></rect>
        <line x1="12" y1="22" x2="12" y2="7"></line>
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
      </svg>
    )
  },
  {
    title: 'Motivation You Can See',
    body: 'Swap visual collections to keep your journey fresh, playful, and sticky.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    )
  },
  {
    title: 'Fast Tracking Loop',
    body: 'Manual logging plus Health Connect sync means less friction, more momentum.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    )
  },
]

const screenshotPaths = [
  '/assets/screenshots_half/Screenshot_20260220_182416.png',
  '/assets/screenshots_half/Screenshot_20260220_182429.png',
  '/assets/screenshots_half/Screenshot_20260220_182437.png',
  '/assets/screenshots_half/Screenshot_20260220_182449.png',
  '/assets/screenshots_half/Screenshot_20260220_182525.png',
]

type SilhouetteMode = 'mask' | 'image'

type RewardItem = {
  src: string
  label: string
}

type RewardCollection = {
  id: string
  title: string
  ribbon: string
  included?: boolean
  items: RewardItem[]
  silhouetteMode: SilhouetteMode
}

const ROW_LIT_COUNT = 3
const COLLECTION_ROWS = 1

const buildLbCollection = (
  folder: string,
  prefix: string,
  extension: 'png' | 'jpg',
  labelPrefix: string,
  excludeIndices: number[] = [],
): RewardItem[] =>
  Array.from({ length: 100 }, (_, index) => index + 1)
    .filter((lbs) => !excludeIndices.includes(lbs))
    .map((lbs) => ({
      src: `/assets/collections/${folder}/${prefix}${lbs}lb.${extension}`,
      label: `${labelPrefix} ${lbs} lb`,
    }))

const excludedInstruments = [
  18, 27, 34, 38, 44, 47, 49, 52, 54, 55, 56, 59, 60, 61, 64, 65, 68, 70, 73, 75, 76, 81, 83, 86, 87, 91, 92, 95, 98
]

const rewardCollections: RewardCollection[] = [
  {
    id: 'pixel_animals',
    title: 'Pixel Animals',
    ribbon: 'INCLUDED - pixel animals',
    included: true,
    items: buildLbCollection('pixel_animals', 'animal_', 'png', 'Pixel animal'),
    silhouetteMode: 'mask',
  },
  {
    id: 'pixel_dogs',
    title: 'Pixel Dogs',
    ribbon: 'Unlockable - Pixel Dogs',
    items: buildLbCollection('pixel_dogs', 'dog_', 'png', 'Pixel dog'),
    silhouetteMode: 'mask',
  },
  {
    id: 'pixel_objects',
    title: 'Pixel Objects',
    ribbon: 'Unlockable - Pixel Objects',
    items: buildLbCollection('pixel_objects', 'object_', 'png', 'Pixel object'),
    silhouetteMode: 'mask',
  },
  {
    id: 'pixel_instruments',
    title: 'Pixel Instruments',
    ribbon: 'Unlockable - Pixel Instruments',
    items: buildLbCollection('pixel_instruments', 'instrument_', 'png', 'Pixel instrument', excludedInstruments),
    silhouetteMode: 'mask',
  },
  {
    id: 'clay_animals',
    title: 'Clay Animals',
    ribbon: 'Unlockable - Clay Animals',
    items: buildLbCollection('clay_animals', 'clay_animal_', 'jpg', 'Clay animal'),
    silhouetteMode: 'image',
  },
  {
    id: 'clay_dogs',
    title: 'Clay Dogs',
    ribbon: 'Unlockable - Clay Dogs',
    items: buildLbCollection('clay_dogs', 'clay_dog_', 'jpg', 'Clay dog'),
    silhouetteMode: 'image',
  },
  {
    id: 'clay_objects',
    title: 'Clay Objects',
    ribbon: 'Unlockable - Clay Objects',
    items: buildLbCollection('clay_objects', 'clay_object_', 'jpg', 'Clay object'),
    silhouetteMode: 'image',
  },
  {
    id: 'clay_instruments',
    title: 'Clay Instruments',
    ribbon: 'Unlockable - Clay Instruments',
    items: buildLbCollection('clay_instruments', 'clay_instrument_', 'jpg', 'Clay instrument', excludedInstruments),
    silhouetteMode: 'image',
  },
]

const unlockRewardExamples = Array.from({ length: 24 }, () => {
  const pixelCollections = rewardCollections.filter(c => c.silhouetteMode === 'mask')
  const collection = pixelCollections[Math.floor(Math.random() * pixelCollections.length)]
  const item = collection.items[Math.floor(Math.random() * collection.items.length)]
  return {
    src: item.src,
    isClay: false,
  }
})

const confettiColors = ['#FFEB3B', '#FF4081', '#2196F3', '#4CAF50', '#F44336', '#FFFFFF']

type AnimatedRewardTileProps = {
  src: string
  label: string
  isOn: boolean
  size: number
  silhouetteMode: SilhouetteMode
}

function AnimatedRewardTile({ src, label, isOn, size, silhouetteMode }: AnimatedRewardTileProps) {
  const fallbackSrc = '/assets/collections/pixel_animals/animal_1lb.png'
  const [resolvedSrc, setResolvedSrc] = useState(src)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const prevOnRef = useRef<boolean>(isOn)
  const intervalIdRef = useRef<number | null>(null)
  const clearTimeoutRef = useRef<number | null>(null)

  const drawChunkyReveal = (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
    const chunkSize = Math.max(2, Math.floor(size / 16))
    const cols = Math.floor(size / chunkSize)
    const rows = Math.floor(size / chunkSize)
    const sourceCanvas = document.createElement('canvas')
    sourceCanvas.width = size
    sourceCanvas.height = size
    const sourceCtx = sourceCanvas.getContext('2d')
    if (!sourceCtx) return
    sourceCtx.clearRect(0, 0, size, size)
    sourceCtx.drawImage(img, 0, 0, size, size)
    const chunks: Array<{ x: number; y: number }> = []

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        chunks.push({ x, y })
      }
    }

    for (let i = chunks.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[chunks[i], chunks[j]] = [chunks[j], chunks[i]]
    }

    ctx.clearRect(0, 0, size, size)

    let index = 0
    intervalIdRef.current = window.setInterval(() => {
      if (index >= chunks.length) {
        if (intervalIdRef.current) window.clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
        return
      }

      const { x, y } = chunks[index]
      const sx = x * chunkSize
      const sy = y * chunkSize

      ctx.drawImage(sourceCanvas, sx, sy, chunkSize, chunkSize, sx, sy, chunkSize, chunkSize)
      index += 1
    }, 5)
  }

  useEffect(() => {
    setResolvedSrc(src)
  }, [src])

  useEffect(() => {
    const img = new Image()
    img.src = resolvedSrc
    img.onerror = () => {
      if (resolvedSrc !== fallbackSrc) {
        setResolvedSrc(fallbackSrc)
      }
    }
    img.onload = () => {
      imageRef.current = img
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      if (isOn) {
        drawChunkyReveal(ctx, img)
      } else {
        ctx.clearRect(0, 0, size, size)
      }
    }
  }, [resolvedSrc])

  useEffect(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (intervalIdRef.current) {
      window.clearInterval(intervalIdRef.current)
      intervalIdRef.current = null
    }
    if (clearTimeoutRef.current) {
      window.clearTimeout(clearTimeoutRef.current)
      clearTimeoutRef.current = null
    }

    if (isOn && !prevOnRef.current) {
      drawChunkyReveal(ctx, img)
    } else if (!isOn) {
      clearTimeoutRef.current = window.setTimeout(() => {
        ctx.clearRect(0, 0, size, size)
        clearTimeoutRef.current = null
      }, 700)
    }

    prevOnRef.current = isOn
  }, [isOn, size])

  useEffect(() => {
    return () => {
      if (intervalIdRef.current) {
        window.clearInterval(intervalIdRef.current)
      }
      if (clearTimeoutRef.current) {
        window.clearTimeout(clearTimeoutRef.current)
      }
    }
  }, [])

  return (
    <figure className={`animal-card ${isOn ? 'animal-card-on' : 'animal-card-off'} ${silhouetteMode === 'mask' ? 'animal-card-pixel' : ''}`}>
      <canvas
        ref={canvasRef}
        className="animal-canvas"
        width={size}
        height={size}
        aria-label={label}
      />
      <div
        className="animal-base-image"
        style={{ backgroundImage: `url(${resolvedSrc})` }}
        aria-hidden
      />
    </figure>
  )
}

type CollectionRowProps = {
  title: string
  ribbon: string
  included?: boolean
  items: RewardItem[]
  silhouetteMode: SilhouetteMode
  tileSize: number
}

function LockGlyph({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 3a5 5 0 0 0-5 5v1h2V8a3 3 0 1 1 6 0v2H8v11h11V10h-2v1H10v8h7v-8h-2v-1h-3a2.5 2.5 0 0 0-1 4.79V17h2v-2.21A2.5 2.5 0 0 0 12 10Z"
        fill="currentColor"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        d="M7 10V8a5 5 0 1 1 10 0v2h-2V8a3 3 0 1 0-6 0v2H7Zm-2 1h14v10H5V11Zm7 2a2.5 2.5 0 0 0-1 4.79V19h2v-1.21A2.5 2.5 0 0 0 12 13Z"
        fill="currentColor"
      />
    </svg>
  )
}

function CollectionRow({ title, ribbon, included, items, silhouetteMode, tileSize }: CollectionRowProps) {
  const trackRef = useRef<HTMLElement | null>(null)
  const [columns, setColumns] = useState(12)
  const shuffledItems = useMemo(() => {
    const copy = [...items]
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }, [items])
  const visibleCount = Math.min(shuffledItems.length, Math.max(1, columns) * COLLECTION_ROWS)
  const sampledItems = useMemo(() => shuffledItems.slice(0, visibleCount), [shuffledItems, visibleCount])
  const [litOrder, setLitOrder] = useState<number[]>([])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const gap = 4
    const updateColumns = () => {
      // Use track width but leave room for the scrollbar/padding.
      const width = track.clientWidth - 20
      const next = Math.max(1, Math.floor((Math.max(0, width) + gap) / (tileSize + gap)))
      setColumns(next)
    }
    updateColumns()
    // Using a ResizeObserver on the window since the track size is constrained by the window.
    const observer = new ResizeObserver(() => updateColumns())
    observer.observe(document.body)
    return () => observer.disconnect()
  }, [tileSize])

  useEffect(() => {
    const selected: number[] = []
    while (selected.length < Math.min(ROW_LIT_COUNT, sampledItems.length)) {
      const candidate = Math.floor(Math.random() * sampledItems.length)
      if (!selected.includes(candidate)) selected.push(candidate)
    }
    setLitOrder(selected)
  }, [sampledItems])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setLitOrder((prev) => {
        if (prev.length === 0) return prev
        const onSet = new Set(prev)
        const offIndexes: number[] = []

        for (let i = 0; i < sampledItems.length; i += 1) {
          if (!onSet.has(i)) offIndexes.push(i)
        }
        if (offIndexes.length === 0) return prev

        const toTurnOn = offIndexes[Math.floor(Math.random() * offIndexes.length)]
        const [, ...rest] = prev
        return [...rest, toTurnOn]
      })
    }, 850)

    return () => window.clearInterval(intervalId)
  }, [sampledItems])

  const moreCount = Math.max(0, items.length - visibleCount)

  return (
    <section ref={trackRef} className="collection-track">
      <div className="collection-track-head">
        <div className={`locked-ribbon ${included ? 'locked-ribbon-included' : ''}`}>
          <span className="ribbon-icon" aria-hidden>
            <LockGlyph open={Boolean(included)} />
          </span>
          <span>{ribbon}</span>
        </div>
        <span className="collection-more">+ {moreCount} more</span>
      </div>
      <div
        className="collection-grid"
        style={{ ['--tile-size' as any]: `${tileSize}px`, ['--collection-columns' as any]: columns }}
      >
        {sampledItems.map((item, index) => (
          <AnimatedRewardTile
            key={`${title}-${item.src}-${index}`}
            src={item.src}
            label={item.label}
            isOn={litOrder.includes(index)}
            size={tileSize}
            silhouetteMode={silhouetteMode}
          />
        ))}
      </div>
    </section>
  )
}

function App() {
  const unlockSectionRef = useRef<HTMLElement | null>(null)
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const confettiLauncherRef = useRef<ReturnType<typeof confetti.create> | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [activeShot, setActiveShot] = useState(0)
  const [activeReward, setActiveReward] = useState(0)

  const launchRewardConfetti = () => {
    if (reducedMotion || !confettiLauncherRef.current) return
    const shoot = confettiLauncherRef.current
    shoot({
      particleCount: 160,
      spread: 90,
      startVelocity: 70,
      gravity: 1.1,
      scalar: 0.9,
      origin: { x: 0.5, y: 0.65 },
      colors: confettiColors,
      zIndex: 10
    })
  }

  useEffect(() => {
    // Preload the images to ensure instant rendering when cycling
    unlockRewardExamples.forEach(ex => {
      const img = new Image()
      img.src = ex.src
    })

    const intervalId = window.setInterval(() => {
      setActiveReward((prev) => (prev + 1) % unlockRewardExamples.length)
    }, 1500)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    // Skip firing on the initial mount, but fire on every subsequent cycle
    if (activeReward !== 0) {
      launchRewardConfetti()
    }
  }, [activeReward, reducedMotion])

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotionChange = () => setReducedMotion(motionQuery.matches)

    onMotionChange()
    motionQuery.addEventListener('change', onMotionChange)

    return () => {
      motionQuery.removeEventListener('change', onMotionChange)
    }
  }, [])

  useEffect(() => {
    if (!confettiCanvasRef.current) return
    confettiLauncherRef.current = confetti.create(confettiCanvasRef.current, {
      resize: true,
      useWorker: true,
    })
  }, [])

  const launchConfetti = () => {
    if (reducedMotion || !confettiLauncherRef.current) return
    const shoot = confettiLauncherRef.current
    const bursts = 8

    for (let i = 0; i < bursts; i += 1) {
      const delayMs = i * 120
      const particleCount = 25 + Math.floor(Math.random() * 26)
      const spread = 55 + Math.random() * 45
      const startVelocity = 32 + Math.random() * 30
      const originX = 0.08 + Math.random() * 0.84
      const originY = 0.02 + Math.random() * 0.25
      const angle = 65 + Math.random() * 50

      window.setTimeout(() => {
        shoot({
          particleCount,
          spread,
          startVelocity,
          gravity: 1.05,
          scalar: 0.9 + Math.random() * 0.45,
          drift: -0.8 + Math.random() * 1.6,
          ticks: 280,
          angle,
          origin: { x: originX, y: originY },
          colors: confettiColors,
        })
      }, delayMs)
    }
  }

  useEffect(() => {
    const section = unlockSectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          launchConfetti()
        }
      },
      { threshold: 0.45 },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [reducedMotion])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        setActiveShot((prev) => (prev + 1) % screenshotPaths.length)
      }
      if (event.key === 'ArrowLeft') {
        setActiveShot((prev) => (prev - 1 + screenshotPaths.length) % screenshotPaths.length)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <main className="site">
      <header className="topbar brutal-card">
        <p className="brand">
          <img src="/assets/app_icon.webp" alt="Weight Collector app icon" />
          <span>Weight Collector</span>
        </p>
        <nav className="topbar-store-links">
          <a className="topbar-store-link" href="https://play.google.com/store" target="_blank" rel="noreferrer">
            <span className="store-icon" aria-hidden>
              <img src="/assets/icons/google_play_bw.svg" alt="" />
            </span>
            <span>
              <span className="topbar-store-meta">Get it on</span>
              <span>Google Play</span>
            </span>
          </a>
          <a className="topbar-store-link" href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer">
            <span className="store-icon" aria-hidden>
              <svg viewBox="0 0 24 24" role="img">
                <path
                  d="M15.9 12.3c0-2 1.6-2.9 1.7-3-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.4.8-3 .8-.6 0-1.5-.8-2.5-.8-1.3 0-2.5.8-3.2 2-1.4 2.4-.4 5.9 1 7.9.7 1 1.5 2.2 2.6 2.1 1-.1 1.4-.6 2.6-.6s1.6.6 2.6.6c1.1 0 1.8-1 2.5-2 .7-1 1-2 1-2.1-.1 0-2.3-.9-2.3-3.2Zm-2-6.1c.6-.8 1-1.9.9-3-.9 0-2.1.6-2.8 1.3-.6.7-1.1 1.8-1 2.9 1 .1 2-.5 2.9-1.2Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span>
              <span className="topbar-store-meta">Download on the</span>
              <span>App Store</span>
            </span>
          </a>
        </nav>
      </header>

      <section className="hero brutal-card">
        <div className="hero-copy">
          <p className="kicker hero-kicker">TRACK. UNLOCK. COLLECT.</p>
          <h1>Weight Collector</h1>
          <h2>Every pound of progress unlocks a reward.</h2>
          <p className="lead">
            A bold weight tracker where consistency becomes collectible. Build momentum with visual
            milestones and celebrate each pound with unlockable items.
          </p>
          <div className="hero-store-links">
            <a className="store-link brutal-inset" href="https://play.google.com/store" target="_blank" rel="noreferrer">
              <span className="store-icon" aria-hidden>
                <img src="/assets/icons/google_play_bw.svg" alt="" />
              </span>
              <span>Google Play</span>
            </a>
            <a className="store-link brutal-inset" href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer">
              <span className="store-icon" aria-hidden>
                <svg viewBox="0 0 24 24" role="img">
                  <path
                    d="M15.9 12.3c0-2 1.6-2.9 1.7-3-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.4.8-3 .8-.6 0-1.5-.8-2.5-.8-1.3 0-2.5.8-3.2 2-1.4 2.4-.4 5.9 1 7.9.7 1 1.5 2.2 2.6 2.1 1-.1 1.4-.6 2.6-.6s1.6.6 2.6.6c1.1 0 1.8-1 2.5-2 .7-1 1-2 1-2.1-.1 0-2.3-.9-2.3-3.2Zm-2-6.1c.6-.8 1-1.9.9-3-.9 0-2.1.6-2.8 1.3-.6.7-1.1 1.8-1 2.9 1 .1 2-.5 2.9-1.2Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span>Apple App Store</span>
            </a>
          </div>
        </div>
        <aside className="hero-visual brutal-inset">
          <img src={screenshotPaths[activeShot]} alt={`Main app preview ${activeShot + 1}`} className="hero-screen" />
          <div className="carousel-controls">
            <button
              className="carousel-arrow"
              type="button"
              onClick={() => setActiveShot((prev) => (prev - 1 + screenshotPaths.length) % screenshotPaths.length)}
              aria-label="Previous screenshot"
            >
              ←
            </button>
            <p className="pixel-caption">Screenshot {activeShot + 1} / {screenshotPaths.length}</p>
            <button
              className="carousel-arrow"
              type="button"
              onClick={() => setActiveShot((prev) => (prev + 1) % screenshotPaths.length)}
              aria-label="Next screenshot"
            >
              →
            </button>
          </div>
        </aside>
      </section>

      <section id="features" className="section-block">
        <p className="kicker">WHY IT WORKS</p>
        <h2 className="section-title">Big motivation. Tiny daily actions.</h2>
        <div className="grid-3">
          {featureCards.map((feature) => (
            <article className="feature brutal-card" key={feature.title}>
              <div className="feature-icon" aria-hidden>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="unlock" className="unlock-section brutal-card" ref={unlockSectionRef}>
        <canvas className="confetti-canvas" ref={confettiCanvasRef} aria-hidden />
        <button
          className="btn unlock-launch-btn"
          type="button"
          onClick={() => {
            launchConfetti()
          }}
        >
          Launch Confetti
        </button>
        <div className="unlock-content">
          <p className="kicker kicker-light">UNLOCK EVENT</p>
          <h2 className="section-title">Reward Unlocked</h2>
          <p className="lead">
            Every pound can pop confetti and add a new collectible to your vault.
            This is where tracking feels like gameplay.
          </p>
          <div className="unlock-card brutal-inset">
            <div className="unlock-art-frame" aria-hidden>
              <img
                className="unlock-art-image"
                src={unlockRewardExamples[activeReward].src}
                alt=""
              />
              <img
                className="unlock-art-overlay"
                src={unlockRewardExamples[activeReward].isClay ? '/assets/clay_frame.png' : '/assets/pixel_frame.png'}
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-block reward-section">
        <p className="kicker">REWARD COLLECTION</p>
        <h2 className="section-title">Collect them all!</h2>
        <div className="locked-collections">
          {rewardCollections.map((collection) => (
            <CollectionRow
              key={collection.id}
              title={collection.title}
              ribbon={collection.ribbon}
              included={collection.included}
              items={collection.items}
              silhouetteMode={collection.silhouetteMode}
              tileSize={128}
            />
          ))}
        </div>
      </section>

      <footer id="stores" className="footer-panel brutal-card">
        <div className="footer-grid">
          <div>
            <p className="kicker">WEIGHT COLLECTOR</p>
            <h2 className="section-title">Built for momentum, designed like a game.</h2>
            <p className="stores-lead">
              Track progress, unlock rewards, and keep your streak alive. Download links are in the top section.
            </p>
          </div>
          <div className="footer-links">
            <a href="mailto:your@email.com">Email Me</a>
            <a href="https://x.com/yourhandle" target="_blank" rel="noreferrer">Message on X</a>
            <a href="https://www.linkedin.com/in/yourhandle/" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://calendly.com/yourhandle" target="_blank" rel="noreferrer">Book a Call</a>
          </div>
        </div>
        <p className="footer-note">2026 Weight Collector. All rights reserved.</p>
      </footer>
    </main>
  )
}

export default App
