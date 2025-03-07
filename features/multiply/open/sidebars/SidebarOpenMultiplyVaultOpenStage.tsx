import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { StopLossTwoTxRequirement } from 'features/aave/components'
import { OpenMultiplyVaultChangesInformation } from 'features/multiply/open/containers/OpenMultiplyVaultChangesInformation'
import type { OpenMultiplyVaultState } from 'features/multiply/open/pipes/openMultiplyVault.types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'
import { OpenVaultAnimation } from 'theme/animations'

export function SidebarOpenMultiplyVaultOpenStage(props: OpenMultiplyVaultState) {
  const { t } = useTranslation()
  const { stage, openFlowWithStopLoss } = props

  switch (stage) {
    case 'txInProgress':
      return (
        <>
          {openFlowWithStopLoss && <StopLossTwoTxRequirement typeKey="system.vault" />}
          <OpenVaultAnimation />
        </>
      )
    case 'txSuccess':
      return (
        <>
          <OpenMultiplyVaultChangesInformation {...props} />
          <VaultChangesWithADelayCard />
        </>
      )
    default:
      return (
        <>
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('vault-form.subtext.review-manage')}
          </Text>
          <OpenMultiplyVaultChangesInformation {...props} />
        </>
      )
  }
}
