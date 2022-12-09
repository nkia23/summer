import { createSend, SendFunction } from '@oasisdex/transactions'
import { createWeb3Context$ } from '@oasisdex/web3-context'
import { trackingEvents } from 'analytics/analytics'
import { mixpanelIdentify } from 'analytics/mixpanel'
import { BigNumber } from 'bignumber.js'
import { getAavePositionLiquidation$ } from 'blockchain/aaveLiquidations'
import { getAaveUserAccountData } from 'blockchain/calls/aave/aaveLendingPool'
import { getAaveAssetsPrices } from 'blockchain/calls/aave/aavePriceOracle'
import { getAaveReserveData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import {
  AutomationBotAddTriggerData,
  AutomationBotRemoveTriggerData,
} from 'blockchain/calls/automationBot'
import {
  AutomationBotAddAggregatorTriggerData,
  AutomationBotRemoveTriggersData,
} from 'blockchain/calls/automationBotAggregator'
import {
  createSendTransaction,
  createSendWithGasConstraints,
  estimateGas,
  EstimateGasFunction,
  SendTransactionFunction,
  TransactionDef,
  call
} from 'blockchain/calls/callsHelpers'
import { cdpManagerIlks, cdpManagerOwner, cdpManagerUrns } from 'blockchain/calls/cdpManager'
import { cdpRegistryCdps, cdpRegistryOwns } from 'blockchain/calls/cdpRegistry'
import { charterNib, charterPeace, charterUline, charterUrnProxy } from 'blockchain/calls/charter'
import {
  cropperBonusTokenAddress,
  cropperCrops,
  cropperShare,
  cropperStake,
  cropperStock,
  cropperUrnProxy,
} from 'blockchain/calls/cropper'
import { dogIlk } from 'blockchain/calls/dog'
import {
  ApproveData,
  DisapproveData,
  tokenAllowance,
  tokenBalance,
  tokenBalanceRawForJoin,
  tokenDecimals,
  tokenName,
  tokenSymbol,
} from 'blockchain/calls/erc20'
import { getCdps } from 'blockchain/calls/getCdps'
import { createIlkToToken$ } from 'blockchain/calls/ilkToToken'
import { jugIlk } from 'blockchain/calls/jug'
import { crvLdoRewardsEarned } from 'blockchain/calls/lidoCrvRewards'
import { ClaimMultipleData } from 'blockchain/calls/merkleRedeemer'
import { observe } from 'blockchain/calls/observe'
import { OperationExecutorTxMeta } from 'blockchain/calls/operationExecutor'
import { pipHop, pipPeek, pipPeep, pipZzz } from 'blockchain/calls/osm'
import {
  CreateDsProxyData,
  createProxyAddress$,
  createProxyOwner$,
  SetProxyOwnerData,
} from 'blockchain/calls/proxy'
import { CropjoinProxyActionsContractAdapter } from 'blockchain/calls/proxyActions/adapters/CropjoinProxyActionsSmartContractAdapter'
import {
  ClaimRewardData,
  DepositAndGenerateData,
  OpenData,
  WithdrawAndPaybackData,
} from 'blockchain/calls/proxyActions/adapters/ProxyActionsSmartContractAdapterInterface'
import {
  CloseGuniMultiplyData,
  CloseVaultData,
  MultiplyAdjustData,
  OpenGuniMultiplyData,
  OpenMultiplyData,
  ReclaimData,
} from 'blockchain/calls/proxyActions/proxyActions'
import { proxyActionsAdapterResolver$ } from 'blockchain/calls/proxyActions/proxyActionsAdapterResolver'
import { vaultActionsLogic } from 'blockchain/calls/proxyActions/vaultActionsLogic'
import { spotIlk } from 'blockchain/calls/spot'
import { vatGem, vatIlk, vatUrns } from 'blockchain/calls/vat'
import { createVaultResolver$ } from 'blockchain/calls/vaultResolver'
import { getCollateralLocked$, getTotalValueLocked$ } from 'blockchain/collateral'
import { charterIlks, cropJoinIlks, networksById } from 'blockchain/config'
import { resolveENSName$ } from 'blockchain/ens'
import { createGetRegistryCdps$ } from 'blockchain/getRegistryCdps'
import { createIlkData$, createIlkDataList$, createIlksSupportedOnNetwork$ } from 'blockchain/ilks'
import { createInstiVault$, InstiVault } from 'blockchain/instiVault'
import {
  ContextConnected,
  createAccount$,
  createContext$,
  createContextConnected$,
  createInitializedAccount$,
  createOnEveryBlock$,
  createWeb3ContextConnected$,
  every10Seconds$,
} from 'blockchain/network'
import {
  createGasPrice$,
  createOraclePriceData$,
  createTokenPriceInUSD$,
  GasPriceParams,
  tokenPrices$,
} from 'blockchain/prices'
import {
  createAccountBalance$,
  createAllowance$,
  createBalance$,
  createCollateralTokens$,
} from 'blockchain/tokens'
import { getUserDpmProxies$ } from 'blockchain/userDpmProxies'
import {
  createStandardCdps$,
  createVault$,
  createVaults$,
  decorateVaultsWithValue$,
  Vault,
} from 'blockchain/vaults'
import { pluginDevModeHelpers } from 'components/devModeHelpers'
import { prepareAaveAvailableLiquidityInUSDC$ } from 'features/aave/helpers/aavePrepareAvailableLiquidity'
import { hasAavePosition$ } from 'features/aave/helpers/hasAavePosition'
import { hasActiveAavePosition } from 'features/aave/helpers/hasActiveAavePosition'
import { createAccountData } from 'features/account/AccountData'
import { createTransactionManager } from 'features/account/transactionManager'
import { createAutomationTriggersData } from 'features/automation/api/automationTriggersData'
import {
  AUTO_BUY_FORM_CHANGE,
  AUTO_SELL_FORM_CHANGE,
  AutoBSChangeAction,
  AutoBSFormChange,
  autoBSFormChangeReducer,
} from 'features/automation/common/state/autoBSFormChange'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
  AutomationChangeFeatureAction,
  automationChangeFeatureReducer,
} from 'features/automation/common/state/automationFeatureChange'
import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
  AutoTakeProfitFormChangeAction,
  autoTakeProfitFormChangeReducer,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleChangeAction,
  ConstantMultipleFormChange,
  constantMultipleFormChangeReducer,
} from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange'
import {
  MULTIPLY_VAULT_PILL_CHANGE_SUBJECT,
  MultiplyPillChange,
  MultiplyPillChangeAction,
  multiplyPillChangeReducer,
} from 'features/automation/protection/stopLoss/state/multiplyVaultPillChange'
import {
  formChangeReducer,
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
  StopLossFormChangeAction,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'

import { createBonusPipe$ } from 'features/bonus/bonusPipe'
import { createMakerProtocolBonusAdapter } from 'features/bonus/makerProtocolBonusAdapter'
import {
  InstitutionalBorrowManageAdapter,
  ManageInstiVaultState,
} from 'features/borrow/manage/pipes/adapters/institutionalBorrowManageAdapter'
import { StandardBorrowManageAdapter } from 'features/borrow/manage/pipes/adapters/standardBorrowManageAdapter'
import {
  createManageVault$,
  ManageStandardBorrowVaultState,
} from 'features/borrow/manage/pipes/manageVault'
import { createOpenVault$ } from 'features/borrow/open/pipes/openVault'
import { createCollateralPrices$ } from 'features/collateralPrices/collateralPrices'
import { currentContent } from 'features/content'
import {
  getTotalSupply,
  getUnderlyingBalances,
} from 'features/earn/guni/manage/pipes/guniActionsCalls'
import { createManageGuniVault$ } from 'features/earn/guni/manage/pipes/manageGuniVault'
import { getGuniMintAmount, getToken1Balance } from 'features/earn/guni/open/pipes/guniActionsCalls'
import { createOpenGuniVault$ } from 'features/earn/guni/open/pipes/openGuniVault'
import {
  createMakerOracleTokenPrices$,
  createMakerOracleTokenPricesForDates$,
} from 'features/earn/makerOracleTokenPrices'
import { createExchangeQuote$, ExchangeAction, ExchangeType } from 'features/exchange/exchange'
import { createGeneralManageVault$ } from 'features/generalManageVault/generalManageVault'
import {
  TAB_CHANGE_SUBJECT,
  TabChange,
  TabChangeAction,
  tabChangeReducer,
} from 'features/generalManageVault/TabChange'
import { VaultType } from 'features/generalManageVault/vaultType'
import { getOasisStats$ } from 'features/homepage/stats'
import { createIlkDataListWithBalances$ } from 'features/ilks/ilksWithBalances'
import { createManageMultiplyVault$ } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { createOpenMultiplyVault$ } from 'features/multiply/open/pipes/openMultiplyVault'
import { createVaultsNotices$ } from 'features/notices/vaultsNotices'
import {
  NOTIFICATION_CHANGE,
  NotificationChange,
  NotificationChangeAction,
  notificationReducer,
} from 'features/notifications/notificationChange'
import { createReclaimCollateral$ } from 'features/reclaimCollateral/reclaimCollateral'
import { checkReferralLocalStorage$ } from 'features/referralOverview/referralLocal'
import { createUserReferral$ } from 'features/referralOverview/user'
import {
  getReferralsFromApi$,
  getUserFromApi$,
  getWeeklyClaimsFromApi$,
} from 'features/referralOverview/userApi'
import { redirectState$ } from 'features/router/redirectState'
import { BalanceInfo, createBalanceInfo$ } from 'features/shared/balanceInfo'
import { createCheckOasisCDPType$ } from 'features/shared/checkOasisCDPType'
import { createPriceInfo$ } from 'features/shared/priceInfo'
import { checkVaultTypeUsingApi$, saveVaultUsingApi$ } from 'features/shared/vaultApi'
import { jwtAuthSetupToken$ } from 'features/termsOfService/jwt'
import { createTermsAcceptance$ } from 'features/termsOfService/termsAcceptance'
import {
  checkAcceptanceFromApi$,
  saveAcceptanceFromApi$,
} from 'features/termsOfService/termsAcceptanceApi'
import {
  SWAP_WIDGET_CHANGE_SUBJECT,
  SwapWidgetChangeAction,
  swapWidgetChangeReducer,
  SwapWidgetState,
} from 'features/uniswapWidget/SwapWidgetChange'
import { createUserSettings$ } from 'features/userSettings/userSettings'
import {
  checkUserSettingsLocalStorage$,
  saveUserSettingsLocalStorage$,
} from 'features/userSettings/userSettingsLocal'
import { createVaultHistory$ } from 'features/vaultHistory/vaultHistory'
import { vaultsWithHistory$ } from 'features/vaultHistory/vaultsHistory'
import { createAssetActions$ } from 'features/vaultsOverview/pipes/assetActions'
import {
  createAavePosition$,
  createMakerPositions$,
  createPositions$,
} from 'features/vaultsOverview/pipes/positions'
import { createMakerPositionsList$ } from 'features/vaultsOverview/pipes/positionsList'
import { createPositionsOverviewSummary$ } from 'features/vaultsOverview/pipes/positionsOverviewSummary'
import { createVaultsOverview$ } from 'features/vaultsOverview/vaultsOverview'
import { createWalletAssociatedRisk$ } from 'features/walletAssociatedRisk/walletRisk'
import { getYieldChange$, getYields$ } from 'helpers/earn/calculations'
import { doGasEstimation, HasGasEstimation } from 'helpers/form'
import {
  gasEstimationReducer,
  TX_DATA_CHANGE,
  TxPayloadChange,
  TxPayloadChangeAction,
} from 'helpers/gasEstimate'
import {
  createProductCardsData$,
  createProductCardsWithBalance$,
  supportedBorrowIlks,
  supportedEarnIlks,
  supportedMultiplyIlks,
} from 'helpers/productCards'
import { isEqual, mapValues, memoize } from 'lodash'
import moment from 'moment'
import { combineLatest, defer, Observable, of, Subject } from 'rxjs'
import { distinctUntilChanged, filter, map, mergeMap, shareReplay, switchMap } from 'rxjs/operators'

import curry from 'ramda/src/curry'
import { loadablifyLight } from 'helpers/loadable'
import { createDsrWithdraw$ } from 'features/dsr/pipes/dsrWithdraw'
import { createDsrDeposit$ } from 'features/dsr/helpers/dsrDeposit';
import { createDsr$ } from 'features/dsr/utils/createDsr'
import { chi, dsr, pie } from 'features/dsr/helpers/potCalls'
import { createTokenBalance$, createAllowanceDsr$ } from 'blockchain/erc20';
import { compareBigNumber } from 'blockchain/network';
import { createProxyAddress$ as createDsrProxyAddress$ } from 'features/dsr/utils/proxy';
import { createDaiDeposit$ } from 'features/dsr/helpers/daiDeposit'
import { equals } from 'ramda'
import { zero } from 'helpers/zero'

export type TxData =
  | OpenData
  | DepositAndGenerateData
  | WithdrawAndPaybackData
  | ApproveData
  | DisapproveData
  | CreateDsProxyData
  | SetProxyOwnerData
  | ReclaimData
  | OpenMultiplyData
  | MultiplyAdjustData
  | CloseVaultData
  | OpenGuniMultiplyData
  | AutomationBotAddTriggerData
  | AutomationBotRemoveTriggerData
  | CloseGuniMultiplyData
  | ClaimRewardData
  | ClaimMultipleData
  | AutomationBotAddAggregatorTriggerData
  | AutomationBotRemoveTriggersData
  | OperationExecutorTxMeta

export interface TxHelpers {
  send: SendTransactionFunction<TxData>
  sendWithGasEstimation: SendTransactionFunction<TxData>
  estimateGas: EstimateGasFunction<TxData>
}

export const protoTxHelpers: TxHelpers = {
  send: () => null as any,
  sendWithGasEstimation: () => null as any,
  estimateGas: () => null as any,
}

export type AddGasEstimationFunction = <S extends HasGasEstimation>(
  state: S,
  call: (send: TxHelpers, state: S) => Observable<number> | undefined,
) => Observable<S>

export type TxHelpers$ = Observable<TxHelpers>

function createTxHelpers$(
  context$: Observable<ContextConnected>,
  send: SendFunction<TxData>,
  gasPrice$: Observable<GasPriceParams>,
): TxHelpers$ {
  return context$.pipe(
    filter(({ status }) => status === 'connected'),
    map((context) => ({
      send: createSendTransaction(send, context),
      sendWithGasEstimation: createSendWithGasConstraints(send, context, gasPrice$),
      estimateGas: <B extends TxData>(def: TransactionDef<B>, args: B): Observable<number> => {
        return estimateGas(context, def, args)
      },
    })),
  )
}

export type SupportedUIChangeType =
  | StopLossFormChange
  | AutoBSFormChange
  | ConstantMultipleFormChange
  | TabChange
  | MultiplyPillChange
  | SwapWidgetState
  | AutomationChangeFeature
  | NotificationChange
  | TxPayloadChange
  | AutoTakeProfitFormChange

export type LegalUiChanges = {
  StopLossFormChange: StopLossFormChangeAction
  AutoBSChange: AutoBSChangeAction
  TabChange: TabChangeAction
  MultiplyPillChange: MultiplyPillChangeAction
  SwapWidgetChange: SwapWidgetChangeAction
  AutomationChangeFeature: AutomationChangeFeatureAction
  ConstantMultipleChangeAction: ConstantMultipleChangeAction
  NotificationChange: NotificationChangeAction
  TxPayloadChange: TxPayloadChangeAction
  AutoTakeProfitFormChange: AutoTakeProfitFormChangeAction
}

export type UIChanges = {
  subscribe: <T extends SupportedUIChangeType>(sub: string) => Observable<T>
  publish: <K extends LegalUiChanges[keyof LegalUiChanges]>(sub: string, event: K) => void
  lastPayload: <T extends SupportedUIChangeType>(sub: string) => T
  clear: (sub: string) => void
  configureSubject: <
    T extends SupportedUIChangeType,
    K extends LegalUiChanges[keyof LegalUiChanges]
    >(
    subject: string,
    reducer: (prev: T, event: K) => T,
    initialState?: T,
  ) => void
}

export type UIReducer = (prev: any, event: any) => any

export type ReducersMap = {
  [key: string]: UIReducer
}

function createUIChangesSubject(): UIChanges {
  const latest: any = {}

  const reducers: ReducersMap = {} //TODO: Is there a way to strongly type this ?

  interface PublisherRecord {
    subjectName: string
    payload: SupportedUIChangeType
  }

  const commonSubject = new Subject<PublisherRecord>()

  function subscribe<T extends SupportedUIChangeType>(subjectName: string): Observable<T> {
    return commonSubject.pipe(
      filter((x) => x.subjectName === subjectName),
      map((x) => x.payload as T),
      shareReplay(1),
    )
  }

  function publish<K extends LegalUiChanges[keyof LegalUiChanges]>(subjectName: string, event: K) {
    const accumulatedEvent = reducers.hasOwnProperty(subjectName)
      ? reducers[subjectName](lastPayload(subjectName) || {}, event)
      : lastPayload(subjectName)
    latest[subjectName] = accumulatedEvent
    commonSubject.next({
      subjectName,
      payload: accumulatedEvent,
    })
  }

  function lastPayload<T>(subject: string): T {
    return latest[subject]
  }

  function clear(subject: string): any {
    delete latest[subject]
  }

  function configureSubject<
    T extends SupportedUIChangeType,
    K extends LegalUiChanges[keyof LegalUiChanges]
  >(subject: string, reducer: (prev: T, event: K) => T, initialState?: T): void {
    reducers[subject] = reducer
    if (initialState) {
      latest[subject] = initialState
    }
  }

  return {
    subscribe,
    publish,
    lastPayload,
    clear,
    configureSubject,
  }
}

function initializeUIChanges() {
  const uiChangesSubject = createUIChangesSubject()

  uiChangesSubject.configureSubject(STOP_LOSS_FORM_CHANGE, formChangeReducer)
  uiChangesSubject.configureSubject(AUTO_SELL_FORM_CHANGE, autoBSFormChangeReducer)
  uiChangesSubject.configureSubject(AUTO_BUY_FORM_CHANGE, autoBSFormChangeReducer)
  uiChangesSubject.configureSubject(TAB_CHANGE_SUBJECT, tabChangeReducer)
  uiChangesSubject.configureSubject(MULTIPLY_VAULT_PILL_CHANGE_SUBJECT, multiplyPillChangeReducer)
  uiChangesSubject.configureSubject(SWAP_WIDGET_CHANGE_SUBJECT, swapWidgetChangeReducer)
  uiChangesSubject.configureSubject(AUTOMATION_CHANGE_FEATURE, automationChangeFeatureReducer)
  uiChangesSubject.configureSubject(
    CONSTANT_MULTIPLE_FORM_CHANGE,
    constantMultipleFormChangeReducer,
  )
  uiChangesSubject.configureSubject(NOTIFICATION_CHANGE, notificationReducer)
  uiChangesSubject.configureSubject(TX_DATA_CHANGE, gasEstimationReducer)
  uiChangesSubject.configureSubject(AUTO_TAKE_PROFIT_FORM_CHANGE, autoTakeProfitFormChangeReducer)

  return uiChangesSubject
}

export function setupAppContext() {
  const chainIdToRpcUrl = mapValues(networksById, (network) => network.infuraUrl)
  const chainIdToDAIContractDesc = mapValues(networksById, (network) => network.tokens.DAI)
  const [web3Context$, setupWeb3Context$] = createWeb3Context$(
    chainIdToRpcUrl,
    chainIdToDAIContractDesc,
  )

  const account$ = createAccount$(web3Context$)
  const initializedAccount$ = createInitializedAccount$(account$)

  const web3ContextConnected$ = createWeb3ContextConnected$(web3Context$)

  const [onEveryBlock$, everyBlock$] = createOnEveryBlock$(web3ContextConnected$)

  const context$ = createContext$(web3ContextConnected$)

  const chainContext$ = context$.pipe(
    distinctUntilChanged(
      (previousContext, newContext) => previousContext.chainId === newContext.chainId,
    ),
    shareReplay(1),
  )

  const connectedContext$ = createContextConnected$(context$)

  combineLatest(account$, connectedContext$)
    .pipe(
      mergeMap(([account, network]) => {
        return of({
          networkName: network.name,
          connectionKind: network.connectionKind,
          account: account?.toLowerCase(),
        })
      }),
      distinctUntilChanged(isEqual),
    )
    .subscribe(({ account, networkName, connectionKind }) => {
      if (account) {
        mixpanelIdentify(account, { walletType: connectionKind })
        trackingEvents.accountChange(account, networkName, connectionKind)
      }
    })

  const oracleContext$ = context$.pipe(
    switchMap((ctx) => of({ ...ctx, account: ctx.mcdSpot.address })),
    shareReplay(1),
  ) as Observable<ContextConnected>

  const [send, transactions$] = createSend<TxData>(
    initializedAccount$,
    onEveryBlock$,
    connectedContext$,
  )

  const gasPrice$ = createGasPrice$(onEveryBlock$, context$)

  const txHelpers$: TxHelpers$ = createTxHelpers$(connectedContext$, send, gasPrice$)
  const transactionManager$ = createTransactionManager(transactions$)

  const tokenPriceUSD$ = memoize(
    curry(createTokenPriceInUSD$)(every10Seconds$, tokenPrices$),
    (tokens: string[]) => tokens.sort().join(','),
  )

  const daiEthTokenPrice$ = tokenPriceUSD$(['DAI', 'ETH'])

  function addGasEstimation$<S extends HasGasEstimation>(
    state: S,
    call: (send: TxHelpers, state: S) => Observable<number> | undefined,
  ): Observable<S> {
    return doGasEstimation(gasPrice$, daiEthTokenPrice$, txHelpers$, state, call)
  }

  const once$ = of(undefined).pipe(shareReplay(1))

  // base
  const proxyAddress$ = memoize(curry(createProxyAddress$)(onEveryBlock$, context$))
  const proxyOwner$ = memoize(curry(createProxyOwner$)(onEveryBlock$, context$))
  const cdpManagerUrns$ = observe(onEveryBlock$, context$, cdpManagerUrns, bigNumberTostring)
  const cdpManagerIlks$ = observe(onEveryBlock$, context$, cdpManagerIlks, bigNumberTostring)
  const cdpManagerOwner$ = observe(onEveryBlock$, chainContext$, cdpManagerOwner, bigNumberTostring)
  const cdpRegistryOwns$ = observe(onEveryBlock$, chainContext$, cdpRegistryOwns)
  const cdpRegistryCdps$ = observe(onEveryBlock$, chainContext$, cdpRegistryCdps)
  const vatIlks$ = observe(onEveryBlock$, chainContext$, vatIlk)
  const vatIlksLean$ = observe(once$, chainContext$, vatIlk)
  const vatUrns$ = observe(onEveryBlock$, chainContext$, vatUrns, ilkUrnAddressToString)
  const vatGem$ = observe(onEveryBlock$, chainContext$, vatGem, ilkUrnAddressToString)
  const spotIlks$ = observe(onEveryBlock$, chainContext$, spotIlk)
  const spotIlksLean$ = observe(once$, chainContext$, spotIlk)
  const jugIlks$ = observe(onEveryBlock$, chainContext$, jugIlk)
  const jugIlksLean$ = observe(once$, chainContext$, jugIlk)
  const dogIlks$ = observe(onEveryBlock$, chainContext$, dogIlk)
  const dogIlksLean$ = observe(once$, chainContext$, dogIlk)

  const charterNib$ = observe(onEveryBlock$, context$, charterNib)
  const charterPeace$ = observe(onEveryBlock$, context$, charterPeace)
  const charterUline$ = observe(onEveryBlock$, context$, charterUline)
  const charterUrnProxy$ = observe(onEveryBlock$, context$, charterUrnProxy)

  const cropperUrnProxy$ = observe(onEveryBlock$, context$, cropperUrnProxy)
  const cropperStake$ = observe(onEveryBlock$, context$, cropperStake)
  const cropperShare$ = observe(onEveryBlock$, context$, cropperShare)
  const cropperStock$ = observe(onEveryBlock$, context$, cropperStock)
  const cropperTotal$ = observe(onEveryBlock$, context$, cropperStock)
  const cropperCrops$ = observe(onEveryBlock$, context$, cropperCrops)
  const cropperBonusTokenAddress$ = observe(onEveryBlock$, context$, cropperBonusTokenAddress)

  const pipZzz$ = observe(onEveryBlock$, chainContext$, pipZzz)
  const pipZzzLean$ = observe(once$, chainContext$, pipZzz)
  const pipHop$ = observe(onEveryBlock$, context$, pipHop)
  const pipHopLean$ = observe(once$, context$, pipHop)
  const pipPeek$ = observe(onEveryBlock$, oracleContext$, pipPeek)
  const pipPeekLean$ = observe(once$, oracleContext$, pipPeek)
  const pipPeep$ = observe(onEveryBlock$, oracleContext$, pipPeep)
  const pipPeepLean$ = observe(once$, oracleContext$, pipPeep)

  const unclaimedCrvLdoRewardsForIlk$ = observe(onEveryBlock$, context$, crvLdoRewardsEarned)

  const getCdps$ = observe(onEveryBlock$, context$, getCdps)

  const charter = {
    nib$: (args: { ilk: string; usr: string }) => charterNib$(args),
    peace$: (args: { ilk: string; usr: string }) => charterPeace$(args),
    uline$: (args: { ilk: string; usr: string }) => charterUline$(args),
  }

  const oraclePriceData$ = memoize(
    curry(createOraclePriceData$)(chainContext$, pipPeek$, pipPeep$, pipZzz$, pipHop$),
    ({ token, requestedData }) => {
      return `${token}-${requestedData.join(',')}`
    },
  )

  const oraclePriceDataLean$ = memoize(
    curry(createOraclePriceData$)(
      chainContext$,
      pipPeekLean$,
      pipPeepLean$,
      pipZzzLean$,
      pipHopLean$,
    ),
    ({ token, requestedData }) => {
      return `${token}-${requestedData.join(',')}`
    },
  )

  const tokenBalance$ = observe(onEveryBlock$, context$, tokenBalance)
  const tokenBalanceLean$ = observe(once$, context$, tokenBalance)

  const balance$ = memoize(
    curry(createBalance$)(onEveryBlock$, chainContext$, tokenBalance$),
    (token, address) => `${token}_${address}`,
  )

  const balanceLean$ = memoize(
    curry(createBalance$)(once$, chainContext$, tokenBalanceLean$),
    (token, address) => `${token}_${address}`,
  )

  const ensName$ = memoize(curry(resolveENSName$)(context$), (address) => address)

  const aaveLiquidations$ = memoize(
    curry(getAavePositionLiquidation$)(context$),
    (proxyAddress) => proxyAddress,
  )

  const userDpmProxies$ = memoize(
    curry(getUserDpmProxies$)(context$, onEveryBlock$),
    (walletAddress) => walletAddress,
  )

  const tokenAllowance$ = observe(onEveryBlock$, context$, tokenAllowance)
  const tokenBalanceRawForJoin$ = observe(onEveryBlock$, chainContext$, tokenBalanceRawForJoin)
  const tokenDecimals$ = observe(onEveryBlock$, chainContext$, tokenDecimals)
  const tokenSymbol$ = observe(onEveryBlock$, chainContext$, tokenSymbol)
  const tokenName$ = observe(onEveryBlock$, chainContext$, tokenName)

  const allowance$ = curry(createAllowance$)(context$, tokenAllowance$)

  const ilkToToken$ = memoize(curry(createIlkToToken$)(chainContext$))

  const ilkData$ = memoize(
    curry(createIlkData$)(vatIlks$, spotIlks$, jugIlks$, dogIlks$, ilkToToken$),
  )

  const ilkDataLean$ = memoize(
    curry(createIlkData$)(vatIlksLean$, spotIlksLean$, jugIlksLean$, dogIlksLean$, ilkToToken$),
  )

  const charterCdps$ = memoize(
    curry(createGetRegistryCdps$)(
      onEveryBlock$,
      chainContext$,
      cdpRegistryCdps$,
      proxyAddress$,
      charterIlks,
    ),
  )
  const cropJoinCdps$ = memoize(
    curry(createGetRegistryCdps$)(
      onEveryBlock$,
      chainContext$,
      cdpRegistryCdps$,
      proxyAddress$,
      cropJoinIlks,
    ),
  )
  const standardCdps$ = memoize(curry(createStandardCdps$)(proxyAddress$, getCdps$))

  const urnResolver$ = curry(createVaultResolver$)(
    cdpManagerIlks$,
    cdpManagerUrns$,
    charterUrnProxy$,
    cropperUrnProxy$,
    cdpRegistryOwns$,
    cdpManagerOwner$,
    proxyOwner$,
  )

  const bonusAdapter = memoize(
    (cdpId: BigNumber) =>
      createMakerProtocolBonusAdapter(
        urnResolver$,
        unclaimedCrvLdoRewardsForIlk$,
        {
          stake$: cropperStake$,
          share$: cropperShare$,
          bonusTokenAddress$: cropperBonusTokenAddress$,
          stock$: cropperStock$,
          total$: cropperTotal$,
          crops$: cropperCrops$,
        },
        {
          tokenDecimals$,
          tokenSymbol$,
          tokenName$,
          tokenBalanceRawForJoin$,
        },
        connectedContext$,
        txHelpers$,
        vaultActionsLogic(new CropjoinProxyActionsContractAdapter()),
        proxyAddress$,
        cdpId,
      ),
    bigNumberTostring,
  )

  const bonus$ = memoize(
    (cdpId: BigNumber) => createBonusPipe$(bonusAdapter, cdpId),
    bigNumberTostring,
  )

  const potDsr$ = connectedContext$.pipe(
    switchMap((context) => {
      return everyBlock$(defer(() => call(context, dsr)()))
    }),
  )
  const potChi$ = connectedContext$.pipe(
    switchMap((context) => {
      return everyBlock$(defer(() => call(context, chi)()))
    }),
  )

  // TODO: Possibly duplicat logic, needs to be replaced 
  function addGasEstimation<S extends HasGasEstimation>(
    state: S,
    call: (send: TxHelpers, state: S) => Observable<number> | undefined,
  ): Observable<S> {
    return doGasEstimation(gasPrice$, tokenPrices$, txHelpers$, state, call)
  }

  // TODO: Lines 737 to 773, think we are needing to modify this to use different context, lots of repeated code
  const dsr$ = createDsr$(
    connectedContext$,
    everyBlock$,
    onEveryBlock$,
    potDsr$,
    potChi$,
  )

  const proxyAddressDsrObservable$ = connectedContext$.pipe(
    switchMap((context) => everyBlock$(createDsrProxyAddress$(context, context.account))),
    shareReplay(1),
  )


  const daiBalance$ = connectedContext$.pipe(
    switchMap((context) => {
      return everyBlock$(createTokenBalance$(context, 'DAI', context.account), compareBigNumber)
    }),
  )

  const daiAllowance$ = combineLatest(connectedContext$, proxyAddressDsrObservable$).pipe(
    switchMap(([context, proxyAddress]) =>
      proxyAddress
        ? everyBlock$(createAllowanceDsr$(context, 'DAI', context.account, proxyAddress))
        : of(false),
    ),
  )

  const potPie$ = combineLatest(connectedContext$, proxyAddressDsrObservable$).pipe(
    switchMap(([context, proxyAddress]) => {
      if (!proxyAddress) return of(zero)
      return everyBlock$(
        defer(() => call(context, pie)(proxyAddress!)),
        equals,
      )
    }),
  )

  const daiDeposit$ = createDaiDeposit$(potPie$, potChi$)

  const dsrDeposit$ = createDsrDeposit$(
    connectedContext$,
    txHelpers$,
    proxyAddressDsrObservable$,
    daiAllowance$,
    daiBalance$,
    addGasEstimation,
  )

  const dsrWithdraw$ = createDsrWithdraw$(
    txHelpers$,
    proxyAddressDsrObservable$,
    daiDeposit$,
    potDsr$,
    addGasEstimation,
  )

  const vault$ = memoize(
    (id: BigNumber) =>
      createVault$(
        urnResolver$,
        vatUrns$,
        vatGem$,
        ilkData$,
        oraclePriceData$,
        ilkToToken$,
        chainContext$,
        id,
      ),
    bigNumberTostring,
  )

  const instiVault$ = memoize(
    curry(createInstiVault$)(
      urnResolver$,
      vatUrns$,
      vatGem$,
      ilkData$,
      oraclePriceData$,
      ilkToToken$,
      context$,
      charter,
    ),
  )

  const vaultHistory$ = memoize(curry(createVaultHistory$)(chainContext$, onEveryBlock$, vault$))

  pluginDevModeHelpers(txHelpers$, connectedContext$, proxyAddress$)

  const vaults$ = memoize(
    curry(createVaults$)(onEveryBlock$, vault$, chainContext$, [
      charterCdps$,
      cropJoinCdps$,
      standardCdps$,
    ]),
  )

  const ilksSupportedOnNetwork$ = createIlksSupportedOnNetwork$(chainContext$)

  const collateralTokens$ = createCollateralTokens$(ilksSupportedOnNetwork$, ilkToToken$)

  const accountBalances$ = curry(createAccountBalance$)(
    balanceLean$,
    collateralTokens$,
    oraclePriceDataLean$,
  )

  const ilkDataList$ = createIlkDataList$(ilkDataLean$, ilksSupportedOnNetwork$)
  const ilksWithBalance$ = createIlkDataListWithBalances$(context$, ilkDataList$, accountBalances$)

  const priceInfo$ = curry(createPriceInfo$)(oraclePriceData$)

  // TODO Don't allow undefined args like this
  const balanceInfo$ = curry(createBalanceInfo$)(balance$) as (
    token: string,
    account: string | undefined,
  ) => Observable<BalanceInfo>

  const userSettings$ = createUserSettings$(
    checkUserSettingsLocalStorage$,
    saveUserSettingsLocalStorage$,
  )

  const openVault$ = memoize((ilk: string) =>
    createOpenVault$(
      connectedContext$,
      txHelpers$,
      proxyAddress$,
      allowance$,
      priceInfo$,
      balanceInfo$,
      ilksSupportedOnNetwork$,
      ilkData$,
      ilkToToken$,
      addGasEstimation$,
      proxyActionsAdapterResolver$,
      ilk,
    ),
  )

  const exchangeQuote$ = memoize(
    (
      token: string,
      slippage: BigNumber,
      amount: BigNumber,
      action: ExchangeAction,
      exchangeType: ExchangeType,
    ) => createExchangeQuote$(context$, undefined, token, slippage, amount, action, exchangeType),
    (token: string, slippage: BigNumber, amount: BigNumber, action: string, exchangeType: string) =>
      `${token}_${slippage.toString()}_${amount.toString()}_${action}_${exchangeType}`,
  )

  const psmExchangeQuote$ = memoize(
    (
      token: string,
      slippage: BigNumber,
      amount: BigNumber,
      action: ExchangeAction,
      exchangeType: ExchangeType,
    ) => createExchangeQuote$(context$, 'PSM', token, slippage, amount, action, exchangeType),
    (token: string, slippage: BigNumber, amount: BigNumber, action: string, exchangeType: string) =>
      `${token}_${slippage.toString()}_${amount.toString()}_${action}_${exchangeType}`,
  )
  const vaultWithValue$ = memoize(
    curry(decorateVaultsWithValue$)(vaults$, exchangeQuote$, userSettings$),
  )

  const ethPrice$ = curry(tokenPriceUSD$)(['ETH']).pipe(map((price) => price['ETH']))

  const aaveUserAccountData$ = observe(onEveryBlock$, context$, getAaveUserAccountData)

  const hasAave$ = memoize(curry(hasAavePosition$)(proxyAddress$, aaveUserAccountData$))

  const getAaveReserveData$ = observe(once$, context$, getAaveReserveData)
  const getAaveAssetsPrices$ = observe(once$, context$, getAaveAssetsPrices)

  const aaveAvailableLiquidityInUSDC$ = curry(prepareAaveAvailableLiquidityInUSDC$)(
    getAaveReserveData$,
    // @ts-expect-error
    getAaveAssetsPrices$({ tokens: ['USDC'] }), //this needs to be fixed in OasisDEX/transactions -> CallDef
  )

  const aavePositions$ = memoize(
    curry(createAavePosition$)(
      aaveUserAccountData$,
      aaveAvailableLiquidityInUSDC$({ token: 'ETH' }),
      ethPrice$,
      proxyAddress$,
    ),
  )

  const makerPositions$ = memoize(curry(createMakerPositions$)(vaultWithValue$))
  const positions$ = memoize(curry(createPositions$)(makerPositions$, aavePositions$))

  const openMultiplyVault$ = memoize((ilk: string) =>
    createOpenMultiplyVault$(
      connectedContext$,
      txHelpers$,
      proxyAddress$,
      allowance$,
      priceInfo$,
      balanceInfo$,
      ilksSupportedOnNetwork$,
      ilkData$,
      exchangeQuote$,
      addGasEstimation$,
      userSettings$,
      ilk,
    ),
  )

  const token1Balance$ = observe(onEveryBlock$, context$, getToken1Balance)
  const getGuniMintAmount$ = observe(onEveryBlock$, context$, getGuniMintAmount)

  const manageVault$ = memoize(
    (id: BigNumber) =>
      createManageVault$<Vault, ManageStandardBorrowVaultState>(
        context$,
        txHelpers$,
        proxyAddress$,
        allowance$,
        priceInfo$,
        balanceInfo$,
        ilkData$,
        vault$,
        saveVaultUsingApi$,
        addGasEstimation$,
        vaultHistory$,
        proxyActionsAdapterResolver$,
        StandardBorrowManageAdapter,
        automationTriggersData$,
        id,
      ),
    bigNumberTostring,
  )

  const manageInstiVault$ = memoize(
    (id: BigNumber) =>
      createManageVault$<InstiVault, ManageInstiVaultState>(
        context$,
        txHelpers$,
        proxyAddress$,
        allowance$,
        priceInfo$,
        balanceInfo$,
        ilkData$,
        instiVault$,
        saveVaultUsingApi$,
        addGasEstimation$,
        vaultHistory$,
        proxyActionsAdapterResolver$,
        InstitutionalBorrowManageAdapter,
        automationTriggersData$,
        id,
      ),
    bigNumberTostring,
  )

  const manageMultiplyVault$ = memoize(
    (id: BigNumber) =>
      createManageMultiplyVault$(
        context$,
        txHelpers$,
        proxyAddress$,
        allowance$,
        priceInfo$,
        balanceInfo$,
        ilkData$,
        vault$,
        exchangeQuote$,
        addGasEstimation$,
        userSettings$,
        vaultHistory$,
        saveVaultUsingApi$,
        automationTriggersData$,
        id,
      ),
    bigNumberTostring,
  )

  const getGuniPoolBalances$ = observe(onEveryBlock$, context$, getUnderlyingBalances)

  const getTotalSupply$ = observe(onEveryBlock$, context$, getTotalSupply)

  function getProportions$(gUniBalance: BigNumber, token: string) {
    return combineLatest(getGuniPoolBalances$({ token }), getTotalSupply$({ token })).pipe(
      map(([{ amount0, amount1 }, totalSupply]) => {
        return {
          sharedAmount0: amount0.times(gUniBalance).div(totalSupply),
          sharedAmount1: amount1.times(gUniBalance).div(totalSupply),
        }
      }),
    )
  }

  const manageGuniVault$ = memoize(
    (id: BigNumber) =>
      createManageGuniVault$(
        context$,
        txHelpers$,
        proxyAddress$,
        allowance$,
        priceInfo$,
        balanceInfo$,
        ilkData$,
        vault$,
        psmExchangeQuote$,
        addGasEstimation$,
        getProportions$,
        vaultHistory$,
        makerOracleTokenPrices$,
        id,
      ),
    bigNumberTostring,
  )

  const uiChanges = initializeUIChanges()

  const checkOasisCDPType$: (id: BigNumber) => Observable<VaultType> = curry(
    createCheckOasisCDPType$,
  )(
    curry(checkVaultTypeUsingApi$)(
      context$,
      uiChanges.subscribe<MultiplyPillChange>(MULTIPLY_VAULT_PILL_CHANGE_SUBJECT),
    ),
    cdpManagerIlks$,
    charterIlks,
  )

  const generalManageVault$ = memoize(
    curry(createGeneralManageVault$)(
      manageInstiVault$,
      manageMultiplyVault$,
      manageGuniVault$,
      manageVault$,
      checkOasisCDPType$,
      vault$,
    ),
    bigNumberTostring,
  )

  const collateralPrices$ = createCollateralPrices$(collateralTokens$, oraclePriceData$)

  const productCardsData$ = memoize(
    curry(createProductCardsData$)(ilksSupportedOnNetwork$, ilkDataLean$, oraclePriceDataLean$),
    (ilks: string[]) => {
      return ilks.join(',')
    },
  )

  const productCardsWithBalance$ = createProductCardsWithBalance$(
    ilksWithBalance$,
    oraclePriceDataLean$,
  )

  const automationTriggersData$ = memoize(
    curry(createAutomationTriggersData)(chainContext$, onEveryBlock$, vault$),
  )

  const vaultsHistoryAndValue$ = memoize(
    curry(vaultsWithHistory$)(chainContext$, vaultWithValue$, 1000 * 60),
  )

  const positionsList$ = memoize(
    curry(createMakerPositionsList$)(context$, ilksWithBalance$, vaultsHistoryAndValue$),
  )

  const vaultsOverview$ = memoize(curry(createVaultsOverview$)(positionsList$, aavePositions$))

  const assetActions$ = memoize(
    curry(createAssetActions$)(
      context$,
      ilkToToken$,
      {
        borrow: supportedBorrowIlks,
        multiply: supportedMultiplyIlks,
        earn: supportedEarnIlks,
      },
      uiChanges,
    ),
  )

  const positionsOverviewSummary$ = memoize(
    curry(createPositionsOverviewSummary$)(balanceLean$, tokenPriceUSD$, positions$, assetActions$),
  )

  const termsAcceptance$ = createTermsAcceptance$(
    web3Context$,
    currentContent.tos.version,
    jwtAuthSetupToken$,
    checkAcceptanceFromApi$,
    saveAcceptanceFromApi$,
  )

  const walletAssociatedRisk$ = createWalletAssociatedRisk$(web3Context$, termsAcceptance$)

  const userReferral$ = createUserReferral$(
    web3Context$,
    txHelpers$,
    getUserFromApi$,
    getReferralsFromApi$,
    getWeeklyClaimsFromApi$,
    checkReferralLocalStorage$,
  )

  const checkReferralLocal$ = checkReferralLocalStorage$()

  const vaultBanners$ = memoize(
    curry(createVaultsNotices$)(context$, priceInfo$, vault$, vaultHistory$),
    bigNumberTostring,
  )

  const reclaimCollateral$ = memoize(
    curry(createReclaimCollateral$)(context$, txHelpers$, proxyAddress$),
    bigNumberTostring,
  )
  const accountData$ = createAccountData(web3Context$, balance$, vaults$, hasAave$, ensName$)

  const makerOracleTokenPrices$ = memoize(
    curry(createMakerOracleTokenPrices$)(chainContext$),
    (token: string, timestamp: moment.Moment) => {
      return `${token}-${timestamp.format('YYYY-MM-DD HH:mm')}`
    },
  )

  const makerOracleTokenPricesForDates$ = memoize(
    curry(createMakerOracleTokenPricesForDates$)(chainContext$),
    (token: string, timestamps: moment.Moment[]) => {
      return `${token}-${timestamps.map((t) => t.format('YYYY-MM-DD HH:mm')).join(' ')}`
    },
  )

  const yields$ = memoize(
    (ilk: string, date?: moment.Moment) => {
      return getYields$(makerOracleTokenPricesForDates$, ilkData$, ilk, date)
    },
    (ilk: string, date: moment.Moment = moment()) => `${ilk}-${date.format('YYYY-MM-DD')}`,
  )

  const yieldsChange$ = memoize(
    curry(getYieldChange$)(yields$),
    (currentDate: moment.Moment, previousDate: moment.Moment, ilk: string) =>
      `${ilk}_${currentDate.format('YYYY-MM-DD')}_${previousDate.format('YYYY-MM-DD')}`,
  )

  const collateralLocked$ = memoize(
    curry(getCollateralLocked$)(connectedContext$, ilkToToken$, balance$),
  )

  const totalValueLocked$ = memoize(
    curry(getTotalValueLocked$)(collateralLocked$, oraclePriceData$),
  )

  const openGuniVault$ = memoize((ilk: string) =>
    createOpenGuniVault$(
      connectedContext$,
      txHelpers$,
      proxyAddress$,
      allowance$,
      priceInfo$,
      balanceInfo$,
      ilksSupportedOnNetwork$,
      ilkData$,
      psmExchangeQuote$,
      onEveryBlock$,
      addGasEstimation$,
      ilk,
      token1Balance$,
      getGuniMintAmount$,
      userSettings$,
    ),
  )

  const hasActiveAavePosition$ = hasActiveAavePosition(web3Context$, hasAave$)

  return {
    web3Context$,
    web3ContextConnected$,
    setupWeb3Context$,
    initializedAccount$,
    context$,
    onEveryBlock$,
    txHelpers$,
    transactionManager$,
    proxyAddress$,
    proxyOwner$,
    vaults$,
    vault$,
    ilks$: ilksSupportedOnNetwork$,
    balance$,
    accountBalances$,
    openVault$,
    manageVault$,
    manageInstiVault$,
    manageMultiplyVault$,
    manageGuniVault$,
    vaultsOverview$,
    vaultBanners$,
    redirectState$,
    gasPrice$,
    automationTriggersData$,
    accountData$,
    vaultHistory$,
    collateralPrices$,
    termsAcceptance$,
    walletAssociatedRisk$,
    reclaimCollateral$,
    openMultiplyVault$,
    generalManageVault$,
    userSettings$,
    openGuniVault$,
    ilkDataList$,
    uiChanges,
    connectedContext$,
    productCardsData$,
    getOasisStats$: memoize(getOasisStats$),
    productCardsWithBalance$,
    addGasEstimation$,
    instiVault$,
    ilkToToken$,
    bonus$,
    positionsOverviewSummary$,
    priceInfo$,
    yields$,
    daiEthTokenPrice$,
    totalValueLocked$,
    yieldsChange$,
    tokenPriceUSD$,
    userReferral$,
    checkReferralLocal$,
    balanceInfo$,
    once$,
    allowance$,
    userDpmProxies$,
    hasActiveAavePosition$,
    aaveLiquidations$,
    aaveUserAccountData$,
    aaveAvailableLiquidityInUSDC$,
    dsr$,
    dsrDeposit$,
    dsrWithdraw$
  }
}

export function bigNumberTostring(v: BigNumber): string {
  return v.toString()
}

function ilkUrnAddressToString({ ilk, urnAddress }: { ilk: string; urnAddress: string }): string {
  return `${ilk}-${urnAddress}`
}

export type AppContext = ReturnType<typeof setupAppContext>
