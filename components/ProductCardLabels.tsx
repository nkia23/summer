import React, { ReactNode } from 'react'
import { Flex, SxStyleProp, Text } from 'theme-ui'

interface ProductCardLabelsProps {
  labels?: {
    title: string
    value: ReactNode
  }[]
  textSx?: SxStyleProp
}

export function ProductCardLabels({ labels, textSx = {} }: ProductCardLabelsProps) {
  return (
    <Flex sx={{ flexDirection: 'column', justifyContent: 'space-around', px: 2, }}>
      {labels?.map(({ title, value }, index) => {
        return (
          <Flex
            key={`${index}-${title}`}
            sx={{
              flexDirection: 'row',
              rowGap: 2,
              justifyContent: 'space-between',
              lineHeight: '22px',
            }}
          >
            <Text as="span" sx={{ color: 'neutral80', pb: 1, ...textSx }} variant="paragraph4">
              {title}
            </Text>
            <Text as="span" variant="paragraph4">
              {value}
            </Text>
          </Flex>
        )
      })}
    </Flex>
  )
}
