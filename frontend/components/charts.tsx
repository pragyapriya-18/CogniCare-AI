'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*  Bar chart                                                                 */
/* -------------------------------------------------------------------------- */

export function BarChart({
  data,
  className,
  color = 'var(--chart-1)',
  unit = '',
}: {
  data: { label: string; value: number }[]
  className?: string
  color?: string
  unit?: string
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className={cn('flex h-full items-end gap-2 sm:gap-3', className)}>
      {data.map((d) => (
        <div key={d.label} className="group flex h-full flex-1 flex-col items-center gap-2">
          <div className="relative flex w-full flex-1 items-end justify-center">
            <div
              className="w-full max-w-10 rounded-t-lg transition-all duration-500 ease-out group-hover:opacity-100"
              style={{
                height: `${(d.value / max) * 100}%`,
                backgroundColor: color,
                opacity: 0.85,
              }}
            >
              <span className="sr-only">{`${d.value}${unit}`}</span>
            </div>
            <span className="pointer-events-none absolute -top-5 text-[11px] font-semibold text-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {d.value}
              {unit}
            </span>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Area / line trend chart                                                   */
/* -------------------------------------------------------------------------- */

export function TrendChart({
  data,
  className,
  color = 'var(--chart-1)',
  height = 200,
}: {
  data: { label: string; value: number }[]
  className?: string
  color?: string
  height?: number
}) {
  const id = React.useId()
  const w = 100
  const h = 100
  const pad = 6
  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((d.value - min) / range) * (h - pad * 2)
    return [x, y] as const
  })

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ')
  const areaPath = `${linePath} L${points[points.length - 1][0].toFixed(2)},${h - pad} L${points[0][0].toFixed(2)},${h - pad} Z`

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
        role="img"
        aria-label="Improvement trend line chart"
      >
        <defs>
          <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1={pad}
            x2={w - pad}
            y1={h * g}
            y2={h * g}
            stroke="var(--border)"
            strokeWidth="0.4"
            strokeDasharray="2 2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={areaPath} fill={`url(#grad-${id})`} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {points.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="1.6"
            fill="var(--card)"
            stroke={color}
            strokeWidth="1.4"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="mt-2 flex justify-between px-1">
        {data.map((d) => (
          <span key={d.label} className="text-[11px] font-medium text-muted-foreground">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Radial / ring progress                                                    */
/* -------------------------------------------------------------------------- */

export function RadialScore({
  value,
  max = 100,
  size = 140,
  strokeWidth = 12,
  color = 'var(--primary)',
  label,
  sublabel,
  className,
}: {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: React.ReactNode
  sublabel?: React.ReactNode
  className?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(1, value / max))
  const dash = circumference * pct

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label}
        {sublabel}
      </div>
    </div>
  )
}
