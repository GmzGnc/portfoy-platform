import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { CandidateMolecule, Alert } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTL(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B TL`
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M TL`
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K TL`
    return `${value.toFixed(0)} TL`
  }
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value)
}

export function formatUSD(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`
    return `$${value.toLocaleString()}`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export function formatNumber(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
    return value.toLocaleString('tr-TR')
  }
  return value.toLocaleString('tr-TR')
}

export function formatPercent(value: number, decimals = 1): string {
  return `%${value.toFixed(decimals)}`
}

export function formatGrowth(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export function priorityLabel(p: CandidateMolecule['priority']): string {
  return { high: 'Yüksek Öncelik', medium: 'Orta', low: 'Düşük', watch: 'İzlemede' }[p]
}

export function priorityColor(p: CandidateMolecule['priority']): string {
  return {
    high: 'bg-brand-50 text-brand-600',
    medium: 'bg-amber-50 text-amber-700',
    low: 'bg-gray-100 text-gray-500',
    watch: 'bg-blue-50 text-blue-700',
  }[p]
}

export function patentStatusLabel(s: CandidateMolecule['patent']['status']): string {
  return {
    protected: 'Patent Korumalı',
    expired: 'Patent Sona Erdi',
    expiring_soon: 'Yakında Bitiyor',
    unknown: 'Bilinmiyor',
  }[s]
}

export function patentStatusColor(s: CandidateMolecule['patent']['status']): string {
  return {
    protected: 'text-red-600',
    expired: 'text-brand-600',
    expiring_soon: 'text-amber-600',
    unknown: 'text-gray-500',
  }[s]
}

export function alertTypeIcon(type: Alert['type']): string {
  return { critical: '●', warning: '◆', info: '○', opportunity: '★' }[type]
}

export function alertTypeColor(type: Alert['type']): string {
  return {
    critical: 'bg-red-500',
    warning: 'bg-amber-400',
    info: 'bg-blue-400',
    opportunity: 'bg-brand-400',
  }[type]
}

export function scoreColor(score: number): string {
  if (score >= 80) return '#1D9E75'
  if (score >= 60) return '#EF9F27'
  if (score >= 40) return '#378ADD'
  return '#E24B4A'
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Güçlü'
  if (score >= 60) return 'Orta'
  if (score >= 40) return 'Zayıf'
  return 'Çok Zayıf'
}

export function formatDate(date: Date | null | undefined, fmt: 'short' | 'medium' | 'long' = 'medium'): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('tr-TR', {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: 'numeric', month: 'long', year: 'numeric' },
    long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  }[fmt] as Intl.DateTimeFormatOptions).format(date instanceof Date ? date : new Date(date))
}

export function taskStatusLabel(s: string): string {
  return { open: 'Açık', in_progress: 'Devam Ediyor', done: 'Tamamlandı', blocked: 'Engellendi' }[s] ?? s
}

export function taskStatusColor(s: string): string {
  return {
    open: 'bg-blue-50 text-blue-700',
    in_progress: 'bg-amber-50 text-amber-700',
    done: 'bg-brand-50 text-brand-600',
    blocked: 'bg-red-50 text-red-700',
  }[s] ?? 'bg-gray-100 text-gray-500'
}
