// canvas-confetti v1.9.3 built on 2024-04-30T22:19:17.794Z
// TypeScript conversion

interface RGB {
  r: number
  g: number
  b: number
}

interface Origin {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

interface PathShape {
  type: 'path'
  path: string
  matrix: number[]
}

interface BitmapShape {
  type: 'bitmap'
  bitmap: ImageBitmap
  matrix: number[]
}

type Shape = string | PathShape | BitmapShape

interface Fetti {
  x: number
  y: number
  wobble: number
  wobbleSpeed: number
  velocity: number
  angle2D: number
  tiltAngle: number
  color: RGB
  shape: Shape
  tick: number
  totalTicks: number
  decay: number
  drift: number
  random: number
  tiltSin: number
  tiltCos: number
  wobbleX: number
  wobbleY: number
  gravity: number
  ovalScalar: number
  scalar: number
  flat: boolean
}

interface PhysicsOptions {
  x: number
  y: number
  angle: number
  spread: number
  startVelocity: number
  color: RGB
  shape: Shape
  ticks: number
  decay: number
  gravity: number
  drift: number
  scalar: number
  flat: boolean
}

interface ConfettiOptions {
  particleCount?: number
  angle?: number
  spread?: number
  startVelocity?: number
  decay?: number
  gravity?: number
  drift?: number
  ticks?: number
  x?: number
  y?: number
  shapes?: Shape[]
  zIndex?: number
  colors?: string[]
  disableForReducedMotion?: boolean
  scalar?: number
  flat?: boolean
  origin?: Partial<Origin>
}

interface GlobalOptions {
  resize?: boolean
  disableForReducedMotion?: boolean
  useWorker?: boolean
}

interface PathData {
  path: string
  matrix?: number[]
}

interface TextData {
  text: string
  scalar?: number
  fontFamily?: string
  color?: string
}

interface AnimationObject {
  addFettis: (fettis: Fetti[]) => Promise<void> | null
  canvas: HTMLCanvasElement | OffscreenCanvas
  promise: Promise<void> | null
  reset: () => void
}

interface ConfettiFire {
  (options?: ConfettiOptions): Promise<void> | null
  reset: () => void
}

interface DecoratedWorker extends Worker {
  init: (canvas: HTMLCanvasElement) => void
  fire: (options: ConfettiOptions | undefined, size: Size, done: () => void) => Promise<void> | null
  reset: () => void
}

interface BitmapMapper {
  transform: (bitmap: ImageBitmap) => ImageBitmap | OffscreenCanvas
  clear: () => void
}

interface Raf {
  frame: (cb: () => void) => number | ReturnType<typeof setTimeout>
  cancel: (id: number | ReturnType<typeof setTimeout>) => void
}

interface ModuleExports {
  (options?: ConfettiOptions): Promise<void> | null
  reset: () => void
  create: (canvas: HTMLCanvasElement | null, globalOpts?: GlobalOptions) => ConfettiFire
  shapeFromPath: (pathData: string | PathData) => PathShape
  shapeFromText: (textData: string | TextData) => BitmapShape
  Promise?: PromiseConstructor
}

const module: { exports: ModuleExports } = {} as { exports: ModuleExports }

// source content
;(function main(
  global: typeof globalThis & { Worker?: typeof Worker; Blob?: typeof Blob; Promise?: PromiseConstructor; OffscreenCanvas?: typeof OffscreenCanvas; OffscreenCanvasRenderingContext2D?: typeof OffscreenCanvasRenderingContext2D; HTMLCanvasElement?: typeof HTMLCanvasElement; URL?: typeof URL },
  moduleObj: { exports: ModuleExports },
  isWorker: boolean,
  workerSize: Size,
) {
  const canUseWorker = !!(
    global.Worker &&
    global.Blob &&
    global.Promise &&
    global.OffscreenCanvas &&
    global.OffscreenCanvasRenderingContext2D &&
    global.HTMLCanvasElement &&
    global.HTMLCanvasElement.prototype.transferControlToOffscreen &&
    global.URL &&
    global.URL.createObjectURL
  )

  const canUsePaths = typeof Path2D === 'function' && typeof DOMMatrix === 'function'
  const canDrawBitmap = (() => {
    // this mostly supports ssr
    if (!global.OffscreenCanvas) {
      return false
    }

    const canvas = new OffscreenCanvas(1, 1)
    const ctx = canvas.getContext('2d')
    if (!ctx) return false
    ctx.fillRect(0, 0, 1, 1)
    const bitmap = canvas.transferToImageBitmap()

    try {
      ctx.createPattern(bitmap, 'no-repeat')
    } catch {
      return false
    }

    return true
  })()

  function noop(): void {}

  // create a promise if it exists, otherwise, just
  // call the function directly
  function promise(func: (resolve: () => void, reject: () => void) => void): Promise<void> | null {
    const ModulePromise = moduleObj.exports.Promise
    const Prom = ModulePromise !== void 0 ? ModulePromise : global.Promise

    if (typeof Prom === 'function') {
      return new Prom(func)
    }

    func(noop, noop)

    return null
  }

  const bitmapMapper: BitmapMapper = ((skipTransform: boolean, map: Map<ImageBitmap, OffscreenCanvas>) => {
    // see https://github.com/catdad/canvas-confetti/issues/209
    // creating canvases is actually pretty expensive, so we should create a
    // 1:1 map for bitmap:canvas, so that we can animate the confetti in
    // a performant manner, but also not store them forever so that we don't
    // have a memory leak
    return {
      transform: (bitmap: ImageBitmap): ImageBitmap | OffscreenCanvas => {
        if (skipTransform) {
          return bitmap
        }

        if (map.has(bitmap)) {
          return map.get(bitmap)!
        }

        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(bitmap, 0, 0)
        }

        map.set(bitmap, canvas)

        return canvas
      },
      clear: () => {
        map.clear()
      },
    }
  })(canDrawBitmap, new Map())

  const raf: Raf = (() => {
    const TIME = Math.floor(1000 / 60)
    let frame: (cb: () => void) => number | ReturnType<typeof setTimeout>
    let cancel: (id: number | ReturnType<typeof setTimeout>) => void
    const frames: Record<string, number> = {}
    let lastFrameTime = 0

    if (typeof requestAnimationFrame === 'function' && typeof cancelAnimationFrame === 'function') {
      frame = (cb: () => void) => {
        const id = Math.random()

        frames[id] = requestAnimationFrame(function onFrame(time: number) {
          if (lastFrameTime === time || lastFrameTime + TIME - 1 < time) {
            lastFrameTime = time
            delete frames[id]

            cb()
          } else {
            frames[id] = requestAnimationFrame(onFrame)
          }
        })

        return id
      }
      cancel = (id: number | ReturnType<typeof setTimeout>) => {
        if (frames[id as number]) {
          cancelAnimationFrame(frames[id as number])
        }
      }
    } else {
      frame = (cb: () => void) => setTimeout(cb, TIME)
      cancel = (timer: number | ReturnType<typeof setTimeout>) => clearTimeout(timer)
    }

    return { frame: frame, cancel: cancel }
  })()

  const getWorker = (() => {
    let worker: DecoratedWorker | null
    let prom: Promise<void> | null
    const resolves: Record<string, () => void> = {}

    function decorate(w: Worker): void {
      const decoratedWorker = w as DecoratedWorker
      function execute(options: ConfettiOptions | undefined, callback: string | null): void {
        decoratedWorker.postMessage({ options: options || {}, callback: callback })
      }
      decoratedWorker.init = function initWorker(canvas: HTMLCanvasElement): void {
        const offscreen = canvas.transferControlToOffscreen()
        decoratedWorker.postMessage({ canvas: offscreen }, [offscreen])
      }

      decoratedWorker.fire = function fireWorker(
        options: ConfettiOptions | undefined,
        _size: Size,
        done: () => void,
      ): Promise<void> | null {
        if (prom) {
          execute(options, null)
          return prom
        }

        const id = Math.random().toString(36).slice(2)

        prom = promise((resolve) => {
          function workerDone(msg: MessageEvent): void {
            if (msg.data.callback !== id) {
              return
            }

            delete resolves[id]
            decoratedWorker.removeEventListener('message', workerDone)

            prom = null

            bitmapMapper.clear()

            done()
            resolve()
          }

          decoratedWorker.addEventListener('message', workerDone)
          execute(options, id)

          resolves[id] = workerDone.bind(null, { data: { callback: id } } as MessageEvent)
        })

        return prom
      }
      decoratedWorker.reset = function resetWorker(): void {
        decoratedWorker.postMessage({ reset: true })

        for (const id in resolves) {
          resolves[id]()
          delete resolves[id]
        }
      }
    }

    return (): DecoratedWorker | null => {
      if (worker) {
        return worker
      }

      if (!isWorker && canUseWorker) {
        const code = [
          'var CONFETTI, SIZE = {}, module = {};',
          '(' + main.toString() + ')(this, module, true, SIZE);',
          'onmessage = function(msg) {',
          '  if (msg.data.options) {',
          '    CONFETTI(msg.data.options).then(function () {',
          '      if (msg.data.callback) {',
          '        postMessage({ callback: msg.data.callback });',
          '      }',
          '    });',
          '  } else if (msg.data.reset) {',
          '    CONFETTI && CONFETTI.reset();',
          '  } else if (msg.data.resize) {',
          '    SIZE.width = msg.data.resize.width;',
          '    SIZE.height = msg.data.resize.height;',
          '  } else if (msg.data.canvas) {',
          '    SIZE.width = msg.data.canvas.width;',
          '    SIZE.height = msg.data.canvas.height;',
          '    CONFETTI = module.exports.create(msg.data.canvas);',
          '  }',
          '}',
        ].join('\n')
        try {
          worker = new Worker(URL.createObjectURL(new Blob([code]))) as DecoratedWorker
        } catch (e) {
          // eslint-disable-next-line no-console
          typeof console !== 'undefined' && typeof console.warn === 'function'
            ? console.warn('🎊 Could not load worker', e)
            : null

          return null
        }

        decorate(worker)
      }

      return worker ?? null
    }
  })()

  const defaults: Required<Omit<ConfettiOptions, 'origin' | 'flat'>> & { x: number; y: number } = {
    particleCount: 50,
    angle: 90,
    spread: 45,
    startVelocity: 45,
    decay: 0.9,
    gravity: 1,
    drift: 0,
    ticks: 200,
    x: 0.5,
    y: 0.5,
    shapes: ['square', 'circle'],
    zIndex: 100,
    colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
    // probably should be true, but back-compat
    disableForReducedMotion: false,
    scalar: 1,
  }

  function convert<T, U>(val: T, transform?: (v: T) => U): T | U {
    return transform ? transform(val) : val
  }

  function isOk<T>(val: T): boolean {
    return !(val === null || val === undefined)
  }

  function prop<K extends keyof typeof defaults>(
    options: ConfettiOptions | undefined,
    name: K,
    transform?: (v: (typeof defaults)[K]) => (typeof defaults)[K],
  ): (typeof defaults)[K] {
    return convert(
      options && isOk((options as Record<string, unknown>)[name])
        ? ((options as Record<string, unknown>)[name] as (typeof defaults)[K])
        : defaults[name],
      transform,
    ) as (typeof defaults)[K]
  }

  function onlyPositiveInt(number: number): number {
    return number < 0 ? 0 : Math.floor(number)
  }

  function randomInt(min: number, max: number): number {
    // [min, max)
    return Math.floor(Math.random() * (max - min)) + min
  }

  function toDecimal(str: string): number {
    return parseInt(str, 16)
  }

  function colorsToRgb(colors: string[]): RGB[] {
    return colors.map(hexToRgb)
  }

  function hexToRgb(str: string): RGB {
    let val = String(str).replace(/[^0-9a-f]/gi, '')

    if (val.length < 6) {
      val = val[0] + val[0] + val[1] + val[1] + val[2] + val[2]
    }

    return {
      r: toDecimal(val.substring(0, 2)),
      g: toDecimal(val.substring(2, 4)),
      b: toDecimal(val.substring(4, 6)),
    }
  }

  function getOrigin(options: ConfettiOptions | undefined): Origin {
    const origin = prop(options, 'origin' as keyof typeof defaults, Object) as unknown as Partial<Origin> | undefined
    const result: Origin = {
      x: origin && isOk(origin.x) ? origin.x : defaults.x,
      y: origin && isOk(origin.y) ? origin.y : defaults.y,
    }

    return result
  }

  function setCanvasWindowSize(canvas: HTMLCanvasElement): void {
    canvas.width = document.documentElement.clientWidth
    canvas.height = document.documentElement.clientHeight
  }

  function setCanvasRectSize(canvas: HTMLCanvasElement | { getBoundingClientRect: () => DOMRect; width?: number; height?: number }): void {
    const rect = canvas.getBoundingClientRect()
    ;(canvas as { width: number }).width = rect.width
    ;(canvas as { height: number }).height = rect.height
  }

  function getCanvas(zIndex: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas')

    canvas.style.position = 'fixed'
    canvas.style.top = '0px'
    canvas.style.left = '0px'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = String(zIndex)

    return canvas
  }

  function ellipse(
    context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    _antiClockwise?: boolean,
  ): void {
    context.save()
    context.translate(x, y)
    context.rotate(rotation)
    context.scale(radiusX, radiusY)
    context.arc(0, 0, 1, startAngle, endAngle, _antiClockwise)
    context.restore()
  }

  function randomPhysics(opts: PhysicsOptions): Fetti {
    const radAngle = opts.angle * (Math.PI / 180)
    const radSpread = opts.spread * (Math.PI / 180)

    return {
      x: opts.x,
      y: opts.y,
      wobble: Math.random() * 10,
      wobbleSpeed: Math.min(0.11, Math.random() * 0.1 + 0.05),
      velocity: opts.startVelocity * 0.5 + Math.random() * opts.startVelocity,
      angle2D: -radAngle + (0.5 * radSpread - Math.random() * radSpread),
      tiltAngle: (Math.random() * (0.75 - 0.25) + 0.25) * Math.PI,
      color: opts.color,
      shape: opts.shape,
      tick: 0,
      totalTicks: opts.ticks,
      decay: opts.decay,
      drift: opts.drift,
      random: Math.random() + 2,
      tiltSin: 0,
      tiltCos: 0,
      wobbleX: 0,
      wobbleY: 0,
      gravity: opts.gravity * 3,
      ovalScalar: 0.6,
      scalar: opts.scalar,
      flat: opts.flat,
    }
  }

  function updateFetti(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, fetti: Fetti): boolean {
    fetti.x += Math.cos(fetti.angle2D) * fetti.velocity + fetti.drift
    fetti.y += Math.sin(fetti.angle2D) * fetti.velocity + fetti.gravity
    fetti.velocity *= fetti.decay

    if (fetti.flat) {
      fetti.wobble = 0
      fetti.wobbleX = fetti.x + 10 * fetti.scalar
      fetti.wobbleY = fetti.y + 10 * fetti.scalar

      fetti.tiltSin = 0
      fetti.tiltCos = 0
      fetti.random = 1
    } else {
      fetti.wobble += fetti.wobbleSpeed
      fetti.wobbleX = fetti.x + 10 * fetti.scalar * Math.cos(fetti.wobble)
      fetti.wobbleY = fetti.y + 10 * fetti.scalar * Math.sin(fetti.wobble)

      fetti.tiltAngle += 0.1
      fetti.tiltSin = Math.sin(fetti.tiltAngle)
      fetti.tiltCos = Math.cos(fetti.tiltAngle)
      fetti.random = Math.random() + 2
    }

    const progress = fetti.tick++ / fetti.totalTicks

    const x1 = fetti.x + fetti.random * fetti.tiltCos
    const y1 = fetti.y + fetti.random * fetti.tiltSin
    const x2 = fetti.wobbleX + fetti.random * fetti.tiltCos
    const y2 = fetti.wobbleY + fetti.random * fetti.tiltSin

    context.fillStyle =
      'rgba(' +
      fetti.color.r +
      ', ' +
      fetti.color.g +
      ', ' +
      fetti.color.b +
      ', ' +
      (1 - progress) +
      ')'

    context.beginPath()

    const shape = fetti.shape as Shape
    if (
      canUsePaths &&
      typeof shape === 'object' &&
      shape.type === 'path' &&
      typeof shape.path === 'string' &&
      Array.isArray(shape.matrix)
    ) {
      context.fill(
        transformPath2D(
          shape.path,
          shape.matrix,
          fetti.x,
          fetti.y,
          Math.abs(x2 - x1) * 0.1,
          Math.abs(y2 - y1) * 0.1,
          (Math.PI / 10) * fetti.wobble,
        ),
      )
    } else if (typeof shape === 'object' && shape.type === 'bitmap') {
      const rotation = (Math.PI / 10) * fetti.wobble
      const scaleX = Math.abs(x2 - x1) * 0.1
      const scaleY = Math.abs(y2 - y1) * 0.1
      const width = shape.bitmap.width * fetti.scalar
      const height = shape.bitmap.height * fetti.scalar

      const matrix = new DOMMatrix([
        Math.cos(rotation) * scaleX,
        Math.sin(rotation) * scaleX,
        -Math.sin(rotation) * scaleY,
        Math.cos(rotation) * scaleY,
        fetti.x,
        fetti.y,
      ])

      // apply the transform matrix from the confetti shape
      matrix.multiplySelf(new DOMMatrix(shape.matrix))

      const pattern = context.createPattern(bitmapMapper.transform(shape.bitmap) as CanvasImageSource, 'no-repeat')
      if (pattern) {
        pattern.setTransform(matrix)

        context.globalAlpha = 1 - progress
        context.fillStyle = pattern
        context.fillRect(fetti.x - width / 2, fetti.y - height / 2, width, height)
        context.globalAlpha = 1
      }
    } else if (shape === 'circle') {
      context.ellipse
        ? context.ellipse(
            fetti.x,
            fetti.y,
            Math.abs(x2 - x1) * fetti.ovalScalar,
            Math.abs(y2 - y1) * fetti.ovalScalar,
            (Math.PI / 10) * fetti.wobble,
            0,
            2 * Math.PI,
          )
        : ellipse(
            context,
            fetti.x,
            fetti.y,
            Math.abs(x2 - x1) * fetti.ovalScalar,
            Math.abs(y2 - y1) * fetti.ovalScalar,
            (Math.PI / 10) * fetti.wobble,
            0,
            2 * Math.PI,
          )
    } else if (shape === 'star') {
      let rot = (Math.PI / 2) * 3
      const innerRadius = 4 * fetti.scalar
      const outerRadius = 8 * fetti.scalar
      let starX = fetti.x
      let starY = fetti.y
      let spikes = 5
      const step = Math.PI / spikes

      while (spikes--) {
        starX = fetti.x + Math.cos(rot) * outerRadius
        starY = fetti.y + Math.sin(rot) * outerRadius
        context.lineTo(starX, starY)
        rot += step

        starX = fetti.x + Math.cos(rot) * innerRadius
        starY = fetti.y + Math.sin(rot) * innerRadius
        context.lineTo(starX, starY)
        rot += step
      }
    } else {
      context.moveTo(Math.floor(fetti.x), Math.floor(fetti.y))
      context.lineTo(Math.floor(fetti.wobbleX), Math.floor(y1))
      context.lineTo(Math.floor(x2), Math.floor(y2))
      context.lineTo(Math.floor(x1), Math.floor(fetti.wobbleY))
    }

    context.closePath()
    context.fill()

    return fetti.tick < fetti.totalTicks
  }

  function animate(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    fettis: Fetti[],
    resizer: (canvas: HTMLCanvasElement) => void,
    size: Size,
    done: () => void,
  ): AnimationObject {
    let animatingFettis = fettis.slice()
    const context = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
    let animationFrame: number | ReturnType<typeof setTimeout> | null
    let destroy: (() => void) | null

    const prom = promise((resolve) => {
      function onDone(): void {
        animationFrame = destroy = null

        context.clearRect(0, 0, size.width, size.height)
        bitmapMapper.clear()

        done()
        resolve()
      }

      function update(): void {
        if (isWorker && !(size.width === workerSize.width && size.height === workerSize.height)) {
          size.width = canvas.width = workerSize.width
          size.height = canvas.height = workerSize.height
        }

        if (!size.width && !size.height) {
          resizer(canvas as HTMLCanvasElement)
          size.width = canvas.width
          size.height = canvas.height
        }

        context.clearRect(0, 0, size.width, size.height)

        animatingFettis = animatingFettis.filter((fetti) => updateFetti(context, fetti))

        if (animatingFettis.length) {
          animationFrame = raf.frame(update)
        } else {
          onDone()
        }
      }

      animationFrame = raf.frame(update)
      destroy = onDone
    })

    return {
      addFettis: (newFettis: Fetti[]) => {
        animatingFettis = animatingFettis.concat(newFettis)

        return prom
      },
      canvas: canvas,
      promise: prom,
      reset: () => {
        if (animationFrame) {
          raf.cancel(animationFrame)
        }

        if (destroy) {
          destroy()
        }
      },
    }
  }

  function confettiCannon(canvas: HTMLCanvasElement | null, globalOpts?: GlobalOptions): ConfettiFire {
    const isLibCanvas = !canvas
    const allowResize = !!prop(globalOpts || {}, 'resize' as keyof typeof defaults)
    let hasResizeEventRegistered = false
    const globalDisableForReducedMotion = prop(globalOpts as ConfettiOptions, 'disableForReducedMotion', Boolean as unknown as (v: boolean) => boolean)
    const shouldUseWorker = canUseWorker && !!prop(globalOpts || {}, 'useWorker' as keyof typeof defaults)
    const worker = shouldUseWorker ? getWorker() : null
    const resizer = isLibCanvas ? setCanvasWindowSize : setCanvasRectSize
    let initialized = canvas && worker ? !!(canvas as HTMLCanvasElement & { __confetti_initialized?: boolean }).__confetti_initialized : false
    const preferLessMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion)').matches
    let animationObj: AnimationObject | null
    let canvasRef = canvas

    function fireLocal(options: ConfettiOptions | undefined, size: Size, done: () => void): Promise<void> | null {
      const particleCount = prop(options, 'particleCount', onlyPositiveInt)
      const angle = prop(options, 'angle', Number)
      const spread = prop(options, 'spread', Number)
      const startVelocity = prop(options, 'startVelocity', Number)
      const decay = prop(options, 'decay', Number)
      const gravity = prop(options, 'gravity', Number)
      const drift = prop(options, 'drift', Number)
      const colors = prop(options, 'colors', colorsToRgb as unknown as (v: string[]) => string[]) as unknown as RGB[]
      const ticks = prop(options, 'ticks', Number)
      const shapes = prop(options, 'shapes') as Shape[]
      const scalar = prop(options, 'scalar') as number
      const flat = !!prop(options, 'flat' as keyof typeof defaults)
      const origin = getOrigin(options)

      let temp = particleCount
      const fettis: Fetti[] = []

      const startX = canvasRef!.width * origin.x
      const startY = canvasRef!.height * origin.y

      while (temp--) {
        fettis.push(
          randomPhysics({
            x: startX,
            y: startY,
            angle: angle,
            spread: spread,
            startVelocity: startVelocity,
            color: colors[temp % colors.length],
            shape: shapes[randomInt(0, shapes.length)],
            ticks: ticks,
            decay: decay,
            gravity: gravity,
            drift: drift,
            scalar: scalar,
            flat: flat,
          }),
        )
      }

      // if we have a previous canvas already animating,
      // add to it
      if (animationObj) {
        return animationObj.addFettis(fettis)
      }

      animationObj = animate(canvasRef!, fettis, resizer as (canvas: HTMLCanvasElement) => void, size, done)

      return animationObj.promise
    }

    function fire(options?: ConfettiOptions): Promise<void> | null {
      const disableForReducedMotion =
        globalDisableForReducedMotion || prop(options, 'disableForReducedMotion', Boolean as unknown as (v: boolean) => boolean)
      const zIndex = prop(options, 'zIndex', Number)

      if (disableForReducedMotion && preferLessMotion) {
        return promise((resolve) => {
          resolve()
        })
      }

      if (isLibCanvas && animationObj) {
        // use existing canvas from in-progress animation
        canvasRef = animationObj.canvas as HTMLCanvasElement
      } else if (isLibCanvas && !canvasRef) {
        // create and initialize a new canvas
        canvasRef = getCanvas(zIndex)
        document.body.appendChild(canvasRef)
      }

      if (allowResize && !initialized) {
        // initialize the size of a user-supplied canvas
        resizer(canvasRef as HTMLCanvasElement)
      }

      const size: Size = {
        width: canvasRef!.width,
        height: canvasRef!.height,
      }

      if (worker && !initialized) {
        worker.init(canvasRef as HTMLCanvasElement)
      }

      initialized = true

      if (worker) {
        ;(canvasRef as HTMLCanvasElement & { __confetti_initialized?: boolean }).__confetti_initialized = true
      }

      function onResize(): void {
        if (worker) {
          // TODO this really shouldn't be immediate, because it is expensive
          const obj: { getBoundingClientRect: () => DOMRect | undefined; width?: number; height?: number } = {
            getBoundingClientRect: () => {
              if (!isLibCanvas) {
                return (canvasRef as HTMLCanvasElement).getBoundingClientRect()
              }
              return undefined
            },
          }

          resizer(obj as HTMLCanvasElement)

          worker.postMessage({
            resize: {
              width: obj.width,
              height: obj.height,
            },
          })
          return
        }

        // don't actually query the size here, since this
        // can execute frequently and rapidly
        size.width = size.height = 0
      }

      function done(): void {
        animationObj = null

        if (allowResize) {
          hasResizeEventRegistered = false
          global.removeEventListener?.('resize', onResize)
        }

        if (isLibCanvas && canvasRef) {
          if (document.body.contains(canvasRef)) {
            document.body.removeChild(canvasRef)
          }
          canvasRef = null
          initialized = false
        }
      }

      if (allowResize && !hasResizeEventRegistered) {
        hasResizeEventRegistered = true
        global.addEventListener?.('resize', onResize, false)
      }

      if (worker) {
        return worker.fire(options, size, done)
      }

      return fireLocal(options, size, done)
    }

    fire.reset = (): void => {
      if (worker) {
        worker.reset()
      }

      if (animationObj) {
        animationObj.reset()
      }
    }

    return fire
  }

  // Make default export lazy to defer worker creation until called.
  let defaultFire: ConfettiFire | null
  function getDefaultFire(): ConfettiFire {
    if (!defaultFire) {
      defaultFire = confettiCannon(null, { useWorker: true, resize: true })
    }
    return defaultFire
  }

  function transformPath2D(
    pathString: string,
    pathMatrix: number[],
    x: number,
    y: number,
    scaleX: number,
    scaleY: number,
    rotation: number,
  ): Path2D {
    const path2d = new Path2D(pathString)

    const t1 = new Path2D()
    t1.addPath(path2d, new DOMMatrix(pathMatrix))

    const t2 = new Path2D()
    // see https://developer.mozilla.org/en-US/docs/Web/API/DOMMatrix/DOMMatrix
    t2.addPath(
      t1,
      new DOMMatrix([
        Math.cos(rotation) * scaleX,
        Math.sin(rotation) * scaleX,
        -Math.sin(rotation) * scaleY,
        Math.cos(rotation) * scaleY,
        x,
        y,
      ]),
    )

    return t2
  }

  function shapeFromPath(pathData: string | PathData): PathShape {
    if (!canUsePaths) {
      throw new Error('path confetti are not supported in this browser')
    }

    let path: string
    let matrix: number[] | undefined

    if (typeof pathData === 'string') {
      path = pathData
    } else {
      path = pathData.path
      matrix = pathData.matrix
    }

    const path2d = new Path2D(path)
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')

    if (!matrix && tempCtx) {
      // attempt to figure out the width of the path, up to 1000x1000
      const maxSize = 1000
      let minX = maxSize
      let minY = maxSize
      let maxX = 0
      let maxY = 0

      // do some line skipping... this is faster than checking
      // every pixel and will be mostly still correct
      for (let x = 0; x < maxSize; x += 2) {
        for (let y = 0; y < maxSize; y += 2) {
          if (tempCtx.isPointInPath(path2d, x, y, 'nonzero')) {
            minX = Math.min(minX, x)
            minY = Math.min(minY, y)
            maxX = Math.max(maxX, x)
            maxY = Math.max(maxY, y)
          }
        }
      }

      const width = maxX - minX
      const height = maxY - minY

      const maxDesiredSize = 10
      const scale = Math.min(maxDesiredSize / width, maxDesiredSize / height)

      matrix = [
        scale,
        0,
        0,
        scale,
        -Math.round(width / 2 + minX) * scale,
        -Math.round(height / 2 + minY) * scale,
      ]
    }

    return {
      type: 'path',
      path: path,
      matrix: matrix || [1, 0, 0, 1, 0, 0],
    }
  }

  function shapeFromText(textData: string | TextData): BitmapShape {
    let text: string
    let scalar = 1
    let color = '#000000'
    // see https://nolanlawson.com/2022/04/08/the-struggle-of-using-native-emoji-on-the-web/
    let fontFamily =
      '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif'

    if (typeof textData === 'string') {
      text = textData
    } else {
      text = textData.text
      scalar = 'scalar' in textData ? textData.scalar! : scalar
      fontFamily = 'fontFamily' in textData ? textData.fontFamily! : fontFamily
      color = 'color' in textData ? textData.color! : color
    }

    // all other confetti are 10 pixels,
    // so this pixel size is the de-facto 100% scale confetti
    const fontSize = 10 * scalar
    const font = '' + fontSize + 'px ' + fontFamily

    let canvas = new OffscreenCanvas(fontSize, fontSize)
    let ctx = canvas.getContext('2d')!

    ctx.font = font
    const size = ctx.measureText(text)
    const width = Math.ceil(size.actualBoundingBoxRight + size.actualBoundingBoxLeft)
    const height = Math.ceil(size.actualBoundingBoxAscent + size.actualBoundingBoxDescent)

    const padding = 2
    const x = size.actualBoundingBoxLeft + padding
    const y = size.actualBoundingBoxAscent + padding
    const finalWidth = width + padding + padding
    const finalHeight = height + padding + padding

    canvas = new OffscreenCanvas(finalWidth, finalHeight)
    ctx = canvas.getContext('2d')!
    ctx.font = font
    ctx.fillStyle = color

    ctx.fillText(text, x, y)

    const scale = 1 / scalar

    return {
      type: 'bitmap',
      // TODO these probably need to be transferred for workers
      bitmap: canvas.transferToImageBitmap(),
      matrix: [scale, 0, 0, scale, (-finalWidth * scale) / 2, (-finalHeight * scale) / 2],
    }
  }

  moduleObj.exports = function (this: unknown, ...args: [ConfettiOptions?]): Promise<void> | null {
    return getDefaultFire().apply(this, args)
  } as ModuleExports
  moduleObj.exports.reset = (): void => {
    getDefaultFire().reset()
  }
  moduleObj.exports.create = confettiCannon
  moduleObj.exports.shapeFromPath = shapeFromPath
  moduleObj.exports.shapeFromText = shapeFromText
})(
  (function () {
    if (typeof window !== 'undefined') {
      return window
    }

    if (typeof self !== 'undefined') {
      return self
    }

    return globalThis || {}
  })(),
  module,
  false,
  { width: 0, height: 0 },
)

// end source content

export default module.exports
export const create = module.exports.create
export const shapeFromPath = module.exports.shapeFromPath
export const shapeFromText = module.exports.shapeFromText
export const reset = module.exports.reset
export type { ConfettiOptions, GlobalOptions, PathShape, BitmapShape, Shape, PathData, TextData }
