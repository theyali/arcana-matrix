// src/features/matrix.jsx
import React from "react";
import Section from "../components/Section";
import { Star, Crown, Lock, BadgeCheck, Loader2, Sparkles, Users } from "lucide-react";
import { useAuthStatus } from "../auth/useAuthStatus";
import { calcMatrix, compatMatrix } from "../api/matrix"; // <-- API вынесен

/** ------------------------
 *  Helpers: тариф и надписи
 *  ------------------------ */
function planFromProfile(profile) {
  const raw =
    profile?.tariff?.code ||
    profile?.tariff?.slug ||
    profile?.tariff?.name ||
    profile?.plan?.code ||
    profile?.plan?.slug ||
    profile?.plan?.name ||
    profile?.subscription?.plan ||
    profile?.role ||
    "";
  const s = String(raw).toLowerCase();
  if (s.includes("expert") || s.includes("эксперт")) return "expert";
  if (s.includes("pro")) return "pro";
  return "free";
}

function PlanBadge({ plan }) {
  if (plan === "expert") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: "color-mix(in srgb, var(--text) 10%, transparent)", color: "var(--text)" }}>
        <Crown className="w-4 h-4" /> Expert
      </span>
    );
  }
  if (plan === "pro") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: "color-mix(in srgb, var(--text) 10%, transparent)", color: "var(--text)" }}>
        <Sparkles className="w-4 h-4" /> Pro
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold opacity-80"
          style={{ background: "color-mix(in srgb, var(--text) 8%, transparent)", color: "var(--text)" }}>
      Free
    </span>
  );
}

/** ------------------------
 *  Примитивная сетка 3×3 (пифагор)
 *  ------------------------ */
function MatrixGrid({ counts, loading }) {
  const cells = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {cells.flat().map((d) => (
        <div
          key={d}
          className="rounded-2xl border border-muted p-4 text-center shadow-sm"
          style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)" }}
        >
          <div className="text-sm uppercase tracking-wide opacity-70">{d}</div>
          <div className="mt-1 text-2xl font-semibold">
            {loading ? (
              <span className="inline-flex items-center gap-2 opacity-70">
                <Loader2 className="w-4 h-4 animate-spin" /> …
              </span>
            ) : (
              (counts?.[d] > 0 ? Array.from({ length: counts[d] }).map(() => d).join("") : "—")
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/** ------------------------
 *  SVG-диаграмма 22 Арканов (рендер только по данным с бэка)
 *  ------------------------ */
function MatrixDiagram({ diagram }) {
  if (!diagram) {
    return (
      <div className="rounded-2xl border border-muted p-4 text-sm opacity-70"
           style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)" }}>
        Рассчитайте дату — и здесь появится интерактивная схема по 22 арканам.
      </div>
    );
  }

  const vb = 1000;
  const anchors = diagram.anchors || {};
  const poly = (pts) => pts.map(([x, y]) => `${x},${y}`).join(" ");
  const centroid = (pts) => {
    const n = pts.length || 1;
    const s = pts.reduce((a,[x,y])=>[a[0]+x,a[1]+y],[0,0]);
    return [s[0]/n, s[1]/n];
  };

  return (
    <div className="rounded-3xl border border-muted p-3"
         style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)" }}>
      <svg viewBox={`0 0 ${vb} ${vb}`} className="w-full h-auto" shapeRendering="geometricPrecision">
        {/* Рамка/фон */}
        {diagram.frame?.octagon ? (
          <polygon points={poly(diagram.frame.octagon)} fill="none"
                   stroke="currentColor" strokeWidth={diagram.frame.strokeWidth || 4} />
        ) : (
          <>
            <polygon points={`500,40 960,500 500,960 40,500`} fill="none"
                     stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
            <rect x="160" y="160" width="680" height="680" fill="none"
                  stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" transform="rotate(45 500 500)" />
          </>
        )}
        {diagram.frame?.diamond && (
          <polygon points={poly(diagram.frame.diamond)} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
        )}

        {/* Диагонали/оси (рисуем линии) */}
        {(diagram.axes || []).map((ax,i)=>{
          const a = anchors[ax.from] || ax.from; const b = anchors[ax.to] || ax.to; if(!a||!b) return null;
          return (
            <line key={`ax-line-${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={ax.color||'currentColor'} strokeOpacity={ax.opacity ?? 1} strokeWidth={ax.width||2} strokeDasharray={ax.dashed?'6 6':'0'} />
          );
        })}

        {/* Идеально ровные окружности */}
        {(diagram.circles || []).map((c,i)=> (
          <circle key={`circ-${i}`} cx={c.cx ?? 500} cy={c.cy ?? 500} r={c.r}
                  fill={c.fill || 'none'} stroke={c.stroke || 'currentColor'}
                  strokeWidth={c.width || 2} opacity={c.opacity ?? 1} />
        ))}

        {/* Зоны (например, денежный/отношений), если пришли от бэка */}
        {(diagram.zones || []).map((z, i) => {
          const pts = (z.points || []).map(k => anchors[k]).filter(Boolean);
          if (pts.length < 3) return null;
          const [cx, cy] = z.center || centroid(pts);
          const fill = z.fill || (i % 2 ? 'rgba(0,200,160,0.25)' : 'rgba(255,105,180,0.25)');
          const stroke = z.stroke || 'currentColor';
          return (
            <g key={`zone-${i}`}>
              <polygon points={poly(pts)} fill={fill} stroke={stroke} strokeOpacity="0.25" />
              {z.label && (
                <g>
                  <rect x={cx-80} y={cy-28} width="160" height="40" rx="12" ry="12" fill="rgba(255,255,255,0.85)" />
                  <text x={cx} y={cy-4} textAnchor="middle" fontSize="16" fontWeight="700" fill="#000000">{z.label}</text>
                </g>
              )}
            </g>
          );
        })}

        {/* Линии/связи */}
        {(diagram.edges || []).map((e, i) => {
          const a = anchors[e.from];
          const b = anchors[e.to];
          if (!a || !b) return null;
          return (
            <g key={`edge-${i}`}>
              <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}
                    stroke="currentColor" strokeOpacity="0.35" strokeWidth="2"
                    strokeDasharray={e.dashed ? "6 6" : "0"} />
              {e.label && (
                <text x={(a[0]+b[0])/2} y={(a[1]+b[1])/2 - 8} textAnchor="middle"
                      fontSize="16" opacity="0.6" fill="currentColor">{e.label}</text>
              )}
            </g>
          );
        })}

        {/* Возрастные отметки по периметру (если пришли) */}
        {(diagram.ageMarks || []).map((m, i) => (
          <text key={`age-${i}`} x={m.x} y={(m.y || 0) + 12} textAnchor="middle"
                fontSize={m.fontSize || 12} opacity={0.7} fill="currentColor">{m.value}</text>
        ))}

        {/* Полигональные каналы */}
        {(diagram.polygons || []).map((p) => (
          <g key={p.id}>
            <polygon points={poly(p.points)} fill={p.fill || "transparent"}
                     stroke={p.stroke || "none"} strokeWidth="2" />
          </g>
        ))}

        {/* Узлы/числа */}
        {(diagram.nodes || []).map((n) => {
          const r = n.r ?? (n.variant === "center" ? 36 : (n.variant === "major" ? 28 : 20));
          const fontSize = n.fontSize ?? (n.variant === "center" ? 28 : (n.variant === "major" ? 20 : 16));
          const textFill = n.textColor || '#111'; // тёмный текст чтобы читался на белом/светлом круге
          return (
            <g key={n.id}>
              {n.ring && (
                <circle cx={n.x} cy={n.y} r={r + (n.ring.pad || 6)} fill="none" stroke={n.ring.color || '#b98ad1'} strokeWidth={n.ring.width || 10} />
              )}
              <circle cx={n.x} cy={n.y} r={r}
                      fill={n.fill || (n.variant === "center" || n.variant === "major"
                        ? "color-mix(in srgb, var(--text) 18%, white)" : "white")}
                      stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
              <text x={n.x} y={n.y + (fontSize/3)} textAnchor="middle"
                    fontSize={fontSize}
                    fontWeight="800" fill={textFill}>{n.arcana}</text>
            </g>
          );
        })}

        {/* Подписи */}
        {(diagram.bubbles || []).map((b, i) => (
          <g key={`b-${i}`}>
            <rect x={b.x - 90} y={b.y - 26} rx="14" ry="14" width="180" height="36"
                  fill="color-mix(in srgb, #000000 10%, white)" stroke="currentColor" strokeOpacity="0.2" />
            <text x={b.x} y={b.y - 3} textAnchor="middle" fontSize="16" fontWeight="700"
                  fill="#000000">{b.text}</text>
          </g>
        ))}

        {/* Периметр/возрастные узлы */}
        {(diagram.perimeter || []).map((p, i) => {
          const r = p.variant === 'big' ? 40 : 24;
          const ring = p.ring;
          return (
            <g key={`per-${i}`}>
              {ring && (
                <circle cx={p.x} cy={p.y} r={r + (ring.pad || 6)}
                        fill="none" stroke={ring.color || '#b78ad1'} strokeWidth={ring.width || 12} />
              )}
              <circle cx={p.x} cy={p.y} r={r}
                      fill="white" stroke="currentColor" strokeWidth="2" />
              <text x={p.x} y={p.y + 6} textAnchor="middle"
                    fontSize={p.variant === "big" ? 24 : 16}
                    fontWeight="800" fill="#111">{p.arcana}</text>
            </g>
          );
        })}

        {/* Сателлиты под каждым периметральным кругом (2 малых круга внутрь от вершины) */}
        {(() => {
          const CX = (diagram.center && diagram.center[0]) || 500;
          const CY = (diagram.center && diagram.center[1]) || 500;
          const per = diagram.perimeter || [];
          return per.map((p, i) => {
            const vx = CX - p.x, vy = CY - p.y;
            const L = Math.max(1, Math.hypot(vx, vy));
            const ux = vx / L, uy = vy / L;
            const d1 = p.sat1 || 52; // смещения внутрь
            const d2 = p.sat2 || 98;
            const r1 = p.satR1 || (p.variant === 'big' ? 18 : 14);
            const r2 = p.satR2 || (p.variant === 'big' ? 16 : 12);
            const s1 = { x: p.x + ux * d1, y: p.y + uy * d1 };
            const s2 = { x: p.x + ux * d2, y: p.y + uy * d2 };
            return (
              <g key={`per-sat-${i}`}>
                <circle cx={s1.x} cy={s1.y} r={r1} fill="white" stroke="currentColor" strokeWidth="2" />
                <circle cx={s2.x} cy={s2.y} r={r2} fill="white" stroke="currentColor" strokeWidth="2" />
              </g>
            );
          });
        })()}

        {/* Подписи к диагоналям — поверх узлов, смещаем вдоль линии от центра */}
        {(diagram.axes || []).map((ax,i)=>{
          if (!ax.label) return null;
          const a = anchors[ax.from] || ax.from; const b = anchors[ax.to] || ax.to; if(!a||!b) return null;
          const dx=b[0]-a[0], dy=b[1]-a[1];
          const len=Math.max(1, Math.hypot(dx,dy));
          const t = Math.max(0, Math.min(1, ax.labelT ?? 0.62)); // 0..1 вдоль линии (0.5 — центр)
          const px = a[0] + dx*t, py = a[1] + dy*t;
          const nx = -dy/len, ny = dx/len; // нормаль (перпендикуляр)
          const off = ax.labelOffset ?? 28; // отвод от линии
          const x = px + nx*off, y = py + ny*off;
          const angle = Math.atan2(dy, dx) * 180/Math.PI;
          return (
            <text key={`ax-label-${i}`} x={x} y={y} textAnchor="middle"
                  transform={`rotate(${angle}, ${x}, ${y})`} dy="0.35em"
                  fontSize={ax.fontSize||14} fontWeight={700}
                  fill={ax.labelColor||ax.color||'#111'}
                  stroke={ax.labelStroke||'white'} strokeWidth={ax.labelStrokeWidth||3}
                  style={{ paintOrder:'stroke fill', pointerEvents:'none' }}>
              {ax.label}
            </text>
          );
        })}

        {/* Подписи вершин, возрастные подписи (с обводкой, чтобы не терялись) */}
        {(diagram.vertexLabels || []).map((t,i)=> (
          <text
            key={`vl-${i}`}
            x={t.x}
            y={t.y}
            fontSize={t.fontSize||14}
            fontWeight={t.weight||700}
            fill={t.color||'#111'}
            stroke={t.stroke||'white'}
            strokeWidth={t.strokeWidth||3}
            style={{ paintOrder: 'stroke fill', pointerEvents:'none' }}
            textAnchor={t.anchor||'middle'}
          >
            {t.text}
          </text>
        ))}

        {/* Точки возраста */}
        {(diagram.dots || []).map((d,i)=> (
          <circle key={`dot-${i}`} cx={d.x} cy={d.y} r={d.r||2.5} fill={d.color||'#000'} />
        ))}

        {/* Сателлиты на диагоналях (по 2 круга вдоль оси от центра к "to" или "from") */}
        {(() => {
          const CX = (diagram.center && diagram.center[0]) || 500;
          const CY = (diagram.center && diagram.center[1]) || 500;
          const axes = diagram.axes || [];
          return axes.map((ax, i) => {
            const a = anchors[ax.from] || ax.from; const b = anchors[ax.to] || ax.to; if(!a||!b) return null;
            const side = ax.satSide || 'to';
            const target = side === 'from' ? a : b;
            const vx = target[0] - CX, vy = target[1] - CY;
            const L = Math.max(1, Math.hypot(vx, vy));
            const ux = vx / L, uy = vy / L;
            const d1 = ax.satD1 || 90; // px от центра
            const d2 = ax.satD2 || 150;
            const r1 = ax.satR1 || 14;
            const r2 = ax.satR2 || 12;
            const s1 = { x: CX + ux * d1, y: CY + uy * d1 };
            const s2 = { x: CX + ux * d2, y: CY + uy * d2 };
            return (
              <g key={`axis-sat-${i}`} style={{ pointerEvents: 'none' }}>
                <circle cx={s1.x} cy={s1.y} r={r1} fill="white" stroke="currentColor" strokeWidth="2" />
                <circle cx={s2.x} cy={s2.y} r={r2} fill="white" stroke="currentColor" strokeWidth="2" />
              </g>
            );
          });
        })()}

        {/* Иконки */}
        {(diagram.iconTexts || []).map((it,i)=> (
          <text key={`it-${i}`} x={it.x} y={it.y} fontSize={it.size||18} textAnchor="middle" fill={it.color||'currentColor'}>{it.text}</text>
        ))}
      </svg>
    </div>
  );
}

/** ------------------------
 *  Основной компонент
 *  ------------------------ */
function buildTarot22Fallback(dob){
  // Простая геометрия вокруг центра 500,500
  const C = [500,500];
  const R = 420; // большой радиус
  const toXY = (deg, r=R) => [500 + r*Math.cos((Math.PI/180)*deg), 500 + r*Math.sin((Math.PI/180)*deg)];
  const anchors = {
    // вершины октагона по образцу (A=0, E=10, B=20, J=30, V=40, I=50, G=60, Z=70)
    A: toXY(180), E: toXY(-135), B: toXY(-90), J: toXY(-45), V: toXY(0), I: toXY(45), G: toXY(90), Z: toXY(135),
    C,
    iR: toXY(0, 260), iL: toXY(180, 260), iT: toXY(-90, 260), iB: toXY(90, 260),
  };

  // Рамка октагон + внутренний ромб
  const frame = {
    octagon: [anchors.A, anchors.E, anchors.B, anchors.J, anchors.V, anchors.I, anchors.G, anchors.Z],
    diamond: [toXY(-90,320), toXY(0,320), toXY(90,320), toXY(180,320)],
    strokeWidth: 4,
  };

  // Узлы (крупные кольца на A,B,V,G; обычные на E,J,I,Z; вертикальная цепочка и центр)
  const nodes = [
    { id:'A', x: anchors.A[0], y: anchors.A[1], arcana: 14, variant:'major', ring:{color:'#b78ad1', width:12} },
    { id:'B', x: anchors.B[0], y: anchors.B[1], arcana: 9, variant:'major', ring:{color:'#b78ad1', width:12} },
    { id:'V', x: anchors.V[0], y: anchors.V[1], arcana: 14, variant:'major', ring:{color:'#ff6b6b', width:12} },
    { id:'G', x: anchors.G[0], y: anchors.G[1], arcana: 5, variant:'major', ring:{color:'#ff6b6b', width:12} },
    { id:'E', x: anchors.E[0], y: anchors.E[1], arcana: 0, variant:'major' },
    { id:'J', x: anchors.J[0], y: anchors.J[1], arcana: 30, variant:'major' },
    { id:'I', x: anchors.I[0], y: anchors.I[1], arcana: 50, variant:'major' },
    { id:'Z', x: anchors.Z[0], y: anchors.Z[1], arcana: 70, variant:'major' },
    // Центр и вертикальная линия оттенков
    { id:'center', x:C[0], y:C[1], arcana:11, variant:'center', fill:'rgba(255,230,0,0.9)', textColor:'#000' },
    { id:'vt1', x:C[0], y:C[1]-120, arcana:11, r:20, fill:'#6ea8ff' },
    { id:'vt2', x:C[0], y:C[1]-70, arcana:20, r:18, fill:'#8cc9ff' },
    { id:'vt3', x:C[0], y:C[1]-30, arcana:4, r:16, fill:'#b9e3ff' },
    { id:'vm1', x:C[0], y:C[1]+60, arcana:4, r:16, fill:'#8cff8c' },
    { id:'vm2', x:C[0]+120, y:C[1]+80, arcana:10, r:18, fill:'#fff' },
    { id:'vm3', x:C[0]+160, y:C[1]+40, arcana:8, r:18, fill:'#fff' },
  ];

  const zones = [
    { label:'Канал отношений', points:['C','Z','G'], fill:'rgba(255,105,180,0.25)', stroke:'currentColor' },
    { label:'Денежный канал', points:['C','V','I'], fill:'rgba(0,200,160,0.25)', stroke:'currentColor' },
  ];

  // Внешние узлы периметра — восемь вершин октагона
  const perimeter = [
    { x: anchors.B[0], y: anchors.B[1], arcana: 9,  variant:'big', ring:{ color:'#b78ad1', width:14, pad:8 } },   // 20 лет (фиолетовый)
    { x: anchors.J[0], y: anchors.J[1], arcana: 30, variant:'big' },  // 30 лет
    { x: anchors.V[0], y: anchors.V[1], arcana: 14, variant:'big', ring:{ color:'#ff6b6b', width:14, pad:8 } },  // 40 лет (красный)
    { x: anchors.I[0], y: anchors.I[1], arcana: 50, variant:'big', sat1:72, sat2:128 },  // 50 лет — сателлиты дальше внутрь
    { x: anchors.G[0], y: anchors.G[1], arcana: 5,  variant:'big', ring:{ color:'#ff6b6b', width:14, pad:8 } },   // 60 лет (красный)
    { x: anchors.Z[0], y: anchors.Z[1], arcana: 70, variant:'big' },   // 70 лет
    { x: anchors.A[0], y: anchors.A[1], arcana: 14, variant:'big', ring:{ color:'#b78ad1', width:14, pad:8 } },   // 0 лет (фиолетовый)
    { x: anchors.E[0], y: anchors.E[1], arcana: 0,  variant:'big', sat1:72, sat2:128 },   // 10 лет — сателлиты дальше внутрь
  ];

  // Возрастные подписи около вершин
  const vertexLabels = [
    { x: anchors.A[0]-42, y: anchors.A[1]+6,  text:'0 лет',  anchor:'end' },
    { x: anchors.E[0]-34, y: anchors.E[1]-16, text:'10 лет', anchor:'end' },
    { x: anchors.B[0],    y: anchors.B[1]-44, text:'20 лет', anchor:'middle' },
    { x: anchors.J[0]+34, y: anchors.J[1]-16, text:'30 лет', anchor:'start' },
    { x: anchors.V[0]+42, y: anchors.V[1]+6,  text:'40 лет', anchor:'start' },
    { x: anchors.I[0]+34, y: anchors.I[1]+24, text:'50 лет', anchor:'start' },
    { x: anchors.G[0],    y: anchors.G[1]+44, text:'60 лет', anchor:'middle' },
    { x: anchors.Z[0]-34, y: anchors.Z[1]+24, text:'70 лет', anchor:'end' },
  ];

  // Много мелких точек на каждой стороне октагона (имитация возраста между десятилетиями)
  const dots = [];
  const sides = [[anchors.A,anchors.E],[anchors.E,anchors.B],[anchors.B,anchors.J],[anchors.J,anchors.V],[anchors.V,anchors.I],[anchors.I,anchors.G],[anchors.G,anchors.Z],[anchors.Z,anchors.A]];
  sides.forEach(([p1,p2])=>{
    for(let i=1;i<6;i++){
      const t=i/6; const x=p1[0]+(p2[0]-p1[0])*t; const y=p1[1]+(p2[1]-p1[1])*t; dots.push({x,y,r:2.2,color:'#111'});
    }
  });

  // Диагонали муж/жен родов + центральный крест (горизонталь/вертикаль)
  const axes = [
    { from:'Z', to:'J', color:'#3b82f6', width:2, label:'Линия мужского рода', labelColor:'#3b82f6', labelT:0.75, labelOffset:28, satSide:'to', satD1:100, satD2:160 },
    { from:'E', to:'I', color:'#f43f5e', width:2, label:'Линия женского рода', labelColor:'#f43f5e', labelT:0.25, labelOffset:28, satSide:'to', satD1:100, satD2:160 },
    { from:'A', to:'V', color:'currentColor', width:2, opacity:.35 },
    { from:'B', to:'G', color:'currentColor', width:2, opacity:.35 },
  ];

  // Ровные окружности (вместо эллиптических дуг — без «рваных» стыков)
  const circles = [
    { r: 330, stroke:'currentColor', width:2, opacity: .9 },
    { r: 260, stroke:'currentColor', width:2, opacity: .9 },
  ];

  const bubbles = [ { x: C[0], y: C[1]+90, text: 'Зона комфорта' } ];

  const iconTexts = [
    { x: C[0]+120, y: C[1]+110, text:'❤', size:22, color:'#ff4d6d' },
    { x: C[0]+160, y: C[1]+80, text:'$', size:22, color:'#22c55e' },
  ];

  return { anchors, frame, nodes, zones, perimeter, vertexLabels, dots, axes, circles, bubbles, iconTexts };
}

export default function MatrixSection() {
  const { isAuthed, profile } = useAuthStatus();
  const plan = planFromProfile(profile);

  const [dob, setDob] = React.useState("");
  const [mode, setMode] = React.useState("tarot22"); // 'pythagor' | 'tarot22'
  const [serverData, setServerData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const abortRef = React.useRef(null);

  const canCalc = Boolean(dob);

  const onCalc = React.useCallback(async () => {
    if (!canCalc) return;
    setError("");
    setLoading(true);
    setServerData(null);
    try {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      const data = await calcMatrix(dob, { mode, signal: abortRef.current.signal });
      setServerData(data || null);
    } catch (e) {
      setError(e?.message || "Ошибка запроса");
    } finally {
      setLoading(false);
    }
  }, [dob, canCalc, mode]);

  React.useEffect(() => () => { try { abortRef.current?.abort(); } catch {} }, []);

  const quickDates = ["1995-03-21", "2001-10-10", "1988-07-14"];

  const counts = serverData?.counts ?? null;
  const core   = serverData?.core   ?? null;
  const arrows = serverData?.arrows ?? null;

  return (
    <Section id="matrix">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3" style={{ color: "var(--text)" }}>
            <Star /> Матрица судьбы
          </h2>
          <div className="rounded-2xl p-1 bg-white/5 border border-white/10 hidden md:flex">
            {[
              {k:'tarot22', label:'22 Аркана'},
              {k:'pythagor', label:'Пифагор'},
            ].map(t => (
              <button
                key={t.k}
                onClick={()=>setMode(t.k)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${mode===t.k? 'bg-[var(--primary)] text-white' : 'text-[var(--text)]/80 hover:bg-white/10'}`}
              >{t.label}</button>
            ))}
          </div>
        </div>
        <PlanBadge plan={plan} />
      </div>

      <p className="mt-2 max-w-2xl" style={{ color: "var(--text)", opacity: 0.8 }}>
        Введите дату рождения и получите базовую Пифагорову матрицу. Расчёт выполняется на сервере.
        В платных тарифах доступны расширенные трактовки, совместимость и профессиональные инструменты.
      </p>

      <div className="mt-6 grid lg:grid-cols-2 gap-8">
        {/* Левая колонка: калькулятор */}
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm" style={{ color: "var(--text)", opacity: 0.7 }}>Дата рождения</span>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="mt-1 w-full rounded-2xl px-4 py-3 outline-none border border-muted"
              style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)" }}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {quickDates.map((d) => (
                <button key={d} type="button" onClick={() => setDob(d)}
                        className="rounded-xl px-3 py-1 text-xs border border-muted"
                        style={{ color: "var(--text)", background: "transparent" }}>
                  {d}
                </button>
              ))}
            </div>
          </label>

          <div className="flex items-center gap-3">
            <button
              onClick={onCalc}
              disabled={!canCalc || loading}
              className="rounded-2xl px-5 py-3 font-semibold border border-muted disabled:opacity-60"
              style={{ background: "transparent", color: "var(--text)" }}
            >
              {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Считаем…</span> : "Рассчитать"}
            </button>

            {dob && !loading && (
              <button onClick={() => { setServerData(null); setError(""); }}
                      className="rounded-2xl px-4 py-3 text-sm border border-muted"
                      style={{ background: "transparent", color: "var(--text)" }}>
                Очистить
              </button>
            )}
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm" role="status" aria-live="polite"
                 style={{ background: "color-mix(in srgb, var(--text) 8%, transparent)", color: "var(--text)" }}>
              Ошибка: {error}
            </div>
          )}

          {mode === 'pythagor' && (
            <MatrixGrid counts={counts} loading={loading} />
          )}

          {/* ⬇️ Диаграмма 22 арканов */}
          {mode === 'tarot22' && (
            <MatrixDiagram diagram={serverData?.diagram || buildTarot22Fallback(dob)} />
          )}

          {/* Краткий ликбез */}
          {mode === 'tarot22' ? (
            <div className="rounded-3xl border border-muted p-6"
                 style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)" }}>
              <h3 className="text-lg font-semibold">Как читать матрицу (22 Аркана)</h3>
              <ul className="mt-3 list-disc pl-6 space-y-2 opacity-90 text-sm">
                <li><b>Центр (11)</b>: ядро личности, то, на что вы опираетесь. Подпись «Зона комфорта» ниже центра показывает безопасную точку опоры.</li>
                <li><b>Вертикальная ось</b>: духовный стержень и состояние энергии. Верхние круги — устремления и идеалы; нижние — воплощение в деле.</li>
                <li><b>Диагонали</b>: синяя — линия мужского рода (70→30), розовая — линия женского рода (10→50). Смотрите, какие арканы активны на концах и пересечениях.</li>
                <li><b>Периметр</b>: крупные вершины — ключевые рубежи (0/20/40/60), средние — 10/30/50/70. Малые точки между ними — шаги возраста внутри десятилетий.</li>
                <li><b>Окружности</b>: внешняя — «социальные задачи», внутренняя — личная сфера. Узлы, стоящие ближе к внешней, требуют проявления во внешний мир.</li>
                <li><b>Канал отношений</b> (розовый сектор): путь развития в партнёрстве. Смотрите арканы в вершинах сектора и по пути к центру — это стиль взаимодействия.</li>
                <li><b>Денежный канал</b> (зелёный сектор): способ монетизации таланта. Арканы на гранях сектора подсказывают, что приносит доход и при каких условиях.</li>
                <li><b>Октагон</b>: жизненный цикл. Движение по часовой стрелке отражает взросление; отметьте текущий возраст и смотрите, на какой грани сейчас фокус.</li>
                <li><b>Суммирование арканов</b>: значения свыше 22 приводятся к 1–22 (складываем цифры до базового). Нулевые/пустые — зона роста и обучения.</li>
                <li><b>Баланс</b>: избыток одинаковых арканов — усиление темы, дефицит — слепая зона. Важны связи между узлами, а не только отдельные числа.</li>
                <li><b>Как работать</b>: сформулируйте вопрос → отметьте текущую точку возраста → проследите активные линии/зоны → сформулируйте 1–2 действия на ближайшие 7–14 дней.</li>
              </ul>
              <div className="mt-4 text-sm opacity-70">Подробные расшифровки каналов и линий доступны в тарифах Pro и Expert.</div>
            </div>
          ) : (
            <div className="rounded-3xl border border-muted p-6"
                 style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)" }}>
              <h3 className="text-lg font-semibold">Как читать матрицу</h3>
              <ul className="mt-3 list-disc pl-6 space-y-2 opacity-90">
                <li><b>Единицы</b> — воля и инициатива.</li>
                <li><b>Двойки</b> — энергия и ресурсы.</li>
                <li><b>Тройки</b> — коммуникация и творчество.</li>
                <li><b>Пятёрки</b> — логика, дисциплина, структура.</li>
                <li><b>Девятки</b> — духовность, ценности, смысл.</li>
              </ul>
              <div className="mt-4 text-sm opacity-70">Расширенные трактовки доступны в тарифах Pro и выше.</div>
            </div>
          )}
        </div>

        {/* Правая колонка: Pro/Expert фичи */}
        <div className="space-y-4">
          <FeatureCard icon={<BadgeCheck className="w-5 h-5" />} title="Ядро личности (Life Path, Destiny, Soul, Personality)"
                       locked={plan === "free"} cta="Pro">
            {plan === "free" ? (
              <>Подробная интерпретация ключевых чисел, сильных и слабых сторон. Также включает общий совет на месяц.</>
            ) : (
              <div className="space-y-2">
                {core ? (
                  <>
                    <div className="text-sm">
                      <div><b>Life Path:</b> {core.life_path}</div>
                      <div><b>Destiny:</b> {core.destiny}</div>
                      <div><b>Soul:</b> {core.soul}</div>
                      <div><b>Personality:</b> {core.personality}</div>
                      {core.maturity != null && <div><b>Maturity:</b> {core.maturity}</div>}
                    </div>
                    {serverData?.advice && <div className="mt-2 opacity-80"><b>Совет:</b> {serverData.advice}</div>}
                  </>
                ) : (
                  <div className="opacity-70">Рассчитайте матрицу, чтобы увидеть значения.</div>
                )}
              </div>
            )}
          </FeatureCard>

          <FeatureCard icon={<Users className="w-5 h-5" />} title="Совместимость (быстрый расчёт)"
                       locked={plan === "free"} cta="Pro">
            {plan === "free" ? (
              <>Введите вторую дату и получите базовый % совместимости и ключевые зоны внимания.</>
            ) : (
              <CompatibilityMini disabled={!isAuthed} dob1={dob} />
            )}
          </FeatureCard>

          <FeatureCard icon={<Crown className="w-5 h-5" />} title="Expert: стрелы Пифагора, заметки, экспорт"
                       locked={plan !== "expert"} cta="Expert" to="/experts">
            {plan !== "expert" ? (
              <>Профессиональные диаграммы (стрелы силы/характера), заметки клиента, экспорт в PDF, сохранение кейса.</>
            ) : (
              <div className="space-y-2">
                {arrows ? (
                  <ul className="list-disc pl-5">
                    {arrows.map((a) => (
                      <li key={a.id}><b>{a.name}:</b> {a.present ? "сформирована" : "нет"}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="opacity-70">Рассчитайте матрицу, чтобы увидеть стрелы.</div>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <a href="/experts/cases/new" className="rounded-xl px-3 py-2 text-sm border border-muted" style={{ color: "var(--text)" }}>
                    Сохранить как кейс
                  </a>
                  <button type="button" className="rounded-xl px-3 py-2 text-sm border border-muted"
                          style={{ color: "var(--text)" }}
                          onClick={() => window.dispatchEvent(new CustomEvent("amx:export-pdf", { detail: { dob, serverData } }))}>
                    Экспорт в PDF
                  </button>
                </div>
              </div>
            )}
          </FeatureCard>

          {plan === "free" && (
            <div className="rounded-2xl border border-dashed border-muted p-4"
                 style={{ background: "color-mix(in srgb, var(--text) 4%, transparent)", color: "var(--text)" }}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <div className="font-semibold">Разблокируйте Pro</div>
              </div>
              <div className="mt-1 text-sm opacity-80">Трактовки ядра личности, совместимость и персональные рекомендации.</div>
              <a href="/pricing" className="mt-3 inline-block rounded-xl px-3 py-2 text-sm font-semibold border border-muted"
                 style={{ background: "transparent", color: "var(--text)" }}>
                Перейти к тарифам
              </a>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

/** ------------------------
 *  Мини-виджет совместимости (Pro)
 *  ------------------------ */
function CompatibilityMini({ disabled, dob1 }) {
  const [dob2, setDob2] = React.useState("");
  const [score, setScore] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");

  const canCalc = Boolean(dob2) && !disabled;

  const onCalc = async () => {
    if (!canCalc) return;
    setErr("");
    setLoading(true);
    setScore(null);
    try {
      const data = await compatMatrix({ dob1: dob1 || null, dob2 }); // <-- API из файла src/api/matrix.js
      setScore(data?.score ?? null);
    } catch (e) {
      setErr(e?.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-xs opacity-70">Вторая дата</span>
        <input
          type="date"
          value={dob2}
          onChange={(e) => setDob2(e.target.value)}
          disabled={disabled}
          className="mt-1 w-full rounded-xl px-3 py-2 outline-none border border-muted disabled:opacity-60"
          style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)" }}
        />
      </label>
      <div className="flex items-center gap-2">
        <button
          onClick={onCalc}
          disabled={!canCalc || loading}
          className="rounded-xl px-3 py-2 text-sm border border-muted disabled:opacity-60"
          style={{ background: "transparent", color: "var(--text)" }}
        >
          {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Счёт…</span> : "Рассчитать"}
        </button>
        {typeof score === "number" && <span className="text-sm opacity-90">Совместимость: <b>{score}%</b></span>}
      </div>
      {err && <div className="text-xs opacity-70">Ошибка: {err}</div>}
      {disabled && <div className="text-xs opacity-70">Войдите, чтобы рассчитать совместимость.</div>}
    </div>
  );
}

/** ------------------------
 *  Карточка-обёртка для Pro/Expert фич
 *  ------------------------ */
function FeatureCard({ icon, title, locked = false, cta = "Pro", to = "/pricing", children }) {
  return (
    <div className="rounded-3xl border border-muted p-5 relative overflow-hidden"
         style={{ background: "color-mix(in srgb, var(--text) 6%, transparent)", color: "var(--text)" }}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <div className="font-semibold">{title}</div>
      </div>
      <div className={locked ? "opacity-70" : ""}>
        {children}
      </div>
      {locked && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] grid place-items-center">
          <a href={to}
             className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 font-semibold border border-white/30"
             style={{ background: "color-mix(in srgb, var(--text) 10%, transparent)", color: "var(--text)" }}>
            <Lock className="w-4 h-4" /> Разблокировать {cta}
          </a>
        </div>
      )}
    </div>
  );
}
