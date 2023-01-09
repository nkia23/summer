import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { AssetPill } from 'components/AssetPill'
import { BenefitCard, BenefitCardsWrapper } from 'components/BenefitCard'
import { Hero } from 'components/homepage/Hero'
import { HomepageTabLayout } from 'components/homepage/HomepageTabLayout'
import { InfoCard } from 'components/InfoCard'
import { LandingBanner } from 'components/LandingBanner'
import { AppLink } from 'components/Links'
import { AlternateProductCard } from 'components/productCards/AlternateProductCard'
import { ProductCardsWrapper } from 'components/productCards/ProductCardsWrapper'
import { TabBar } from 'components/TabBar'
import { WithArrow } from 'components/WithArrow'
import { ajnaBenefitCards, ajnaProductCards } from 'features/ajna/common/content'
import { getAjnaWithArrowColorScheme } from 'features/ajna/common/helpers'
import { otherAssets } from 'features/ajna/controls/AjnaNavigationController'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'
import { slideInAnimation } from 'theme/animations'

export function AnjaHomepageView() {
  const { t } = useTranslation()
  const { isConnected } = useAccount()

  return (
    <Box
      sx={{
        flex: 1,
        ...slideInAnimation,
        position: 'relative',
        animationDuration: '0.4s',
        animationTimingFunction: 'cubic-bezier(0.7, 0.01, 0.6, 1)',
      }}
    >
      <Hero
        isConnected={isConnected}
        sx={{
          mt: '120px ',
        }}
        heading={t('landing.hero.ajna.headline')}
        subheading={
          <>
            <Text as="span">{t('landing.hero.ajna.subheader')} </Text>
            <AppLink href="https://kb.oasis.app/">
              <WithArrow
                gap={1}
                sx={{
                  display: 'inline-block',
                  fontSize: 4,
                  fontWeight: 'regular',
                  ...getAjnaWithArrowColorScheme(),
                }}
              >
                {t('landing.hero.ajna.link')}
              </WithArrow>
            </AppLink>
          </>
        }
        withButton={false}
      />
      <Box id="product-cards-wrapper" sx={{ mt: '80px' }}>
        <TabBar
          defaultTab="borrow"
          variant="large"
          useDropdownOnMobile
          sections={[
            {
              label: t('landing.tabs.ajna.borrow.tabLabel'),
              value: 'borrow',
              content: (
                <HomepageTabLayout
                  cards={
                    <ProductCardsWrapper sx={{ mt: [2, '144px'], gap: ['88px', '24px'] }}>
                      {ajnaProductCards.borrow.map(
                        ({ background, banner, button, headerKey, icon, labels, token }) => (
                          <AlternateProductCard
                            header={t(headerKey, { token: token })}
                            background={background}
                            icon={icon}
                            key={headerKey}
                            banner={banner}
                            button={button}
                            labels={labels}
                          />
                        ),
                      )}
                    </ProductCardsWrapper>
                  }
                />
              ),
            },
            {
              label: t('landing.tabs.ajna.multiply.tabLabel'),
              value: 'multiply',
              content: (
                <HomepageTabLayout
                  cards={
                    <ProductCardsWrapper sx={{ mt: ['9px', '48px'], gap: ['88px', 3, 3] }}>
                      {ajnaProductCards.borrow.map((card) => (
                        <AlternateProductCard
                          header={t(card.headerKey, { token: card.token })}
                          background={card.background}
                          icon={card.icon}
                          key={card.headerKey}
                          banner={card.banner}
                          button={card.button}
                          labels={card.labels}
                        />
                      ))}
                    </ProductCardsWrapper>
                  }
                />
              ),
            },
            {
              label: t('landing.tabs.ajna.earn.tabLabel'),
              value: 'earn',
              content: (
                <HomepageTabLayout
                  cards={
                    <ProductCardsWrapper sx={{ mt: ['9px', '48px'], gap: ['88px', 3, 3] }}>
                      {ajnaProductCards.borrow.map((card) => (
                        <AlternateProductCard
                          header={t(card.headerKey, { token: card.token })}
                          background={card.background}
                          icon={card.icon}
                          key={card.headerKey}
                          banner={card.banner}
                          button={card.button}
                          labels={card.labels}
                        />
                      ))}
                    </ProductCardsWrapper>
                  }
                />
              ),
            },
          ]}
        />
      </Box>
      {otherAssets && otherAssets?.length > 0 && (
        <Flex
          sx={{
            mt: '56px',
            pt: 5,
            flexDirection: 'column',
            alignItems: 'center',
            borderTop: '1px solid',
            borderColor: 'neutral20',
          }}
        >
          <Heading
            as="h2"
            sx={{
              fontSize: '28px',
              fontWeight: 'semiBold',
              mb: '40px',
              color: 'primary100',
              textAlign: 'center',
            }}
          >
            {t('ajna.other-assets')}
          </Heading>
          <Flex
            as="ul"
            sx={{
              flexWrap: 'wrap',
              columnGap: 3,
              rowGap: 2,
              listStyle: 'none',
              p: 0,
              justifyContent: 'center',
            }}
          >
            {otherAssets.map(({ link, token }, i) => (
              <Box key={i} as="li">
                <AssetPill icon={getToken(token).iconCircle} label={token} link={link} />
              </Box>
            ))}
          </Flex>
        </Flex>
      )}
      <Flex
        sx={{
          flexDirection: 'column',
          alignItems: 'center',
          mb: 7,
        }}
      >
        <Text as="p" variant="header3" sx={{ mt: [6, 6, 7], mb: 4, textAlign: 'center' }}>
          {t('landing.benefits.ajna.header')}
        </Text>
        <Text
          as="p"
          variant="paragraph1"
          sx={{ mb: [5, '48px'], color: 'neutral80', maxWidth: '740px', textAlign: 'center' }}
        >
          {t('landing.benefits.ajna.description')}
        </Text>
        <BenefitCardsWrapper>
          {ajnaBenefitCards.map((card) => (
            <BenefitCard
              header={card.header}
              image={card.image}
              key={card.header}
              background={card.background}
            />
          ))}
        </BenefitCardsWrapper>
      </Flex>
      <LandingBanner
        title={t('ajna.landing-banner.title')}
        description={t('ajna.landing-banner.description')}
        background="linear-gradient(160.65deg, #FFE6F5 2.52%, #FFF2F6 101.43%)"
        image={{
          src: '/static/img/setup-banner/anja-landing-banner.png',
        }}
        link={{
          href: 'link',
          label: t('ajna.landing-banner.linkLabel'),
        }}
        button={
          isConnected ? (
            <AppLink
              variant="primary"
              href="/connect"
              sx={{
                display: 'flex',
                px: '40px',
                py: 2,
                color: 'offWhite',
                alignItems: 'center',
                '&:hover svg': {
                  transform: 'translateX(10px)',
                },
              }}
            >
              {t('connect-wallet-button')}
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
          ) : null
        }
      />
      <Box
        sx={{
          mb: [3, 3, 6],
        }}
      >
        <Text as="p" variant="header3" sx={{ textAlign: 'center', mt: [6, 6, '205px'], mb: 4 }}>
          {t('landing.info-cards.have-some-questions')}
        </Text>
        <Grid
          gap={4}
          sx={{
            maxWidth: '854px',
            margin: 'auto',
            gridTemplateColumns: ['1fr', '1fr 1fr'],
          }}
        >
          <InfoCard
            title={t('landing.info-cards.learn.learn')}
            subtitle={t('landing.info-cards.learn.deep-dive')}
            links={[
              {
                href: 'https://www.ajna.finance/',
                text: t('ajna.learn.ajna-website'),
              },
              {
                href: 'https://kb.oasis.app/help/tutorials',
                text: t('landing.info-cards.learn.tutorials'),
              },
              {
                href: 'https://kb.oasis.app/help/borrow',
                text: t('landing.info-cards.learn.key-concepts'),
              },
            ]}
            backgroundGradient="linear-gradient(127.5deg, #EEE1F9 0%, #FFECE8 56.77%, #DDFFF7 100%)"
            backgroundImage="/static/img/info_cards/cubes_nov27.png"
          />
          <InfoCard
            title={t('landing.info-cards.support.support')}
            subtitle={t('landing.info-cards.support.contact-whenever')}
            links={[
              {
                href: 'https://kb.oasis.app/help/frequently-asked-questions',
                text: t('ajna.learn.anja-faq'),
              },
              {
                href: '/',
                text: t('ajna.learn.ajna-discord'),
              },
              {
                href: '/',
                text: t('ajna.learn.ajna-twitter'),
              },
              {
                href: 'https://discord.gg/oasisapp',
                text: t('ajna.learn.oasis-discord'),
              },
              {
                href: 'https://twitter.com/oasisdotapp',
                text: t('ajna.learn.oasis-twitter'),
              },
            ]}
            backgroundGradient="linear-gradient(135.35deg, #FEF7FF 0.6%, #FEE9EF 100%), radial-gradient(261.45% 254.85% at 3.41% 2.19%, #FFFADD 0%, #FFFBE3 0.01%, #F0FFF2 52.6%, #FBEDFD 100%)"
            backgroundImage="/static/img/info_cards/bubbles.png"
          />
        </Grid>
      </Box>
    </Box>
  )
}
