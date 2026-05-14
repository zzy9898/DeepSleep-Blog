export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  技术: { bg: 'bg-blue-50/50', text: 'text-blue-600', border: 'border-blue-100', accent: '#3B82F6' },
  设计: { bg: 'bg-purple-50/50', text: 'text-purple-600', border: 'border-purple-100', accent: '#A855F7' },
  生活: { bg: 'bg-emerald-50/50', text: 'text-emerald-600', border: 'border-emerald-100', accent: '#10B981' },
  音乐: { bg: 'bg-rose-50/50', text: 'text-rose-600', border: 'border-rose-100', accent: '#F43F5E' },
  旅行: { bg: 'bg-amber-50/50', text: 'text-amber-600', border: 'border-amber-100', accent: '#F59E0B' },
};

export function getCategoryAccent(category: string | null | undefined) {
  return CATEGORY_COLORS[category || '']?.accent || '#E5E7EB';
}
