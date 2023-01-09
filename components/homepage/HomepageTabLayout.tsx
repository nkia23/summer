import React, { ReactNode } from 'react'
import { Flex, Text } from 'theme-ui'

interface HomepageTabLayoutProps {
  intro?: ReactNode
  cards: ReactNode
}

export function HomepageTabLayout({ intro, cards }: HomepageTabLayoutProps) {
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {intro && (
        <Text
          variant="paragraph2"
          sx={{
            mt: 4,
            mb: 5,
            color: 'neutral80',
            maxWidth: '617px',
            textAlign: 'center',
          }}
        >
          {intro}
        </Text>
      )}
      {cards}
    </Flex>
  )
}
