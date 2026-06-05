import { Tag } from 'lucide-react'
import {
  Briefcase, Heart, Wallet, BookOpen, Sparkles,
  Compass, Paintbrush, UserPlus, House, Joystick,
  Sun, Cpu,
} from 'lucide-react'

export const CATEGORIES = [
  { value: 'career',           label: 'Career',           Icon: Briefcase },
  { value: 'health',           label: 'Health & Fitness',  Icon: Heart },
  { value: 'finance',          label: 'Finance',          Icon: Wallet },
  { value: 'education',        label: 'Education',        Icon: BookOpen },
  { value: 'personal-growth',  label: 'Personal Growth',  Icon: Sparkles },
  { value: 'travel',           label: 'Travel',           Icon: Compass },
  { value: 'creative',         label: 'Creative',         Icon: Paintbrush },
  { value: 'social',           label: 'Social',           Icon: UserPlus },
  { value: 'home',             label: 'Home',             Icon: House },
  { value: 'hobbies',          label: 'Hobbies',          Icon: Joystick },
  { value: 'spiritual',        label: 'Spiritual',        Icon: Sun },
  { value: 'technology',       label: 'Technology',       Icon: Cpu },
]

export const DEFAULT_CATEGORY = CATEGORIES[0].value
export const FALLBACK_ICON = Tag

export function getCategory(value) {
  return CATEGORIES.find((c) => c.value === value) ?? null
}
