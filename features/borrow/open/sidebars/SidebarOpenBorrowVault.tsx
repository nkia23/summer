import { Context } from 'blockchain/network'
import { ALLOWED_MULTIPLY_TOKENS } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { AutomationContextProvider } from 'components/AutomationContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarVaultAllowanceStage } from 'components/vault/sidebar/SidebarVaultAllowanceStage'
import { SidebarVaultProxyStage } from 'components/vault/sidebar/SidebarVaultProxyStage'
import { SidebarVaultStopLossStage } from 'components/vault/sidebar/SidebarVaultStopLossStage'
import { openVaultWithStopLossAnalytics } from 'features/automation/common/helpers'
import { getDataForStopLoss } from 'features/automation/protection/stopLoss/openFlow/openVaultStopLoss'
import { SidebarAdjustStopLossEditingStage } from 'features/automation/protection/stopLoss/sidebars/SidebarAdjustStopLossEditingStage'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import { GeneralManageVaultState } from 'features/generalManageVault/generalManageVault'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarStatus } from 'features/sidebar/getSidebarStatus'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { getTextButtonLabel } from 'features/sidebar/getTextButtonLabel'
import { progressTrackingEvent, regressTrackingEvent } from 'features/sidebar/trackingEvents'
import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { extractGasDataFromState } from 'helpers/extractGasDataFromState'
import {
  extractPrimaryButtonLabelParams,
  extractSidebarTxData,
} from 'helpers/extractSidebarHelpers'
import { isFirstCdp } from 'helpers/isFirstCdp'
import { useObservable } from 'helpers/observableHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { SidebarOpenBorrowVaultEditingStage } from './SidebarOpenBorrowVaultEditingStage'
import { SidebarOpenBorrowVaultOpenStage } from './SidebarOpenBorrowVaultOpenStage'

export function SidebarOpenBorrowVault(props: OpenVaultState) {
  const { t } = useTranslation()
  const { accountData$ } = useAppContext()
  const [accountData] = useObservable(accountData$)

  const {
    canProgress,
    canRegress,
    currentStep,
    id,
    ilk,
    isAllowanceStage,
    isEditingStage,
    isLoadingStage,
    isOpenStage,
    isProxyStage,
    isStopLossEditingStage,
    isSuccessStage,
    progress,
    regress,
    skipStopLoss,
    stage,
    token,
    totalSteps,
    isStopLossSuccessStage,
    openFlowWithStopLoss,
    isAddStopLossStage,
    stopLossLevel,
    stopLossCloseType,
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    afterLiquidationPrice,
    priceInfo: { currentEthPrice, currentCollateralPrice, nextCollateralPrice },
    ilkData: { liquidationRatio, debtFloor, liquidationPenalty },
    generateAmount,
    depositAmount,
    proxyAddress,
    balanceInfo: { ethBalance },
  } = props

  const flow: SidebarFlow = !isStopLossEditingStage ? 'openBorrow' : 'addSl'
  const firstCDP = isFirstCdp(accountData)
  const canTransition = ALLOWED_MULTIPLY_TOKENS.includes(token)
  const gasData = extractGasDataFromState(props)
  const primaryButtonLabelParams = extractPrimaryButtonLabelParams(props)
  const sidebarTxData = extractSidebarTxData(props)
  const stopLossData = getDataForStopLoss(props, 'borrow')
  const isProxyCreationDisabled = useFeatureToggle('ProxyCreationDisabled')

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow, stage, token, openFlowWithStopLoss }),
    content: (
      <Grid gap={3}>
        {isEditingStage && <SidebarOpenBorrowVaultEditingStage {...props} />}
        {isStopLossEditingStage && (
          <AutomationContextProvider
            generalManageVault={
              {
                state: {
                  balanceInfo: { ethBalance },
                  vault: {
                    id: zero,
                    token,
                    ilk,
                    debt: generateAmount,
                    debtOffset: zero,
                    owner: proxyAddress,
                    controller: '0x0',
                    lockedCollateral: depositAmount,
                    collateralizationRatio: afterCollateralizationRatio,
                    collateralizationRatioAtNextPrice: afterCollateralizationRatioAtNextPrice,
                    liquidationPrice: afterLiquidationPrice,
                  },
                  priceInfo: { nextCollateralPrice },
                  ilkData: { liquidationRatio, debtFloor, liquidationPenalty },
                },
              } as GeneralManageVaultState
            }
            context={{ status: 'connected', account: '0x0', etherscan: { url: '' } } as Context}
            ethAndTokenPricesData={{ ETH: currentEthPrice, [token]: currentCollateralPrice }}
          >
            <SidebarAdjustStopLossEditingStage {...stopLossData} />{' '}
          </AutomationContextProvider>
        )}
        {isProxyStage && <SidebarVaultProxyStage stage={stage} gasData={gasData} />}
        {isAllowanceStage && <SidebarVaultAllowanceStage {...props} />}
        {isOpenStage && <SidebarOpenBorrowVaultOpenStage {...props} />}
        {isAddStopLossStage && <SidebarVaultStopLossStage {...props} />}
      </Grid>
    ),
    ...(isStopLossEditingStage && {
      headerButton: {
        label: t('protection.continue-without-stop-loss'),
        action: () => skipStopLoss!(),
      },
    }),
    primaryButton: {
      label: getPrimaryButtonLabel({ ...primaryButtonLabelParams, flow }),
      steps: !isSuccessStage && !isAddStopLossStage ? [currentStep, totalSteps] : undefined,
      disabled: !canProgress || (isProxyStage && isProxyCreationDisabled),
      isLoading: isLoadingStage,
      action: () => {
        if (!isSuccessStage && !isStopLossSuccessStage) progress!()
        progressTrackingEvent({ props, firstCDP })
        if (isAddStopLossStage) {
          openVaultWithStopLossAnalytics({
            id,
            ilk,
            stopLossLevel,
            stopLossCloseType,
            afterCollateralizationRatio,
          })
        }
      },
      url:
        (isSuccessStage && !openFlowWithStopLoss) || isStopLossSuccessStage ? `/${id}` : undefined,
    },
    textButton: {
      label: getTextButtonLabel({ flow, stage, token }),
      hidden:
        (!canRegress || isSuccessStage) &&
        (!isEditingStage || !canTransition || !isStopLossEditingStage),
      action: () => {
        if (canRegress) regress!()
        regressTrackingEvent({ props })
      },
      url: !canRegress && isEditingStage ? `/vaults/open-multiply/${ilk}` : undefined,
    },
    status: getSidebarStatus({ flow, ...sidebarTxData }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
