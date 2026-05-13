import { ImageResponse } from 'next/og'
import { BRAND_TITLE, SocialPreview } from './brand-media'

export const alt = `${BRAND_TITLE} social preview`

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(<SocialPreview width={size.width} height={size.height} />, {
    ...size,
  })
}