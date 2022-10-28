import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { useGasEstimationContext } from 'components/GasEstimationContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import {
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
  NEXT_COLL_RATIO_OFFSET,
} from 'features/automation/common/consts'
import { getAutoFeaturesSidebarDropdown } from 'features/automation/common/sidebars/getAutoFeaturesSidebarDropdown'
import { getAutomationFormFlow } from 'features/automation/common/sidebars/getAutomationFormFlow'
import { getAutomationFormTitle } from 'features/automation/common/sidebars/getAutomationFormTitle'
import { getAutomationPrimaryButtonLabel } from 'features/automation/common/sidebars/getAutomationPrimaryButtonLabel'
import { getAutomationStatusTitle } from 'features/automation/common/sidebars/getAutomationStatusTitle'
import { getAutomationTextButtonLabel } from 'features/automation/common/sidebars/getAutomationTextButtonLabel'
import { SidebarAutomationFeatureCreationStage } from 'features/automation/common/sidebars/SidebarAutomationFeatureCreationStage'
import { AutomationFeatures, SidebarAutomationStages } from 'features/automation/common/types'
import { StopLossCompleteInformation } from 'features/automation/protection/stopLoss/controls/StopLossCompleteInformation'
import { getSliderPercentageFill } from 'features/automation/protection/stopLoss/helpers'
import { SidebarAdjustStopLossEditingStage } from 'features/automation/protection/stopLoss/sidebars/SidebarAdjustStopLossEditingStage'
import { SidebarCancelStopLossEditingStage } from 'features/automation/protection/stopLoss/sidebars/SidebarCancelStopLossEditingStage'
import { stopLossSliderBasicConfig } from 'features/automation/protection/stopLoss/sliderConfig'
import {
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import {
  errorsStopLossValidation,
  warningsStopLossValidation,
} from 'features/automation/protection/stopLoss/validators'
import { TAB_CHANGE_SUBJECT } from 'features/generalManageVault/TabChange'
import { VaultType } from 'features/generalManageVault/vaultType'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import {
  extractCancelAutomationErrors,
  extractCancelAutomationWarnings,
} from 'helpers/messageMappers'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useHash } from 'helpers/useHash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

interface SidebarSetupStopLossProps {
  vaultType: VaultType
  isStopLossActive: boolean
  feature: AutomationFeatures
  stopLossState: StopLossFormChange
  txHandler: ({ callOnSuccess }: { callOnSuccess?: () => void }) => void
  textButtonHandler: () => void
  stage: SidebarAutomationStages
  isAddForm: boolean
  isRemoveForm: boolean
  isEditing: boolean
  isDisabled: boolean
  isFirstSetup: boolean
  closePickerConfig: PickCloseStateProps
  executionPrice: BigNumber
}

export function SidebarSetupStopLoss({
  vaultType,
  executionPrice,
  feature,

  stopLossState,
  txHandler,
  textButtonHandler,
  stage,

  isAddForm,
  isRemoveForm,
  isEditing,
  isDisabled,
  isFirstSetup,

  isStopLossActive,

  closePickerConfig,
}: SidebarSetupStopLossProps) {
  const stopLossWriteEnabled = useFeatureToggle('StopLossWrite')

  const { t } = useTranslation()
  const { uiChanges } = useAppContext()
  const {
    stopLossTriggerData,
    autoSellTriggerData,
    autoBuyTriggerData,
    constantMultipleTriggerData,
    commonData: {
      positionInfo: { debt, token, liquidationRatio, collateralizationRatioAtNextPrice },
      environmentInfo: { nextCollateralPrice, ethBalance, ethMarketPrice, etherscanUrl },
    },
  } = useAutomationContext()

  const gasEstimationContext = useGasEstimationContext()
  const [, setHash] = useHash()

  const flow = getAutomationFormFlow({ isFirstSetup, isRemoveForm, feature })
  const sidebarTitle = getAutomationFormTitle({
    flow,
    stage,
    feature,
  })
  const dropdown = getAutoFeaturesSidebarDropdown({
    type: 'Protection',
    forcePanel: AutomationFeatures.STOP_LOSS,
    disabled: isDropdownDisabled({ stage }),
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    isAutoSellEnabled: autoSellTriggerData.isTriggerEnabled,
    isAutoConstantMultipleEnabled: constantMultipleTriggerData.isTriggerEnabled,
    vaultType,
  })
  const primaryButtonLabel = getAutomationPrimaryButtonLabel({
    flow,
    stage,
    feature,
  })
  const textButtonLabel = getAutomationTextButtonLabel({ isAddForm })
  const sidebarStatus = getAutomationStatusTitle({
    flow,
    txHash: stopLossState.txDetails?.txHash,
    etherscan: etherscanUrl,
    stage,
    feature,
  })

  const max = autoSellTriggerData.isTriggerEnabled
    ? autoSellTriggerData.execCollRatio.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET).div(100)
    : constantMultipleTriggerData.isTriggerEnabled
    ? constantMultipleTriggerData.sellExecutionCollRatio
        .minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET)
        .div(100)
    : collateralizationRatioAtNextPrice.minus(NEXT_COLL_RATIO_OFFSET.div(100))
  const maxBoundry = new BigNumber(max.multipliedBy(100).toFixed(0, BigNumber.ROUND_DOWN))
  const liqRatio = liquidationRatio

  const sliderPercentageFill = getSliderPercentageFill({
    value: stopLossState.stopLossLevel,
    min: liquidationRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.div(100)).times(100),
    max: max.times(100),
  })

  const afterNewLiquidationPrice = stopLossState.stopLossLevel
    .dividedBy(100)
    .multipliedBy(nextCollateralPrice)
    .dividedBy(collateralizationRatioAtNextPrice)

  const sliderConfig: SliderValuePickerProps = {
    ...stopLossSliderBasicConfig,
    sliderPercentageFill,
    leftLabel: t('slider.set-stoploss.left-label'),
    rightLabel: t('slider.set-stoploss.right-label'),
    leftBoundry: stopLossState.stopLossLevel,
    rightBoundry: afterNewLiquidationPrice,
    lastValue: stopLossState.stopLossLevel,
    maxBoundry,
    minBoundry: liqRatio.multipliedBy(100).plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
    onChange: (slCollRatio) => {
      if (stopLossState.collateralActive === undefined) {
        uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
          type: 'close-type',
          toCollateral: false,
        })
      }

      uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
        type: 'stop-loss-level',
        stopLossLevel: slCollRatio,
      })
    },
  }

  const errors = errorsStopLossValidation({
    txError: stopLossState.txDetails?.txError,
    debt: debt,
    stopLossLevel: stopLossState.stopLossLevel,
    autoBuyTriggerData,
  })
  const warnings = warningsStopLossValidation({
    token: token,
    gasEstimationUsd: gasEstimationContext?.usdValue,
    ethBalance,
    ethPrice: ethMarketPrice,
    sliderMax: sliderConfig.maxBoundry,
    triggerRatio: stopLossState.stopLossLevel,
    isAutoSellEnabled: autoSellTriggerData.isTriggerEnabled,
    isConstantMultipleEnabled: constantMultipleTriggerData.isTriggerEnabled,
  })
  const cancelStopLossWarnings = extractCancelAutomationWarnings(warnings)
  const cancelStopLossErrors = extractCancelAutomationErrors(errors)

  if (isStopLossActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: sidebarTitle,
      dropdown,
      content: (
        <Grid gap={3}>
          {stopLossWriteEnabled ? (
            <>
              {(stage === 'stopLossEditing' || stage === 'txFailure') && (
                <>
                  {isAddForm && (
                    <SidebarAdjustStopLossEditingStage
                      executionPrice={executionPrice}
                      errors={errors}
                      warnings={warnings}
                      stopLossState={stopLossState}
                      isEditing={isEditing}
                      closePickerConfig={closePickerConfig}
                      sliderConfig={sliderConfig}
                    />
                  )}
                  {isRemoveForm && (
                    <SidebarCancelStopLossEditingStage
                      errors={cancelStopLossErrors}
                      warnings={cancelStopLossWarnings}
                      stopLossLevel={stopLossTriggerData.stopLossLevel}
                    />
                  )}
                </>
              )}
            </>
          ) : (
            <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
              {t('protection.adding-new-triggers-disabled-description')}
            </Text>
          )}
          {(stage === 'txSuccess' || stage === 'txInProgress') && (
            <>
              {(stage === 'txSuccess' || stage === 'txInProgress') && (
                <SidebarAutomationFeatureCreationStage
                  featureName={feature}
                  stage={stage}
                  isAddForm={isAddForm}
                  isRemoveForm={isRemoveForm}
                  customContent={
                    <StopLossCompleteInformation
                      afterStopLossRatio={stopLossState.stopLossLevel}
                      executionPrice={executionPrice}
                      isCollateralActive={stopLossState.collateralActive}
                      txCost={stopLossState.txDetails?.txCost!}
                    />
                  }
                />
              )}
            </>
          )}
        </Grid>
      ),
      primaryButton: {
        label: primaryButtonLabel,
        disabled: isDisabled || !!errors.length,
        isLoading: stage === 'txInProgress',
        action: () =>
          txHandler({
            callOnSuccess: () => {
              uiChanges.publish(TAB_CHANGE_SUBJECT, {
                type: 'change-tab',
                currentMode: VaultViewMode.Overview,
              })
              setHash(VaultViewMode.Overview)
            },
          }),
      },
      ...(stage !== 'txInProgress' && {
        textButton: {
          label: textButtonLabel,
          hidden: isFirstSetup,
          action: () => textButtonHandler(),
        },
      }),
      status: sidebarStatus,
    }

    return <SidebarSection {...sidebarSectionProps} />
  }

  return null
}
