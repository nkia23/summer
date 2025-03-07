import { useAccountContext } from 'components/context'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import { SidebarVaultAllowanceStage } from 'components/vault/sidebar/SidebarVaultAllowanceStage'
import { SidebarVaultProxyStage } from 'components/vault/sidebar/SidebarVaultProxyStage'
import type { OpenGuniVaultState } from 'features/earn/guni/open/pipes/openGuniVault.types'
import { SidebarOpenGuniVaultEditingState } from 'features/earn/guni/open/sidebars/SidebarOpenGuniVaultEditingState'
import { SidebarOpenGuniVaultOpenStage } from 'features/earn/guni/open/sidebars/SidebarOpenGuniVaultOpenStage'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarStatus } from 'features/sidebar/getSidebarStatus'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { getTextButtonLabel } from 'features/sidebar/getTextButtonLabel'
import { progressTrackingEvent, regressTrackingEvent } from 'features/sidebar/trackingEvents'
import type { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { useAppConfig } from 'helpers/config'
import { extractGasDataFromState } from 'helpers/extractGasDataFromState'
import {
  extractPrimaryButtonLabelParams,
  extractSidebarTxData,
} from 'helpers/extractSidebarHelpers'
import { isFirstCdp } from 'helpers/isFirstCdp'
import { useObservable } from 'helpers/observableHook'
import React from 'react'
import { Grid } from 'theme-ui'

export function SidebarOpenGuniVault(props: OpenGuniVaultState) {
  const { accountData$ } = useAccountContext()
  const [accountData] = useObservable(accountData$)

  const {
    canProgress,
    canRegress,
    currentStep,
    id,
    isAllowanceStage,
    isEditingStage,
    isLoadingStage,
    isOpenStage,
    isProxyStage,
    isSuccessStage,
    progress,
    regress,
    stage,
    token,
    totalSteps,
  } = props

  const flow: SidebarFlow = 'openGuni'
  const firstCDP = isFirstCdp(accountData)
  const gasData = extractGasDataFromState(props)
  const primaryButtonLabelParams = extractPrimaryButtonLabelParams(props)
  const sidebarTxData = extractSidebarTxData(props)
  const { ProxyCreationDisabled: isProxyCreationDisabled } = useAppConfig('features')

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow, stage, token }),
    content: (
      <Grid gap={3}>
        {isEditingStage && <SidebarOpenGuniVaultEditingState {...props} />}
        {isProxyStage && <SidebarVaultProxyStage stage={stage} gasData={gasData} />}
        {isAllowanceStage && <SidebarVaultAllowanceStage {...props} token="DAI" />}
        {isOpenStage && <SidebarOpenGuniVaultOpenStage {...props} />}
      </Grid>
    ),
    primaryButton: {
      label: getPrimaryButtonLabel({ ...primaryButtonLabelParams, flow }),
      steps: !isSuccessStage ? [currentStep, totalSteps] : undefined,
      disabled: !canProgress || (isProxyStage && isProxyCreationDisabled),
      isLoading: isLoadingStage,
      action: () => {
        if (!isSuccessStage) progress!()
        progressTrackingEvent({ props, firstCDP })
      },
      url: isSuccessStage ? `/ethereum/maker/${id}` : undefined,
    },
    textButton: {
      label: getTextButtonLabel({ flow, stage, token }),
      hidden: !canRegress || isSuccessStage,
      action: () => {
        if (canRegress) regress!()
        regressTrackingEvent({ props })
      },
    },
    status: getSidebarStatus({ flow, ...sidebarTxData }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
