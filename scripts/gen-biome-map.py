#!/usr/bin/env python3
"""
Deterministic, cubiomes-style biome map for the 种子地图 floor (module M5).

The real page draws native 256 x 256 cubiomes tiles: one tile pixel = tileScale
blocks (zoom 1..2 -> 4 blocks, zoom < 1 -> 1 block), biome colours from
cubiomes' initBiomeColors palette, then a Minecraft-map-item hillshade
computed on a 4-block height grid (apps/app/src/seed_map/cubiomes_bridge.c,
axolotl_shade_height_map). This script fakes the *world* (noise fields, a
designed layout around the film's staging) but reproduces the *renderer*:
palette, 1:4 biome cells, voronoi-zoomed 1:1 boundaries, river widths and
the exact shade formula (slope = 3h - w - n - nw, factor 1 +- clamp(s/16) +- .1,
floor .72, minimum 25-level darkening).

Outputs
  public/images/seedmap/biomes-s4.png   1 px = 4 blocks (tileScale 4)
  public/images/seedmap/biomes-s1.png   1 px = 1 block  (tileScale 1)
  src/ui/pages/seedMapData.ts           extents, spawn, structure positions

Staging contract (see src/scenes/seedmap/view.ts): the hero lies on block
(120, -64) -- the popup's 「X 120, Z -64」 -- inside a cherry grove (#FF91C8),
which ends up under window (983, 428) once the map is at zoom 0.

  python scripts/gen-biome-map.py
"""
import os

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'images', 'seedmap')
TS = os.path.join(ROOT, 'src', 'ui', 'pages', 'seedMapData.ts')

SEED = 10292992
HERO = (120, -64)

# Extents in blocks (multiples of 256 so the 1:1 image splits into real 256-block tiles).
S4 = dict(x0=-4608, z0=-1280, x1=2048, z1=1536)  # -> 1664 x 704 px
S1 = dict(x0=-1792, z0=-512, x1=1024, z1=768)  # -> 2816 x 1280 px

PAL_HEX = {
    'ocean': '#000070', 'deep_ocean': '#000030', 'lukewarm_ocean': '#000090',
    'river': '#0000FF', 'frozen_river': '#A0A0FF',
    'beach': '#FADE55', 'stony_shore': '#A2A284',
    'plains': '#8DB360', 'sunflower_plains': '#B5DB88', 'snowy_plains': '#FFFFFF',
    'forest': '#056621', 'flower_forest': '#2D8E49', 'birch_forest': '#307444', 'old_birch': '#589C6C',
    'dark_forest': '#40511A', 'windswept_forest': '#5B7352',
    'taiga': '#0B6A5F', 'snowy_taiga': '#31554A', 'old_pine': '#596651', 'old_spruce': '#818E79',
    'meadow': '#60A445', 'grove': '#47726C', 'snowy_slopes': '#C4C4C4', 'jagged_peaks': '#DCDCC8',
    'frozen_peaks': '#B0B3CE', 'stony_peaks': '#7B8F74', 'windswept_hills': '#606060',
    'cherry_grove': '#FF91C8',
    'desert': '#FA9418', 'savanna': '#BDB25F', 'savanna_plateau': '#A79D64',
    'swamp': '#07F9B2',
}
NAMES = list(PAL_HEX.keys())
IDX = {n: i for i, n in enumerate(NAMES)}
PAL = np.array([[int(h[i:i + 2], 16) for i in (1, 3, 5)] for h in PAL_HEX.values()], dtype=np.float32)


# ---------------------------------------------------------------- noise
class Perlin:
    def __init__(self, seed):
        rng = np.random.default_rng(seed)
        p = rng.permutation(1024)
        self.p = np.concatenate([p, p]).astype(np.int64)
        a = rng.random(1024) * 2 * np.pi
        self.gx = np.cos(a)
        self.gz = np.sin(a)

    def __call__(self, x, z):
        xi = np.floor(x).astype(np.int64)
        zi = np.floor(z).astype(np.int64)
        xf = x - xi
        zf = z - zi
        xi &= 1023
        zi &= 1023
        p = self.p

        def g(ix, iz, dx, dz):
            h = p[p[ix] + iz]
            return self.gx[h] * dx + self.gz[h] * dz

        u = xf * xf * xf * (xf * (xf * 6 - 15) + 10)
        v = zf * zf * zf * (zf * (zf * 6 - 15) + 10)
        n00 = g(xi, zi, xf, zf)
        n10 = g(xi + 1, zi, xf - 1, zf)
        n01 = g(xi, zi + 1, xf, zf - 1)
        n11 = g(xi + 1, zi + 1, xf - 1, zf - 1)
        a = n00 + u * (n10 - n00)
        b = n01 + u * (n11 - n01)
        return (a + v * (b - a)) * 1.42


_noises = {}


def fbm(x, z, wavelength, seed, octaves=4, gain=0.5):
    total = np.zeros_like(x, dtype=np.float64)
    amp, norm, freq = 1.0, 0.0, 1.0 / wavelength
    for o in range(octaves):
        key = seed * 31 + o
        if key not in _noises:
            _noises[key] = Perlin(SEED + key * 7919)
        total += amp * _noises[key](x * freq + 17.3 * o, z * freq - 9.1 * o)
        norm += amp
        amp *= gain
        freq *= 2.0
    return total / norm


def seg_dist(px, pz, pts):
    """Distance from points to a polyline (vectorised)."""
    d = np.full(px.shape, 1e9)
    for (ax, az), (bx, bz) in zip(pts[:-1], pts[1:]):
        vx, vz = bx - ax, bz - az
        L2 = vx * vx + vz * vz
        t = np.clip(((px - ax) * vx + (pz - az) * vz) / L2, 0, 1)
        dx = px - (ax + t * vx)
        dz = pz - (az + t * vz)
        d = np.minimum(d, np.sqrt(dx * dx + dz * dz))
    return d


# ---------------------------------------------------------------- world (4-block cells)
def world(x0, z0, x1, z1):
    """Biome index + float height for every 4x4-block cell centre in the box."""
    cx = np.arange(x0 // 4, x1 // 4)
    cz = np.arange(z0 // 4, z1 // 4)
    X, Z = np.meshgrid(cx * 4 + 2.0, cz * 4 + 2.0)

    wx = X + 150 * fbm(X, Z, 1100, 11)
    wz = Z + 150 * fbm(X, Z, 1100, 12)

    # Mountains NE of the hero, falling away to lowlands south / west.
    blob = np.exp(-(((wx - 430) / 1150) ** 2) - (((wz + 560) / 760) ** 2))
    blob2 = 0.55 * np.exp(-(((wx + 2300) / 700) ** 2) - (((wz + 1250) / 420) ** 2))
    ridge = 1 - np.abs(fbm(wx, wz, 300, 3, octaves=3))
    M = np.clip(1.18 * blob + blob2 + 0.16 * fbm(wx, wz, 650, 4), 0, 2)
    E = M * (0.72 + 0.4 * ridge)

    # Ocean in the bottom-left (south-west) corner of the opening view.
    ocean_f = ((-wx - 2450) * 0.62 + (wz + 40) * 0.95) / 720 + 0.32 * fbm(X, Z, 520, 7)

    T = 0.12 + 0.34 * fbm(wx, wz, 1700, 5) + np.clip((-X - 2500) / 1500, 0, 0.62) - 1.3 * np.clip(E - 0.45, 0, None)
    H = 0.85 * fbm(wx, wz, 1100, 6, octaves=3) + 0.2 * fbm(X, Z, 300, 8, octaves=2)

    b = np.full(X.shape, IDX['plains'], dtype=np.int16)

    def put(mask, name):
        b[mask] = IDX[name]

    land = ocean_f <= 1.0
    low = land & (E <= 0.5)
    # lowlands by temperature / humidity
    put(low & (T > 0.45) & (H < -0.05), 'desert')
    put(low & (T > 0.45) & (H >= -0.05), 'savanna')
    put(low & (T > 0.30) & (T <= 0.45) & (H < 0.0), 'savanna')
    put(low & (T > 0.30) & (T <= 0.45) & (H >= 0.0) & (H < 0.25), 'plains')
    put(low & (T > 0.30) & (T <= 0.45) & (H >= 0.25), 'forest')
    mid = low & (T > -0.18) & (T <= 0.30)
    put(mid & (H < -0.04), 'plains')
    put(mid & (H >= -0.04) & (H < 0.16), 'forest')
    put(mid & (H >= 0.16) & (H < 0.2), 'flower_forest')
    put(mid & (H >= 0.2) & (H < 0.36), 'birch_forest')
    put(mid & (H >= 0.36), 'dark_forest')
    put(mid & (H < -0.38), 'sunflower_plains')
    cool = low & (T > -0.5) & (T <= -0.18)
    put(cool & (H < 0.25), 'taiga')
    put(cool & (H >= 0.25), 'old_pine')
    put(low & (T <= -0.5) & (H < 0.0), 'snowy_plains')
    put(low & (T <= -0.5) & (H >= 0.0), 'snowy_taiga')
    # highlands
    hi = land & (E > 0.5) & (E <= 0.78)
    put(hi & (H < 0.28), 'meadow')
    put(hi & (H >= 0.28), 'windswept_forest')
    put(hi & (T < -0.62), 'grove')
    slope = land & (E > 0.78) & (E <= 1.0)
    put(slope & (T < -0.55), 'snowy_slopes')
    put(slope & (T >= -0.55), 'grove')
    put(slope & (T >= -0.2), 'windswept_hills')
    peak = land & (E > 1.0)
    put(peak & (T < -0.95), 'frozen_peaks')
    put(peak & (T >= -0.95) & (T < -0.55), 'jagged_peaks')
    put(peak & (T >= -0.55), 'stony_peaks')

    # coast
    beach = land & (ocean_f > 0.92) & (E < 0.5)
    put(beach, 'beach')
    put(land & (ocean_f > 0.92) & (E >= 0.5), 'stony_shore')
    sea = ~land
    put(sea, 'ocean')
    put(sea & (ocean_f > 1.75), 'deep_ocean')
    put(sea & (ocean_f > 1.2) & (ocean_f <= 1.75) & (T > 0.75), 'lukewarm_ocean')

    # Cherry grove around the hero: mountain flank, meadows around it.
    gwx = X + 105 * fbm(X, Z, 260, 16, octaves=3)
    gwz = Z + 90 * fbm(X, Z, 260, 17, octaves=3)
    gx = (gwx - HERO[0] - 10) / 390
    gz = (gwz - HERO[1] - 6) / 236
    gnoise = 0.55 * fbm(X, Z, 210, 9, octaves=3)
    grove = (gx * gx + gz * gz + gnoise) < 1.0
    rnoise = 1.5 * fbm(X, Z, 330, 18, octaves=3)
    ring = (gx * gx + gz * gz + rnoise) < 1.8
    put(ring & ~grove & land & (E <= 0.78), 'meadow')
    put(grove, 'cherry_grove')

    # Rivers (designed paths + meanders), never through the grove or the peaks.
    rx = X + 55 * fbm(X, Z, 380, 13, octaves=3)
    rz = Z + 55 * fbm(X, Z, 380, 14, octaves=3)
    main = [(-420, -1500), (-560, -900), (-690, -420), (-740, -60), (-830, 260), (-1080, 520),
            (-1560, 700), (-2150, 760), (-2700, 610), (-3300, 520)]
    trib = [(-3500, -1500), (-3150, -980), (-2850, -420), (-2600, 120), (-2420, 560), (-2250, 730)]
    east = [(1900, -380), (1500, -150), (1180, 120), (900, 330), (560, 520), (60, 760), (-420, 1100)]
    width = 8.5 + 2.5 * fbm(X, Z, 500, 15, octaves=2)
    d = np.minimum(seg_dist(rx, rz, main), seg_dist(rx, rz, trib) + 2.5)
    d = np.minimum(d, seg_dist(rx, rz, east) + 1.0)
    river = (d < width) & land & (E < 0.86) & ~grove & ~ring
    river |= (d < width) & sea & (ocean_f < 1.1)
    put(river, 'river')
    put(river & (T < -0.62), 'frozen_river')

    # Heights (blocks) for the hillshade.
    fine = fbm(X, Z, 56, 21, octaves=2)
    base = 66 + 7 * fbm(X, Z, 520, 22, octaves=3)
    h = base + 150 * np.clip(E, 0, None) ** 1.25 + 26 * np.clip(E - 0.6, 0, None) * (ridge - 0.5) + 2.6 * fine
    h = np.where(grove, 104 - 0.022 * (Z - HERO[1]) + 5 * fbm(X, Z, 520, 23, octaves=2) + 0.55 * fine, h)
    sea_h = 60 - 22 * np.clip(ocean_f - 1.0, 0, 1) - 6 * np.clip(ocean_f - 1.6, 0, 1) + 2.0 * fine
    h = np.where(sea, sea_h, h)
    h = np.where(river, 61 + 0.6 * fine, h)
    h = np.where(beach & ~river, 63 + 0.8 * fine, h)
    return b, h


def shade_factor(hgrid):
    """Raw factor per cell (without the per-colour minimum-darkening rule)."""
    hi = np.floor(hgrid).astype(np.int64)
    here = hi[1:, 1:]
    west = hi[1:, :-1]
    north = hi[:-1, 1:]
    nw = hi[:-1, :-1]
    slope = 3 * here - west - north - nw
    delta = np.clip(slope / 16.0, -0.3, 0.3)
    f = np.where(slope != 0, 1.0 + delta + np.where(delta > 0, 0.1, -0.1), 1.0)
    return np.maximum(f, 0.72)


def apply_shade(rgb, f):
    strongest = rgb.max(axis=-1)
    cond = (f < 1.0) & (strongest > 25) & (strongest - strongest * f < 25)
    f = np.where(cond, (strongest - 25.0) / np.maximum(strongest, 1), f)
    return np.clip(np.floor(rgb * f[..., None]), 0, 255).astype(np.uint8)


def main():
    os.makedirs(OUT, exist_ok=True)
    # one extra cell north and west for the shade neighbours
    bx0, bz0 = S4['x0'] - 4, S4['z0'] - 4
    biome, height = world(bx0, bz0, S4['x1'], S4['z1'])
    f = shade_factor(height)  # (rows-1, cols-1) aligned with S4 cells
    cells = biome[1:, 1:]

    # ---- scale 4: one pixel per cell
    img4 = apply_shade(PAL[cells], f)
    Image.fromarray(img4, 'RGB').save(os.path.join(OUT, 'biomes-s4.png'), optimize=True)

    # ---- scale 1: voronoi-zoomed boundaries, relief cells stay 4 blocks wide
    w1, h1 = S1['x1'] - S1['x0'], S1['z1'] - S1['z0']
    bxs = np.arange(S1['x0'], S1['x1'])
    bzs = np.arange(S1['z0'], S1['z1'])
    BX, BZ = np.meshgrid(bxs + 0.5, bzs + 0.5)
    ccx = np.floor(BX / 4).astype(np.int64)
    ccz = np.floor(BZ / 4).astype(np.int64)
    best = np.full(BX.shape, 1e9)
    pick = np.zeros(BX.shape, dtype=np.int16)
    jit = Perlin(SEED + 4242)
    for dz in (-1, 0, 1):
        for dx in (-1, 0, 1):
            nx, nz = ccx + dx, ccz + dz
            # deterministic per-cell jitter in [-1.8, 1.8] blocks
            hsh = np.sin(nx * 12.9898 + nz * 78.233) * 43758.5453
            jx = (hsh - np.floor(hsh)) * 3.6 - 1.8
            hsh2 = np.sin(nx * 39.3467 + nz * 11.135) * 24634.6345
            jz = (hsh2 - np.floor(hsh2)) * 3.6 - 1.8
            px = nx * 4 + 2 + jx
            pz = nz * 4 + 2 + jz
            dd = (BX - px) ** 2 + (BZ - pz) ** 2
            # biome of that neighbour cell (index into the S4 cell grid)
            ci = np.clip(nx - S4['x0'] // 4, 0, cells.shape[1] - 1)
            cj = np.clip(nz - S4['z0'] // 4, 0, cells.shape[0] - 1)
            nb = cells[cj, ci]
            m = dd < best
            best = np.where(m, dd, best)
            pick = np.where(m, nb, pick)
    del jit
    ci = ccx - S4['x0'] // 4
    cj = ccz - S4['z0'] // 4
    f1 = f[cj, ci]
    img1 = apply_shade(PAL[pick], f1)
    Image.fromarray(img1, 'RGB').save(os.path.join(OUT, 'biomes-s1.png'), optimize=True)

    # ---- structures (default layers: 村庄 · 废弃传送门 · 要塞) on their real region grids
    def biome_at(x, z):
        i = int((x - S4['x0']) // 4)
        j = int((z - S4['z0']) // 4)
        if 0 <= j < cells.shape[0] and 0 <= i < cells.shape[1]:
            return NAMES[cells[j, i]]
        return None

    rng = np.random.default_rng(SEED)
    feats = []
    village_ok = {'plains', 'sunflower_plains', 'desert', 'savanna', 'taiga', 'snowy_plains', 'meadow'}
    for rx_ in range(-10, 5):
        for rz_ in range(-4, 4):
            ox, oz = rng.integers(0, 26, 2)
            x = (rx_ * 34 + int(ox)) * 16 + 8
            z = (rz_ * 34 + int(oz)) * 16 + 8
            if biome_at(x, z) in village_ok and rng.random() < 0.6:
                feats.append(('village', x, z))
    for rx_ in range(-9, 4):
        for rz_ in range(-3, 4):
            ox, oz = rng.integers(0, 25, 2)
            x = (rx_ * 40 + int(ox)) * 16 + 8
            z = (rz_ * 40 + int(oz)) * 16 + 8
            if rng.random() < 0.5:
                feats.append(('ruined-portal', x, z))
    feats.append(('stronghold', -2040, -664))

    # keep the hero's stage clean: landing, skid, grove and the zoomed close-up
    def clear(x, z):
        if abs(x - HERO[0]) < 640 and abs(z - HERO[1]) < 330:
            return False
        if 500 < x < 1250 and -120 < z < 420:  # landing + skid lane
            return False
        if -380 < x < 1100 and -300 < z < 560:  # the zoom-0 close-up around the hero
            return False
        return S4['x0'] + 64 < x < S4['x1'] - 64 and S4['z0'] + 64 < z < S4['z1'] - 64

    feats = [ft for ft in feats if clear(ft[1], ft[2])]
    spawn = (-520, 240)

    with open(TS, 'w', encoding='utf-8') as fh:
        fh.write('/** GENERATED by scripts/gen-biome-map.py, do not edit. */\n')
        fh.write('export const MAP_S4 = {src: "images/seedmap/biomes-s4.png", x0: %d, z0: %d, w: %d, h: %d, scale: 4} as const;\n'
                 % (S4['x0'], S4['z0'], (S4['x1'] - S4['x0']), (S4['z1'] - S4['z0'])))
        fh.write('export const MAP_S1 = {src: "images/seedmap/biomes-s1.png", x0: %d, z0: %d, w: %d, h: %d, scale: 1} as const;\n'
                 % (S1['x0'], S1['z0'], w1, h1))
        fh.write('export const MAP_SPAWN = {x: %d, z: %d} as const;\n' % spawn)
        fh.write('export const MAP_HERO_BLOCK = {x: %d, z: %d} as const;\n' % HERO)
        fh.write("export type MapFeatureKind = 'village' | 'ruined-portal' | 'stronghold';\n")
        fh.write('export const MAP_FEATURES: ReadonlyArray<{kind: MapFeatureKind; x: number; z: number}> = [\n')
        for k, x, z in feats:
            fh.write("\t{kind: '%s', x: %d, z: %d},\n" % (k, x, z))
        fh.write('];\n')

    for n in ('biomes-s4.png', 'biomes-s1.png'):
        p = os.path.join(OUT, n)
        print(n, Image.open(p).size, os.path.getsize(p) // 1024, 'KB')
    print(len(feats), 'features')


if __name__ == '__main__':
    main()
