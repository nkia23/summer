import dynamic from 'next/dynamic'
import React from 'react'

export const UniSwapWidgetNoSSR = dynamic(
  () => {
    return import('../components/uniswapWidget/BasicUniWidget').then((c) => c.ClientComponent)
  },
  { ssr: false },
)

function JamesPage() {
  return (
    <>
      <UniSwapWidgetNoSSR />
      <>
        <b>James was 'ere</b>
      </>
    </>
  )
}

export default JamesPage
