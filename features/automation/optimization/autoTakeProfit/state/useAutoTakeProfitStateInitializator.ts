import BigNumber from 'bignumber.js'
import { collateralPriceAtRatio, ratioAtCollateralPrice } from 'blockchain/vault.maths'
import { useAppContext } from 'components/AppContextProvider'
import { AutoTakeProfitTriggerData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { useEffect } from 'react'

import { AUTO_TAKE_PROFIT_FORM_CHANGE } from './autoTakeProfitFormChange'

const INITIAL_SELECTED_PRICE_MULTIPLIER = 1.2

export function useAutoTakeProfitStateInitializator({
  debt,
  lockedCollateral,
  collateralizationRatio,
  autoTakeProfitTriggerData,
}: {
  debt: BigNumber
  lockedCollateral: BigNumber
  collateralizationRatio: BigNumber
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
}) {
  const { uiChanges } = useAppContext()
  const { executionPrice, isToCollateral, isTriggerEnabled, triggerId } = autoTakeProfitTriggerData

  const initialSelectedPrice = isTriggerEnabled
    ? executionPrice
    : collateralPriceAtRatio({
        colRatio: collateralizationRatio.times(INITIAL_SELECTED_PRICE_MULTIPLIER),
        collateral: lockedCollateral,
        vaultDebt: debt,
      })

  const initialSelectedColRatio = ratioAtCollateralPrice({
    lockedCollateral: lockedCollateral,
    collateralPriceUSD: initialSelectedPrice,
    vaultDebt: debt,
  })

  useEffect(() => {
    uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
      type: 'trigger-id',
      triggerId,
    })
    uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
      type: 'form-defaults',
      executionPrice: initialSelectedPrice,
      executionCollRatio: initialSelectedColRatio,
      toCollateral: isToCollateral,
    })
    uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
      type: 'close-type',
      toCollateral: isToCollateral,
    })
    uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
      type: 'current-form',
      currentForm: 'add',
    })
    uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
      type: 'tx-details',
      txDetails: {},
    })
  }, [triggerId.toNumber(), collateralizationRatio.toNumber()])

  return isTriggerEnabled
}
