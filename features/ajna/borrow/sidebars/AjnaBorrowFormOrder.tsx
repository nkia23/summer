import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import {
  formatAmount,
  formatCryptoBalance,
  formatDecimalAsPercent,
} from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaBorrowFormOrder({ cached = false }: { cached?: boolean }) {
  const { t } = useTranslation()

  const {
    environment: { collateralToken, quoteToken },
    position: { currentPosition, simulation, cachedPosition },
  } = useAjnaBorrowContext()

  const positionData = cached && cachedPosition ? cachedPosition.currentPosition : currentPosition
  const simulationData = cached && cachedPosition ? cachedPosition.simulation : simulation

  const isLoading = !cached && simulation === undefined
  const formatted = {
    collateralLocked: formatCryptoBalance(positionData.collateralAmount),
    debt: formatCryptoBalance(positionData.debtAmount),
    ltv: formatDecimalAsPercent(positionData.riskRatio.loanToValue),
    liquidationPrice: formatCryptoBalance(positionData.liquidationPrice),
    availableToBorrow: formatAmount(positionData.debtAvailable, quoteToken),
    availableToWithdraw: formatAmount(positionData.collateralAvailable, collateralToken),
    afterLiquidationPrice:
      simulationData?.liquidationPrice && formatCryptoBalance(simulationData.liquidationPrice),
    afterLtv:
      simulationData?.riskRatio && formatDecimalAsPercent(simulationData.riskRatio.loanToValue),
    afterDebt: simulationData?.debtAmount && formatCryptoBalance(simulationData.debtAmount),
    afterCollateralLocked:
      simulationData?.collateralAmount && formatCryptoBalance(simulationData.collateralAmount),
    afterAvailableToBorrow:
      simulationData?.debtAvailable && formatAmount(simulationData?.debtAvailable, quoteToken),
    afterAvailableToWithdraw:
      simulationData?.collateralAvailable &&
      formatAmount(simulationData?.collateralAvailable, collateralToken),
  }

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: t('system.collateral-locked'),
          value: `${formatted.collateralLocked} ${collateralToken}`,
          secondaryValue: `${formatted.afterCollateralLocked} ${collateralToken}`,
          isLoading,
        },
        {
          label: t('vault-changes.ltv'),
          value: formatted.ltv,
          secondaryValue: formatted.afterLtv,
          isLoading,
        },
        {
          label: t('system.liquidation-price'),
          value: `${formatted.liquidationPrice} ${quoteToken}/${collateralToken}`,
          secondaryValue: `${formatted.afterLiquidationPrice} ${quoteToken}/${collateralToken}`,
          isLoading,
        },
        {
          label: t('system.debt'),
          value: `${formatted.debt} ${quoteToken}`,
          secondaryValue: `${formatted.afterDebt} ${quoteToken}`,
          isLoading,
        },
        {
          label: t('system.available-to-withdraw'),
          value: `${formatted.availableToWithdraw} ${collateralToken}`,
          secondaryValue: `${formatted.afterAvailableToWithdraw} ${collateralToken}`,
          isLoading,
        },
        {
          label: t('system.available-to-generate'),
          value: `${formatted.availableToBorrow} ${quoteToken}`,
          secondaryValue: `${formatted.afterAvailableToBorrow} ${quoteToken}`,
          isLoading,
        },
        {
          label: t('system.max-transaction-cost'),
          value: <GasEstimation />,
        },
      ]}
    />
  )
}
