declare module 'animejs' {
  interface AnimeParams {
    targets?: any
    duration?: number
    delay?: number | ((el: any, i: number) => number)
    easing?: string
    loop?: boolean | number
    direction?: 'normal' | 'reverse' | 'alternate'
    complete?: (anim: AnimeInstance) => void
    update?: (anim: AnimeInstance) => void
    [prop: string]: any
  }

  interface AnimeInstance {
    play(): void
    pause(): void
    restart(): void
    reverse(): void
    seek(time: number): void
    finished: Promise<void>
  }

  function anime(params: AnimeParams): AnimeInstance
  export = anime
}
