import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

type Rect = readonly [x: number, y: number, w: number, h: number];
interface PieceDef {
  readonly id: string;
  readonly rects: readonly Rect[];
}
interface Dot {
  x: number;
  y: number;
  r: number;
}

@Component({
  selector: 'app-modern-trust-loading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modern-trust-loading.html',
  styleUrl: './modern-trust-loading.css',
})
export class ModernTrustLoading implements AfterViewInit, OnDestroy {
  // ---------- Inputs ----------
  readonly autoplay = input(true);
  readonly loop = input(false);
  readonly primaryText = input('TRUST');
  readonly accentText = input('BI');
  readonly tagline = input('');
  readonly showWordmark = input(true);
  readonly markSize = input('clamp(100px, 13vh, 140px)');

  // ---------- Output ----------
  readonly finished = output<void>();

  // ---------- Theme (auto-switches on accentText) ----------
  private readonly route = inject(ActivatedRoute, { optional: true });

  readonly effectiveAccentText = computed(() => {
    const routeAccent = this.route?.snapshot?.data?.['accentText'] as string | undefined;
    return routeAccent ?? this.accentText();
  });

  readonly theme = computed(() =>
    this.effectiveAccentText() === 'AI'
      ? { start: '#2E1065', mid: '#7C3AED', end: '#A855F7', accent: '#A855F7' }
      : { start: '#6B1200', mid: '#E0631B', end: '#F4A020', accent: '#F4A020' }
  );

  // ---------- Derived ----------
  readonly primaryChars = computed(() => this.primaryText().split(''));
  readonly accentChars = computed(() => this.effectiveAccentText().split(''));

  private readonly uid = 'ts' + Math.random().toString(36).slice(2, 8);
  gid(name: string): string { return `${this.uid}-${name}`; }
  fill(name: string): string { return `url(#${this.uid}-${name})`; }

  private readonly hostRef = inject(ElementRef<HTMLElement>);
  private running: Animation[] = [];
  private timers: ReturnType<typeof setTimeout>[] = [];
  private destroyed = signal(false);
  private playGen = 0;

  // ---------- Geometry ----------
  readonly core: readonly Rect[] = [
    [25, 241, 22, 21],
    [46, 241, 22, 240],
    [25, 196, 87, 21],
    [91, 196, 21, 285],
    [25, 152, 131, 21],
    [135, 152, 21, 329],
    [25, 108, 175, 21],
    [179, 108, 21, 373],
    [224, 84, 22, 397],
    [25, 63, 221, 21],
  ];

  readonly pieces: readonly PieceDef[] = [
    { id: 'p7', rects: [[245, 63, 220, 21]] },
    { id: 'p1', rects: [[245, 84, 22, 397]] },
    { id: 'p2', rects: [[290, 108, 21, 373], [290, 108, 175, 21]] },
    { id: 'p3', rects: [[334, 152, 21, 329], [334, 152, 131, 21]] },
    { id: 'p4', rects: [[378, 196, 21, 285], [378, 196, 87, 21]] },
    { id: 'p5', rects: [[422, 241, 22, 240]] },
    { id: 'p6', rects: [[443, 241, 22, 21]] },
  ];

  private readonly AXIS = 245;
  private readonly CY = 250;
  private readonly DOT_STEP = 13;
  private readonly DOT_DUR = 1050;
  private dotsCache: Dot[] | null = null;

  private buildDots(): Dot[] {
    const out: Dot[] = [];
    for (const p of this.pieces) {
      for (const [x, y, w, h] of p.rects) {
        for (let gx = x + this.DOT_STEP / 2; gx < x + w; gx += this.DOT_STEP) {
          for (let gy = y + this.DOT_STEP / 2; gy < y + h; gy += this.DOT_STEP) {
            out.push({
              x: gx + (Math.random() - 0.5) * 4,
              y: gy + (Math.random() - 0.5) * 4,
              r: 1.5 + Math.random() * 1.5,
            });
          }
        }
      }
    }
    return out;
  }

  private readonly EASE_OUT = 'cubic-bezier(.22,.7,.25,1)';
  private readonly EASE_SPRING = 'cubic-bezier(.2,1.3,.36,1)';
  private readonly EASE_ARC = 'cubic-bezier(.34,.18,.2,1)';

  readonly loadingFunc = input<() => Promise<void>>(
    () => new Promise<void>((resolve) => setTimeout(resolve, 20000)),
  );
  readonly loadedFunc = input<() => void>(
    () => { console.log('[Trust BI] secondFunction running'); },
  );

  // ---------- Lifecycle ----------

  ngAfterViewInit(): void {
    if (this.autoplay()) this.play();
  }

  ngOnDestroy(): void {
    this.destroyed.set(true);
    this.cancelAll();
  }

  play(): void {
    this.cancelAll();
    const gen = ++this.playGen;

    const host = this.hostRef.nativeElement;
    const q = <T extends Element>(sel: string) => host.querySelector(sel) as T | null;

    const mark = q<SVGGElement>('.ts-mark');
    const core = q<SVGGElement>('.ts-core');
    const flash = q<SVGRectElement>('.ts-flash');
    const sparksG = q<SVGGElement>('.ts-sparks');
    if (!mark || !core) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const trust = q<HTMLElement>('.ts-trust');
    const bi = q<HTMLElement>('.ts-bi');
    const divider = q<HTMLElement>('.ts-divider');
    const tagline = q<HTMLElement>('.ts-tagline');
    const splash = q<HTMLElement>('.ts-splash');
    const piecesG = q<SVGGElement>('.ts-pieces');
    const DOTS = (this.dotsCache ??= this.buildDots());

    // reset
    bi?.classList.remove('ts-lit');
    tagline?.classList.remove('ts-type');
    if (piecesG) { piecesG.style.opacity = ''; piecesG.style.filter = ''; }
    const allCh = [...(trust?.children ?? []), ...(bi?.children ?? [])] as HTMLElement[];
    allCh.forEach((ch) => { ch.style.opacity = '0'; ch.style.transform = 'translateY(0.7em)'; });
    if (divider) divider.style.opacity = '0';
    if (tagline) {
      const prev = tagline.style.width;
      tagline.style.width = 'auto';
      tagline.style.setProperty('--tw', Math.ceil(tagline.scrollWidth) + 2 + 'px');
      tagline.style.width = prev;
    }

    if (reduce) {
      this.showFinalStatic(piecesG, splash, allCh, divider, bi, tagline);
      this.finished.emit();
      return;
    }

    // Loading: each rect segment blinks independently — circuit-board effect
    const markRects = Array.from(host.querySelectorAll('.ts-mark rect')) as SVGRectElement[];
    const durations = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9]
    const loadingAnims = markRects.map((rect, i) =>
      this.track(
        rect.animate(
          [
            { opacity: 1, offset: 0 },
            { opacity: 0, offset: 0.05 }, // 0.5 / 3 seconds
            { opacity: 1, offset: 0.1 }, // 1 / 3 seconds
            { opacity: 1, offset: 1 },     // stay invisible for remaining 2 seconds
          ],
          {
            duration: 2000,
            delay: (durations.at(i) ?? i) * 30,
            iterations: Infinity,
            // easing: 'ease-in-out',
            easing: 'linear',
          },
        ),
      ),
    );

    this.loadingFunc()().then(() => {
      if (this.destroyed() || gen !== this.playGen) return;
      loadingAnims.forEach((a) => { try { a.cancel(); } catch { /* ignore */ } });
      markRects.forEach((r) => { r.style.opacity = '1'; })

      // ===== Scatter =====
      if (splash)
        this.track(
          splash.animate(
            [{ transform: 'translate(0px,-1.5vh)' }, { transform: 'translate(-90px,-1.5vh)' }],
            { duration: 1100, easing: this.EASE_OUT, fill: 'both' },
          ),
        );

      if (flash)
        this.track(
          flash.animate(
            [
              { opacity: 0, transform: 'scaleX(0.4)' },
              { opacity: 0.9, transform: 'scaleX(1.6)', offset: 0.35 },
              { opacity: 0, transform: 'scaleX(2.4)' },
            ],
            { duration: 520, easing: 'ease-out', fill: 'both' },
          ),
        );

      if (piecesG)
        this.track(
          piecesG.animate(
            [{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(1.6px)' }],
            { duration: 460, delay: 70, easing: 'ease-out', fill: 'both' },
          ),
        );

      // Dot scatter — fan outward with density falloff from axis
      if (sparksG) {
        const MAX_DIST = 220;
        for (const d of DOTS) {
          const t = (d.x - this.AXIS) / MAX_DIST;
          if (Math.random() < t * 0.70) continue;

          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          g.setAttribute('class', 'ts-dot-pos');
          const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          c.setAttribute('class', 'ts-dot-float');
          c.setAttribute('cx', String(d.x));
          c.setAttribute('cy', String(d.y));
          c.setAttribute('r', String(d.r));
          c.setAttribute('fill', this.fill('tg'));
          c.style.setProperty('--fx', ((Math.random() * 2 - 1) * 6).toFixed(1) + 'px');
          c.style.setProperty('--fy', (-(2 + Math.random() * 7)).toFixed(1) + 'px');
          c.style.setProperty('--fd', (3.6 + Math.random() * 5).toFixed(2) + 's');
          c.style.setProperty('--td', (2.6 + Math.random() * 4).toFixed(2) + 's');
          c.style.setProperty('--fdl', (-Math.random() * 6).toFixed(2) + 's');
          g.appendChild(c);
          sparksG.appendChild(g);

          const txBase = 25 + t * 350;
          const tx = Math.max(15, txBase + (Math.random() - 0.25) * 100);
          const tySpread = 70 + t * 320;
          const ty = (d.y - this.CY) * 0.25 + (Math.random() - 0.5) * tySpread;
          const land = Math.max(0.05, 0.62 * (1 - t * 0.88));
          const ripple = (d.x - this.AXIS) * 0.7;

          this.track(
            g.animate(
              [
                { transform: 'translate(0px,0px)', opacity: 0, offset: 0 },
                { transform: 'translate(0px,0px)', opacity: land, offset: 0.1 },
                { transform: `translate(${tx * 0.12}px,${ty * 0.12 - 80}px)`, opacity: land, offset: 0.34 },
                { transform: `translate(${tx}px,${ty}px)`, opacity: land, offset: 1 },
              ],
              { duration: this.DOT_DUR, delay: 40 + ripple, easing: this.EASE_ARC, fill: 'both' },
            ),
          );
        }
      }

      // Left half breathing
      this.track(
        core.animate(
          [
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(1.012)', opacity: 0.965 },
            { transform: 'scale(1)', opacity: 1 },
          ],
          { duration: 3400, delay: 420, iterations: Infinity, easing: 'ease-in-out' },
        ),
      );

      // ===== Text =====
      const textStart = 120;
      const letters = Array.from(trust?.children ?? []) as HTMLElement[];
      letters.forEach((ch, i) =>
        this.track(
          ch.animate(
            [{ opacity: 0, transform: 'translateY(0.8em)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 620, delay: textStart + i * 60, easing: this.EASE_SPRING, fill: 'both' },
          ),
        ),
      );
      if (divider)
        this.track(
          divider.animate(
            [{ opacity: 0, transform: 'scaleX(0)' }, { opacity: 1, transform: 'scaleX(1)' }],
            { duration: 460, delay: textStart + letters.length * 60 + 20, easing: this.EASE_SPRING, fill: 'both' },
          ),
        );
      const biStart = textStart + letters.length * 60 + 120;
      Array.from(bi?.children ?? []).forEach((ch, i) =>
        this.track(
          (ch as HTMLElement).animate(
            [{ opacity: 0, transform: 'translateY(0.8em)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 640, delay: biStart + i * 70, easing: this.EASE_SPRING, fill: 'both' },
          ),
        ),
      );
      this.timeout(() => bi?.classList.add('ts-lit'), biStart + 220);
      this.timeout(() => tagline?.classList.add('ts-type'), biStart + 520);

      // 2 s after scatter/text → second function
      this.timeout(() => {
        this.finished.emit();
        this.loadedFunc()();
        if (this.loop() && !this.destroyed()) this.timeout(() => this.play(), 700);
      }, 2000);
    });
  }

  // ---------- Internals ----------

  private showFinalStatic(
    piecesG: SVGGElement | null,
    splash: HTMLElement | null,
    allCh: HTMLElement[],
    divider: HTMLElement | null,
    bi: HTMLElement | null,
    tagline: HTMLElement | null,
  ): void {
    if (piecesG) piecesG.style.opacity = '0.32';
    if (splash) splash.style.transform = 'translate(-44px, -1.5vh)';
    allCh.forEach((ch) => { ch.style.opacity = '1'; ch.style.transform = 'none'; });
    if (divider) { divider.style.opacity = '1'; divider.style.transform = 'scaleX(1)'; }
    bi?.classList.add('ts-lit');
    if (tagline) tagline.style.width = 'var(--tw)';
  }

  private track(a: Animation): Animation { this.running.push(a); return a; }

  private timeout(fn: () => void, ms: number): void {
    const id = setTimeout(() => { if (!this.destroyed()) fn(); }, ms);
    this.timers.push(id);
  }

  private cancelAll(): void {
    this.running.forEach((a) => { try { a.cancel(); } catch { /* ignore */ } });
    this.running = [];
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
    this.hostRef.nativeElement.querySelectorAll('.ts-dot-pos').forEach((n: Element) => n.remove());
  }
}
