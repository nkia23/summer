import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { CancelAutoBSInfoSection } from 'features/automation/basicBuySell/InfoSections/CancelAutoBSInfoSection'
import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface SidebarAutoBuyRemovalEditingStageProps {
  vault: Vault
  ilkData: IlkData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  basicBuyState: BasicBSFormChange
}

export function SidebarAutoBuyRemovalEditingStage({
  vault,
  ilkData,
  errors,
  warnings,
  basicBuyState,
}: SidebarAutoBuyRemovalEditingStageProps) {
  const { t } = useTranslation()
  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('auto-buy.to-cancel-auto-buy')}
      </Text>
      <VaultErrors errorMessages={errors} ilkData={ilkData} />
      <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
      <AutoBuyInfoSectionControl vault={vault} basicBuyState={basicBuyState} />
    </>
  )
}

interface AutoBuyInfoSectionControlProps {
  vault: Vault
  basicBuyState: BasicBSFormChange
}

function AutoBuyInfoSectionControl({ vault, basicBuyState }: AutoBuyInfoSectionControlProps) {
  const { t } = useTranslation()
  return (
    <CancelAutoBSInfoSection
      collateralizationRatio={vault.collateralizationRatio}
      liquidationPrice={vault.liquidationPrice}
      title={t('auto-buy.cancel-summary-title')}
      basicBSState={basicBuyState}
      debt={vault.debt}
    />
  )
}
