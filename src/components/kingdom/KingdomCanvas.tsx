"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Application, Assets, Container, Graphics, Sprite, Text, type Texture } from "pixi.js";
import { BUILDINGS } from "@/libs/kingdom-rules";
import { buildingArt, KINGDOM_TEXTURES, TERRAIN_ART, WEEKLY_BANNER_ART } from "@/libs/kingdom-art";
import type { KingdomBuilding } from "@/services/kingdomService";

type Props = { buildings: KingdomBuilding[]; selected: string | null; editing: boolean; zoom: number; bannerUnlocked: boolean; onSelect: (id: string) => void; onMove: (x: number, y: number) => void };
const SCENE = { width: 1280, height: 1280 * 1024 / 1536, top: -200 };
const iso = (x: number, y: number) => ({ x: (x - y) * 56, y: (x + y) * 28 - 40 });

export default function KingdomCanvas(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef(props);
  const redraw = useRef<(() => void) | null>(null);
  const refit = useRef<(() => void) | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  useLayoutEffect(() => { live.current = props; });

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const app = new Application();
    let disposed = false, ready = false;
    let observer: ResizeObserver | undefined;
    let removeInput: (() => void) | undefined;
    const init = async () => {
      await app.init({ resizeTo: element, background: 0xebf4fa, antialias: true, resolution: Math.min(devicePixelRatio, 2), autoDensity: true });
      ready = true;
      if (disposed) { app.destroy(true, { children: true }); return; }
      element.appendChild(app.canvas);
      const textures = new Map(await Promise.all(KINGDOM_TEXTURES.map(async path => [path, await Assets.load<Texture>(path)] as const)));
      if (disposed) return;

      const world = new Container();
      const grid = new Container();
      const structures = new Container();
      const labels = new Container();
      const terrain = new Sprite(textures.get(TERRAIN_ART)!);
      terrain.position.set(-SCENE.width / 2, SCENE.top);
      terrain.width = SCENE.width;
      terrain.height = SCENE.height;
      world.addChild(terrain, grid, structures);
      app.stage.addChild(world);

      // Preserve the saved grid; show its guides only while editing.
      for (let y = 1; y <= 10; y++) for (let x = 1; x <= 10; x++) {
        const p = iso(x, y);
        const tile = new Graphics().poly([0, 0, 56, 28, 0, 56, -56, 28])
          .fill({ color: 0xffffff, alpha: .12 }).stroke({ color: 0x1e3a8a, alpha: .35, width: 1 });
        tile.position.set(p.x, p.y);
        tile.eventMode = 'static';
        tile.cursor = 'crosshair';
        tile.on('pointertap', () => { if (live.current.editing) live.current.onMove(x, y); });
        grid.addChild(tile);
      }

      const banner = new Sprite(textures.get(WEEKLY_BANNER_ART)!);
      banner.anchor.set(.5, 1);
      banner.position.set(10, 385);
      // Native SVG proportions; the shared world camera handles scaling.
      world.addChild(banner);
      world.addChild(labels);

      redraw.current = () => {
        grid.visible = live.current.editing;
        banner.visible = live.current.bannerUnlocked;
        structures.removeChildren().forEach(child => child.destroy({ children: true }));
        labels.removeChildren().forEach(child => child.destroy({ children: true }));
        const rendered = live.current.buildings.toSorted((a, b) => (a.x + a.y) - (b.x + b.y)).map(b => {
          const definition = BUILDINGS.find(d => d.kind === b.kind) ?? BUILDINGS[0];
          const path = buildingArt(b.kind, b.level), texture = textures.get(path)!;
          const p = iso(b.x, b.y);
          const group = new Container();
          group.position.set(p.x, p.y + 28);
          group.eventMode = 'static';
          group.cursor = 'pointer';
          group.on('pointertap', e => { e.stopPropagation(); live.current.onSelect(b.id); });
          const selected = b.id === live.current.selected;
          if (selected) group.addChild(new Graphics().ellipse(0, 0, 105, 40)
            .fill({ color: 0xe5b842, alpha: .2 }).stroke({ color: 0xe5b842, width: 3 }));

          const sprite = new Sprite(texture);
          sprite.anchor.set(.5, .94);
          const size = b.kind === 'WELL' ? 190 : b.kind === 'ENTRANCE' ? 230 : b.kind === 'TOWER' ? 260 + (b.level - 1) * 15 : 280;
          sprite.scale.set(size / Math.max(texture.width, texture.height));
          group.addChild(sprite);
          // Keep the supplied artwork's colors. Status belongs to its selection.
          if (selected) {
            const title = new Text({
              text: definition.name + ' · Nv. ' + b.level + (b.corruption ? ' · ' + b.corruption + '%' : ''),
              style: { fontFamily: getComputedStyle(element).fontFamily, fontSize: 14, fill: 0x0f1e36, fontWeight: '600' }
            });
            const label = new Container();
            label.position.set(p.x, p.y + 28 - sprite.height * .94 - title.height - 16);
            label.addChild(new Graphics().roundRect(-title.width / 2 - 10, -5, title.width + 20, title.height + 10, 8)
              .fill({ color: 0xffffff, alpha: .96 }));
            title.anchor.set(.5, 0);
            label.addChild(title);
            labels.addChild(label);
          }
          structures.addChild(group);
          return { id: b.id, asset: path, level: b.level, width: sprite.width, height: sprite.height, sourceWidth: texture.width, sourceHeight: texture.height };
        });
        element.dataset.renderedBuildings = JSON.stringify(rendered);
      };
      redraw.current();

      let baseScale = 1;
      const fit = () => {
        baseScale = Math.min(Math.max(1, element.clientWidth - 24) / SCENE.width, Math.max(1, element.clientHeight - 16) / SCENE.height);
        const scale = baseScale * live.current.zoom;
        world.scale.set(scale);
        world.position.set(element.clientWidth / 2, (element.clientHeight - SCENE.height * scale) / 2 - SCENE.top * scale);
      };
      refit.current = fit;
      fit();
      observer = new ResizeObserver(fit);
      observer.observe(element);
      let drag: { x: number; y: number; wx: number; wy: number } | null = null;
      const down = (e: PointerEvent) => { if (!live.current.editing) drag = { x: e.clientX, y: e.clientY, wx: world.x, wy: world.y }; };
      const move = (e: PointerEvent) => { if (drag && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) world.position.set(drag.wx + e.clientX - drag.x, drag.wy + e.clientY - drag.y); };
      const up = () => { drag = null; };
      const wheel = (e: WheelEvent) => { e.preventDefault(); world.scale.set(Math.max(baseScale * .5, Math.min(baseScale * 2.2, world.scale.x * (e.deltaY > 0 ? .9 : 1.1)))); };
      app.canvas.addEventListener('pointerdown', down);
      app.canvas.addEventListener('pointermove', move);
      for (const name of ['pointerup', 'pointercancel', 'pointerleave']) app.canvas.addEventListener(name, up);
      app.canvas.addEventListener('wheel', wheel, { passive: false });
      removeInput = () => {
        app.canvas.removeEventListener('pointerdown', down);
        app.canvas.removeEventListener('pointermove', move);
        for (const name of ['pointerup', 'pointercancel', 'pointerleave']) app.canvas.removeEventListener(name, up);
        app.canvas.removeEventListener('wheel', wheel);
      };
      app.ticker.maxFPS = 30;
      app.render();
      setState('ready');
    };
    init().catch(() => { if (!disposed) setState('error'); });
    return () => {
      disposed = true;
      observer?.disconnect();
      removeInput?.();
      redraw.current = null;
      refit.current = null;
      if (ready) app.destroy(true, { children: true });
    };
  }, []);
  useEffect(() => { redraw.current?.(); }, [props.buildings, props.selected, props.editing, props.bannerUnlocked]);
  useEffect(() => { refit.current?.(); }, [props.zoom]);
  return <div ref={host} className="kingdom-canvas" aria-label="Aldea medieval interactiva" data-scene-state={state}>
    {state === 'loading' && <p role="status" className="kingdom-scene-loading">Preparando tu aldea...</p>}
    {state === 'error' && <p role="alert">No se pudo cargar la aldea. Tus edificios siguen disponibles en la lista.</p>}
  </div>;
}
