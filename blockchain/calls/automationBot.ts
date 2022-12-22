import { TriggerType } from '@oasisdex/automation'
import BigNumber from 'bignumber.js'
import * as accountImplementation from 'blockchain/abi/account-implementation.json'
import dsProxy from 'blockchain/abi/ds-proxy.json'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { contractDesc } from 'blockchain/config'
import { ContextConnected } from 'blockchain/network'
import {
  AccountImplementation,
  AutomationBot,
  AutomationBotV2,
  DsProxy,
} from 'types/ethers-contracts'

import { TxMetaKind } from './txMeta'

export type AutomationBaseTriggerData = {
  cdpId: BigNumber
  triggerType: TriggerType
  triggerData: string
  proxyAddress: string
}

export type AutomationBotAddTriggerData = AutomationBaseTriggerData & {
  kind: TxMetaKind.addTrigger
  replacedTriggerId: number
}

export type AutomationBotRemoveTriggerData = {
  kind: TxMetaKind.removeTrigger
  proxyAddress: string
  cdpId: BigNumber
  triggerId: number
  removeAllowance: boolean
}

function getAddAutomationTriggerCallData(
  data: AutomationBotAddTriggerData,
  context: ContextConnected,
) {
  const { contract, automationBot } = context
  return contract<AutomationBot>(automationBot).methods.addTrigger(
    data.cdpId,
    data.triggerType,
    data.replacedTriggerId,
    data.triggerData,
  )
}

function getAddAutomationV2TriggerCallData(
  data: AutomationBotAddTriggerData,
  context: ContextConnected,
) {
  const { contract, automationBotV2 } = context
  console.log('data', data)
  return contract<AutomationBotV2>(automationBotV2).methods.addTriggers(
    65535,
    [false],
    [data.replacedTriggerId],
    [data.triggerData],
    [10],
  )
}

export const addAutomationBotTrigger: TransactionDef<AutomationBotAddTriggerData> = {
  call: ({ proxyAddress }, { contract }) => {
    return contract<DsProxy>(contractDesc(dsProxy, proxyAddress)).methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => [
    context.automationBot.address,
    getAddAutomationTriggerCallData(data, context).encodeABI(),
  ],
}

export const addAutomationBotTriggerV2: TransactionDef<AutomationBotAddTriggerData> = {
  call: ({ proxyAddress }, { contract }) => {
    console.log('proxyAddress', proxyAddress)
    return contract<AccountImplementation>(contractDesc(accountImplementation, proxyAddress))
      .methods['execute(address,bytes)']
  },
  prepareArgs: (data, context) => [
    context.automationBotV2.address,
    getAddAutomationV2TriggerCallData(data, context).encodeABI(),
  ],
}
