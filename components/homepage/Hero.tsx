import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink } from 'components/Links'
import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'
import { Flex, Heading, SxStyleProp, Text } from 'theme-ui'

interface HeroProps {
  heading: string
  isConnected: boolean
  subheading: ReactNode
  sx?: SxStyleProp
  withButton?: boolean
}

export function Hero({ heading, isConnected, subheading, sx, withButton = true }: HeroProps) {
  const { t } = useTranslation()

  return (
    <Flex
      sx={{
        position: 'relative',
        flexDirection: 'column',
        justifySelf: 'center',
        alignItems: 'center',
        mt: '24px',
        mb: 5,
        textAlign: 'center',
        ...sx,
      }}
    >
      <Heading as="h1" variant="header1" sx={{ mb: 3 }}>
        {heading}
      </Heading>
      <Text as="p" variant="paragraph1" sx={{ color: 'neutral80', maxWidth: '740px' }}>
        {subheading}
      </Text>
      {withButton && (
        <AppLink
          href={isConnected ? '/' : '/connect'}
          variant="primary"
          sx={{
            display: 'flex',
            mx: 'auto',
            mt: 4,
            px: '40px',
            py: 2,
            alignItems: 'center',
            '&:hover svg': {
              transform: 'translateX(10px)',
            },
          }}
          hash={isConnected ? 'product-cards-wrapper' : ''}
        >
          {isConnected ? t('see-products') : t('connect-wallet')}
          <Icon
            name="arrow_right"
            sx={{
              ml: 2,
              position: 'relative',
              left: 2,
              transition: '0.2s',
            }}
          />
        </AppLink>
      )}
    </Flex>
  )
}
