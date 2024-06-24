import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout(children) {
  return (
    <html lang="en">
      <body>{children}</body>
      <GoogleAnalytics gaId="G-CYVR2V7CTR" />
    </html>
  )
} 