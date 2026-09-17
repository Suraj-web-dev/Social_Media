import { Home, MessageCircle, Search, UserIcon, Users, Clapperboard } from 'lucide-react'

const logo = '/logo.svg'
const sample_cover = '/sample_cover.jpg'
const sample_profile = '/sample_profile.jpg'
const bgImage = '/bgImage.png'
const group_users = '/group_users.png'
const sponsored_img = '/sponsored_img.png'

export const assets = {
  logo,
  sample_cover,
  sample_profile,
  bgImage,
  group_users,
  sponsored_img,
}

export const menuItemsData = [
  { to: '/', label: 'Feed', Icon: Home },
  { to: '/reels', label: 'Reels', Icon: Clapperboard },
  { to: '/messages', label: 'Messages', Icon: MessageCircle },
  { to: '/connections', label: 'Connections', Icon: Users },
  { to: '/discover', label: 'Discover', Icon: Search },
  { to: '/profile', label: 'Profile', Icon: UserIcon },
]