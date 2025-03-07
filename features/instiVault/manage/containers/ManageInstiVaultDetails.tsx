import { MinActiveColRatioCard } from 'components/vault/detailsCards/MinActiveColRatio'
import { VaultDetailsCardCollateralLocked } from 'components/vault/detailsCards/VaultDetailsCardCollateralLocked'
import { VaultDetailsCardCollateralizationRatio } from 'components/vault/detailsCards/VaultDetailsCardCollaterlizationRatio'
import { VaultDetailsCardCurrentPrice } from 'components/vault/detailsCards/VaultDetailsCardCurrentPrice'
import {
  getAfterPillColors,
  getCollRatioColor,
  VaultDetailsCard,
} from 'components/vault/VaultDetails'
import dayjs from 'dayjs'
import { ManageVaultDetailsSummary } from 'features/borrow/manage/containers/ManageVaultDetails'
import type { ManageInstiVaultState } from 'features/borrow/manage/pipes/adapters/institutionalBorrowManageAdapter.types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid, Text } from 'theme-ui'

export function ManageInstiVaultDetails(props: ManageInstiVaultState) {
  const {
    vault: { token, lockedCollateral, lockedCollateralUSD },
    afterCollateralizationRatio,
    afterActiveCollRatioPriceUSD,
    afterLockedCollateralUSD,
    inputAmountsEmpty,
    stage,
    vault: { activeCollRatio, activeCollRatioPriceUSD, termEnd, currentFixedFee, nextFeeChange },
  } = props
  const { t } = useTranslation()
  const afterCollRatioColor = getCollRatioColor(props, afterCollateralizationRatio)
  const afterPill = {
    afterPillColors: getAfterPillColors(afterCollRatioColor),
    showAfterPill: !inputAmountsEmpty && stage !== 'manageSuccess',
  }
  return (
    <Box>
      <Grid variant="vaultDetailsCardsContainer">
        <MinActiveColRatioCard
          activeCollRatioPriceUSD={activeCollRatioPriceUSD}
          afterActiveCollRatioPriceUSD={afterActiveCollRatioPriceUSD}
          activeCollRatio={activeCollRatio}
          afterPill={afterPill}
        />
        <VaultDetailsCardCollateralizationRatio {...props} {...afterPill} />
        <VaultDetailsCardCurrentPrice {...props.priceInfo} />
        <VaultDetailsCardCollateralLocked
          depositAmountUSD={lockedCollateralUSD}
          afterDepositAmountUSD={afterLockedCollateralUSD}
          depositAmount={lockedCollateral}
          token={token}
          {...afterPill}
        />
        <VaultDetailsCard
          title={t('manage-insti-vault.card.current-fixed-fee')}
          value={formatDecimalAsPercent(currentFixedFee)}
          valueBottom={
            <>
              <Text as="span" sx={{ color: 'neutral80' }}>
                {t('manage-insti-vault.card.next-fee-change')}
              </Text>{' '}
              {nextFeeChange}
            </>
          }
          {...afterPill}
        />
        <VaultDetailsCard
          title={t('manage-insti-vault.card.term-end')}
          value={dayjs(termEnd).format('Do MMMM YYYY')}
          valueBottom={t('manage-insti-vault.card.days-remaining', {
            days: dayjs(termEnd).diff(dayjs(), 'days'),
          })}
          {...afterPill}
        />
      </Grid>
      <ManageVaultDetailsSummary {...props} {...afterPill} />
    </Box>
  )
}
