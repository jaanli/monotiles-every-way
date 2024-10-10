class Point {
  x: number;
  y: number;
  xy: [number, number];

  constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
      this.xy = [x, y];
  }
}

const IDENTITY = [1, 0, 0, 0, 1, 0];

type ColorMapKey = "Gamma" | "Gamma1" | "Gamma2" | "Delta" | "Theta" | "Lambda" | "Xi" | "Pi" | "Sigma" | "Phi" | "Psi";

const COLOR_MAP: Record<ColorMapKey, string> = {
  "Gamma": "rgb(255, 255, 255)",
  "Gamma1": "rgb(255, 255, 255)",
  "Gamma2": "rgb(255, 255, 255)",
  "Delta": "rgb(220, 220, 220)",
  "Theta": "rgb(255, 191, 191)",
  "Lambda": "rgb(255, 160, 122)",
  "Xi": "rgb(255, 242, 0)",
  "Pi": "rgb(135, 206, 250)",
  "Sigma": "rgb(245, 245, 220)",
  "Phi": "rgb(0, 255, 0)",
  "Psi": "rgb(0, 255, 255)"
};

const SPECTRE_POINTS: Point[] = [
  new Point(0, 0),
  new Point(1.0, 0.0),
  new Point(1.5, -Math.sqrt(3)/2),
  new Point(1.5+Math.sqrt(3)/2, 0.5-Math.sqrt(3)/2),
  new Point(1.5+Math.sqrt(3)/2, 1.5-Math.sqrt(3)/2),
  new Point(2.5+Math.sqrt(3)/2, 1.5-Math.sqrt(3)/2),
  new Point(3+Math.sqrt(3)/2, 1.5),
  new Point(3.0, 2.0),
  new Point(3-Math.sqrt(3)/2, 1.5),
  new Point(2.5-Math.sqrt(3)/2, 1.5+Math.sqrt(3)/2),
  new Point(1.5-Math.sqrt(3)/2, 1.5+Math.sqrt(3)/2),
  new Point(0.5-Math.sqrt(3)/2, 1.5+Math.sqrt(3)/2),
  new Point(-Math.sqrt(3)/2, 1.5),
  new Point(0.0, 1.0)
];

function mul(A: number[], B: number[]): number[] {
  return [
      A[0]*B[0] + A[1]*B[3],
      A[0]*B[1] + A[1]*B[4],
      A[0]*B[2] + A[1]*B[5] + A[2],
      A[3]*B[0] + A[4]*B[3],
      A[3]*B[1] + A[4]*B[4],
      A[3]*B[2] + A[4]*B[5] + A[5]
  ];
}

function trot(ang: number): number[] {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  return [c, -s, 0, s, c, 0];
}

function ttrans(tx: number, ty: number): number[] {
  return [1, 0, tx, 0, 1, ty];
}

function transTo(p: Point, q: Point): number[] {
  return ttrans(q.x - p.x, q.y - p.y);
}

function transPt(M: number[], P: Point): Point {
  return new Point(M[0]*P.x + M[1]*P.y + M[2], M[3]*P.x + M[4]*P.y + M[5]);
}

function drawPolygon(ctx: CanvasRenderingContext2D, T: number[], f: string, s: string, w: number) {
  ctx.save();
  ctx.transform(T[0], T[3], T[1], T[4], T[2], T[5]);
  ctx.beginPath();
  ctx.moveTo(SPECTRE_POINTS[0].x, SPECTRE_POINTS[0].y);
  for (let i = 1; i < SPECTRE_POINTS.length; i++) {
      ctx.lineTo(SPECTRE_POINTS[i].x, SPECTRE_POINTS[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = f;
  ctx.fill();
  if (s) {
      ctx.strokeStyle = s;
      ctx.lineWidth = w;
      ctx.stroke();
  }
  ctx.restore();
}

class Tile {
  quad: Point[];
  label: ColorMapKey;

  constructor(pts: Point[], label: ColorMapKey) {
      this.quad = [pts[3], pts[5], pts[7], pts[11]];
      this.label = label;
  }

  draw(ctx: CanvasRenderingContext2D, tile_transformation: number[] = IDENTITY) {
      return drawPolygon(ctx, tile_transformation, COLOR_MAP[this.label], "black", 0.1);
  }
}

class MetaTile {
  geometries: [Tile | MetaTile, number[]][];
  quad: Point[];

  constructor(geometries: [Tile | MetaTile, number[]][] = [], quad: Point[] = []) {
      this.geometries = geometries;
      this.quad = quad;
  }

  draw(ctx: CanvasRenderingContext2D, metatile_transformation: number[] = IDENTITY) {
      this.geometries.forEach(([shape, shape_transformation]) => {
          shape.draw(ctx, mul(metatile_transformation, shape_transformation));
      });
  }
}

function buildSpectreBase(): Record<ColorMapKey, Tile | MetaTile> {
  const spectre_base_cluster: Partial<Record<ColorMapKey, Tile | MetaTile>> = {};
  
  (["Delta", "Theta", "Lambda", "Xi", "Pi", "Sigma", "Phi", "Psi"] as ColorMapKey[]).forEach(label => {
      spectre_base_cluster[label] = new Tile(SPECTRE_POINTS, label);
  });

  // special rule for Gamma
  const mystic = new MetaTile(
      [
          [new Tile(SPECTRE_POINTS, "Gamma1"), IDENTITY],
          [new Tile(SPECTRE_POINTS, "Gamma2"), mul(ttrans(SPECTRE_POINTS[8].x, SPECTRE_POINTS[8].y), trot(Math.PI/6))]
      ],
      [SPECTRE_POINTS[3], SPECTRE_POINTS[5], SPECTRE_POINTS[7], SPECTRE_POINTS[11]]
  );
  spectre_base_cluster["Gamma"] = mystic;

  return spectre_base_cluster as Record<ColorMapKey, Tile | MetaTile>;
}

function drawSpectreMonotile() {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 800;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.translate(400, 400);
  ctx.scale(100, 100);

  const shapes = buildSpectreBase();
  shapes["Delta"].draw(ctx);
}

drawSpectreMonotile();