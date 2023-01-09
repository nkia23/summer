export const ajnaProductCards = {
  borrow: [
    {
      token: 'ETH',
      headerKey: 'ajna.product-cards.borrow-against-your',
      icon: 'ether_circle_color',
      background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
      banner: {
        titleKey: 'ajna.product-cards.collaterals-you-can-borrow',
        collateralsToBorrow: ['USDC', 'DAI', 'stETH', 'wBTC', 'renBTC'],
      },
      button: {
        link: '/',
        labelKey: 'get-started',
      },
      labels: [
        {
          titleKey: 'ajna.product-cards.annual-variable-rates',
          value: '0.25% ↑',
        },
      ],
    },
    {
      token: 'RETH',
      headerKey: 'ajna.product-cards.borrow-against-your',
      icon: 'reth_circle_color',
      background: 'linear-gradient(160.26deg, #FFEAEA 5.25%, #FFF5EA 100%)',
      banner: {
        titleKey: 'ajna.product-cards.collaterals-you-can-borrow',
        collateralsToBorrow: ['USDC', 'DAI', 'stETH', 'wBTC', 'renBTC'],
      },
      button: {
        link: '/',
        labelKey: 'get-started',
      },
      labels: [
        {
          titleKey: 'ajna.product-cards.annual-variable-rates',
          value: '0.25% ↑',
        },
      ],
    },
    {
      token: 'BTC',
      headerKey: 'ajna.product-cards.borrow-against-your',
      icon: 'btc_circle_color',
      background: 'linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)',
      banner: {
        titleKey: 'ajna.product-cards.collaterals-you-can-borrow',
        collateralsToBorrow: ['USDC', 'DAI', 'stETH', 'wBTC', 'renBTC'],
      },
      button: {
        link: '/',
        labelKey: 'get-started',
      },
      labels: [
        {
          titleKey: 'ajna.product-cards.annual-variable-rates',
          value: '0.25% ↑',
        },
      ],
    },
  ],
}

export const ajnaBenefitCards = [
  {
    header: 'landing.benefits.ajna.card-header-1',
    image: {
      src: '/static/img/info_cards/benefit_1.png',
      bottom: '0',
    },
    background: 'linear-gradient(160.47deg, #F0F3FD 0.35%, #FCF0FD 99.18%), #FFFFFF',
  },
  {
    header: 'landing.benefits.ajna.card-header-2',
    image: {
      src: '/static/img/info_cards/benefit_2.png',
      bottom: '30px',
      width: '382px',
      bgWidth: 'calc(100% - 64px)',
    },
    background: 'linear-gradient(160.47deg, #E0E8F5 0.35%, #F0FBFD 99.18%), #FFFFFF',
  },
  {
    header: 'landing.benefits.ajna.card-header-3',
    image: {
      src: '/static/img/info_cards/benefit_3.png',
      bottom: '0',
    },
    background: 'linear-gradient(147.66deg, #FEF1E1 0%, #FDF2CA 88.25%)',
  },
]
