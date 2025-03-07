import type { IPosition } from '@oasisdex/dma-library'
import { amountFromWei } from '@oasisdex/utils'
import type BigNumber from 'bignumber.js'

import { calculateLiquidationPrice } from './calculate-liquidation-price'

export function calculateViewValuesForPosition(
  position: IPosition,
  collateralTokenPrice: BigNumber,
  debtTokenPrice: BigNumber,
  collateralLiquidityRate: BigNumber,
  debtVariableBorrowRate: BigNumber,
) {
  const collateral = amountFromWei(position.collateral.amount, position.collateral.precision)
  const debt = amountFromWei(position.debt.amount, position.debt.precision)

  // collateral * usdprice * maxLTV - debt * usdprice
  const buyingPower = collateral
    .times(collateralTokenPrice)
    .times(position.category.maxLoanToValue)
    .minus(debt.times(debtTokenPrice))

  // (collateral_amount * collateral_token_oracle_price - debt_token_amount * debt_token_oracle_price) / USDC_oracle_price
  const netValue = collateral.times(collateralTokenPrice).minus(debt.times(debtTokenPrice))

  const netValueInCollateralToken = netValue.div(collateralTokenPrice)
  const netValueInDebtToken = netValue.div(debtTokenPrice)

  const totalExposure = collateral

  const { liquidationPriceInDebt, liquidationPriceInCollateral } = calculateLiquidationPrice({
    collateral: {
      ...position.collateral,
    },
    debt: {
      ...position.debt,
    },
    liquidationRatio: position.category.liquidationThreshold,
  })

  // const liquidationPriceInDebt = NaNIsZero(
  //   debt.div(collateral.times(position.category.liquidationThreshold)),
  // )
  //
  // const liquidationPriceInCollateral = liquidationPriceInDebt.isZero()
  //   ? zero
  //   : NaNIsZero(one.div(liquidationPriceInDebt))

  const costOfBorrowingDebt = debtVariableBorrowRate.times(debt).times(debtTokenPrice)
  const profitFromProvidingCollateral = collateralLiquidityRate
    .times(collateral)
    .times(collateralTokenPrice)
  const netBorrowCostPercentage = costOfBorrowingDebt
    .minus(profitFromProvidingCollateral)
    .div(netValue)

  return {
    collateral,
    debt,
    buyingPower,
    netValue,
    netValueInCollateralToken,
    netValueInDebtToken,
    totalExposure,
    liquidationPriceInDebt,
    liquidationPriceInCollateral,
    netBorrowCostPercentage,
  }
}
