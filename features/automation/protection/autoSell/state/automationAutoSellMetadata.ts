import { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange'
import {
  AutomationCommonMetadata,
  defaultMetadata,
} from 'features/automation/common/state/automationMetadata'

export interface AutomationAutoSellMetadata extends AutomationCommonMetadata<AutoBSFormChange> {}

export const defaultAutoSellMetadata: AutomationAutoSellMetadata = {
  ...defaultMetadata,
}

export const autoSellMakerMetadata: AutomationAutoSellMetadata = {
  debtToken: 'DAI',
  positionLabel: 'Vault',
  ratioLabel: 'Collateral ratio',
  validation: {
    creationErrors: [],
    creationWarnings: [],
    cancelErrors: [],
    cancelWarnings: [],
  },
}
