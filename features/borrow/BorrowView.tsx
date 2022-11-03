import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { ProductCardBorrow } from '../../components/productCards/ProductCardBorrow'
import { ProductCardsFilter } from '../../components/productCards/ProductCardsFilter'
import { ProductHeader } from '../../components/ProductHeader'
import { borrowPageCardsData, productCardsConfig } from '../../helpers/productCards'
import { Hackathon } from '../aave/manage/sidebars/Hackathon'

export function BorrowView() {
  const { t } = useTranslation()
  const tab = window.location.hash.replace(/^#/, '')

  return (
    <Grid
      sx={{
        flex: 1,
        position: 'relative',
        mb: ['123px', '187px'],
      }}
    >
      <Hackathon />
    </Grid>
  )
}
