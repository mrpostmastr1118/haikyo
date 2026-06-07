export type VehicleType = 'plane' | 'ship';

export interface Vehicle {
  id: string;
  type: VehicleType;
  waypoints: [number, number][];
  speed: number;   // ルート全体を何秒で1周するか(s)
  progress: number; // 0〜1
  offset: number;  // 初期オフセット(位相ずらし)
}

// 緯度経度2点間の方位角（度）
export function bearing(p1: [number, number], p2: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const φ1 = toRad(p1[0]), φ2 = toRad(p2[0]);
  const Δλ = toRad(p2[1] - p1[1]);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

// ルート上の位置を取得
export function positionAt(waypoints: [number, number][], progress: number): [number, number] {
  const p = ((progress % 1) + 1) % 1;
  const n = waypoints.length - 1;
  const idx = Math.min(Math.floor(p * n), n - 1);
  const t = p * n - idx;
  const a = waypoints[idx], b = waypoints[idx + 1];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

// 方位角を取得（現在位置の少し先との角度）
export function headingAt(waypoints: [number, number][], progress: number): number {
  const cur = positionAt(waypoints, progress);
  const nxt = positionAt(waypoints, progress + 0.002);
  return bearing(cur, nxt);
}

export const VEHICLES: Vehicle[] = [
  // ── 飛行機 ──────────────────────────────
  {
    id: 'plane-pacific',
    type: 'plane',
    speed: 55,
    progress: 0,
    offset: 0,
    waypoints: [
      [35.7, 139.7],   // 東京
      [48.0, 160.0],   // 北太平洋
      [55.0, -155.0],  // アラスカ沖
      [49.3, -123.1],  // バンクーバー
      [37.8, -122.4],  // サンフランシスコ
    ],
  },
  {
    id: 'plane-europe',
    type: 'plane',
    speed: 60,
    progress: 0,
    offset: 0.35,
    waypoints: [
      [35.7, 139.7],   // 東京
      [55.0, 100.0],   // シベリア
      [56.0, 40.0],    // モスクワ付近
      [51.5, -0.1],    // ロンドン
      [48.9, 2.3],     // パリ
    ],
  },
  {
    id: 'plane-sea',
    type: 'plane',
    speed: 45,
    progress: 0,
    offset: 0.6,
    waypoints: [
      [1.3, 103.8],    // シンガポール
      [13.7, 100.5],   // バンコク
      [22.3, 114.2],   // 香港
      [31.2, 121.5],   // 上海
      [35.7, 139.7],   // 東京
      [37.4, 127.0],   // ソウル
    ],
  },
  {
    id: 'plane-aus',
    type: 'plane',
    speed: 50,
    progress: 0,
    offset: 0.8,
    waypoints: [
      [-33.9, 151.2],  // シドニー
      [-20.0, 155.0],  // 珊瑚海
      [5.0, 150.0],    // 赤道付近
      [35.7, 139.7],   // 東京
    ],
  },

  // ── 船 ──────────────────────────────────
  {
    id: 'ship-pacific',
    type: 'ship',
    speed: 120,
    progress: 0,
    offset: 0.1,
    waypoints: [
      [35.4, 139.6],   // 横浜
      [38.0, 155.0],   // 北太平洋
      [42.0, 175.0],   // 国際日付変更線付近
      [42.0, -165.0],  // 北太平洋東部
      [37.8, -122.4],  // サンフランシスコ
    ],
  },
  {
    id: 'ship-asia',
    type: 'ship',
    speed: 100,
    progress: 0,
    offset: 0.5,
    waypoints: [
      [1.3, 103.8],    // シンガポール
      [5.0, 80.0],     // インド洋
      [12.0, 50.0],    // アデン湾
      [25.2, 55.3],    // ドバイ
      [30.0, 32.5],    // スエズ運河
      [36.0, 14.5],    // 地中海
      [51.9, 4.5],     // ロッテルダム
    ],
  },
  {
    id: 'ship-japan-sea',
    type: 'ship',
    speed: 90,
    progress: 0,
    offset: 0.75,
    waypoints: [
      [35.4, 139.6],   // 横浜
      [35.0, 130.0],   // 日本海
      [37.5, 126.9],   // 仁川
      [31.2, 121.5],   // 上海
      [22.3, 114.2],   // 香港
    ],
  },
];
