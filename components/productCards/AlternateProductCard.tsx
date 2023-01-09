import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink } from 'components/Links'
import { ProductCardLabels } from 'components/ProductCardLabels'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, useCallback, useState } from 'react'
import { Box, Button, Card, Flex, Heading, Spinner, SxStyleProp, Text } from 'theme-ui'
import { fadeInAnimation } from 'theme/animations'

interface AlternateProductCardProps {
  header: string
  background: string
  icon: string
  banner: {
    titleKey: string
    collateralsToBorrow: string[]
  }
  button: {
    labelKey: string
    link: string
    onClick?: () => void
  }
  labels?: {
    titleKey: string
    value: ReactNode
    textSx?: SxStyleProp
  }[]
}

export function AlternateProductCard({
  background,
  icon,
  banner: { collateralsToBorrow, titleKey },
  button,
  header,
  labels,
}: AlternateProductCardProps) {
  const { t } = useTranslation()
  const [clicked, setClicked] = useState(false)

  const handleClick = useCallback(() => {
    setClicked(true)
    button.onClick?.()
  }, [])

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      <Card
        sx={{
          height: '100%',
          p: '24px',
          border: 'none',
          borderRadius: 'large',
          background,
          ...fadeInAnimation,
        }}
      >
        <Flex
          sx={{
            position: 'absolute',
            top: '-55px',
            right: 0,
            left: 0,
            justifyContent: 'center',
            alignItems: 'center',
            height: '110px',
            width: '110px',
            margin: 'auto',
            backgroundColor: 'neutral10',
            borderRadius: '50%',
          }}
        >
          <Icon name={icon} size={110} />
        </Flex>
        <Flex
          sx={{ flexDirection: 'column', justifyContent: 'flex-start', gap: 3, height: '100%' }}
        >
          <Flex sx={{ justifyContent: 'center', mt: '45px' }}>
            <Heading sx={{ fontSize: 5 }}>{header}</Heading>
          </Flex>
          <Card sx={{ py: '24px', border: 'none', borderRadius: 'large' }}>
            <Flex sx={{ flexDirection: 'column', alignItems: 'center' }}>
              <Text as="p" sx={{ color: 'neutral80', fontSize: 2 }} variant="paragraph2">
                {t(titleKey)}
              </Text>
              <Text as="p" variant="boldParagraph1" sx={{ textAlign: 'center', fontSize: 2 }}>
                {collateralsToBorrow.join(', ')}
              </Text>
            </Flex>
          </Card>
          <ProductCardLabels
            labels={labels?.map((item) => ({ title: t(item.titleKey), ...item }))}
          />
          <Flex sx={{ mt: 'auto', px: 2 }}>
            <AppLink href={button.link} sx={{ width: '100%' }} onClick={handleClick}>
              <Button
                variant="primary"
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  columnGap: 1,
                  boxShadow: 'cardLanding',
                  backgroundColor: 'primary100',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'primary60',
                  },
                }}
              >
                {t(button.labelKey)}
                {clicked && (
                  <Spinner
                    variant="styles.spinner.medium"
                    size={20}
                    sx={{
                      color: 'white',
                      boxSizing: 'content-box',
                    }}
                  />
                )}
              </Button>
            </AppLink>
          </Flex>
        </Flex>
      </Card>
    </Box>
  )
}
