export const getSpriteUrl = (name: string) => {
  const lower = name.toLowerCase()
  if (lower.includes('merlin')) return '/merlin.png'
  if (lower.includes('morgane')) return '/morgane.png'
  if (lower.includes('noir')) return '/black_knight.png'
  if (lower.includes('galahad')) return '/galahad.png'
  return '/lancelot.png'
}
