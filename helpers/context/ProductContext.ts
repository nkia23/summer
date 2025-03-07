import { setUser } from '@sentry/react'
import { mixpanelIdentify } from 'analytics/mixpanel'
import { trackingEvents } from 'analytics/trackingEvents'
import { BigNumber } from 'bignumber.js'
import { call } from 'blockchain/calls/callsHelpers'
import { charterNib, charterPeace, charterUline } from 'blockchain/calls/charter'
import {
  cropperBonusTokenAddress,
  cropperCrops,
  cropperShare,
  cropperStake,
  cropperStock,
} from 'blockchain/calls/cropper'
import { dogIlk } from 'blockchain/calls/dog'
import {
  tokenAllowance,
  tokenBalance,
  tokenBalanceFromAddress,
  tokenBalanceRawForJoin,
  tokenDecimals,
  tokenName,
  tokenSymbol,
} from 'blockchain/calls/erc20'
import { jugIlk } from 'blockchain/calls/jug'
import { crvLdoRewardsEarned } from 'blockchain/calls/lidoCrvRewards'
import { observe } from 'blockchain/calls/observe'
import { pipHop, pipPeek, pipPeep, pipZzz } from 'blockchain/calls/osm'
import { CropjoinProxyActionsContractAdapter } from 'blockchain/calls/proxyActions/adapters/CropjoinProxyActionsSmartContractAdapter'
import { proxyActionsAdapterResolver$ } from 'blockchain/calls/proxyActions/proxyActionsAdapterResolver'
import { vaultActionsLogic } from 'blockchain/calls/proxyActions/vaultActionsLogic'
import { spotIlk } from 'blockchain/calls/spot'
import { vatIlk } from 'blockchain/calls/vat'
import { getCollateralLocked$, getTotalValueLocked$ } from 'blockchain/collateral'
import { identifyTokens$ } from 'blockchain/identifyTokens'
import { createIlkData$, createIlkDataList$, createIlksSupportedOnNetwork$ } from 'blockchain/ilks'
import { createInstiVault$ } from 'blockchain/instiVault'
import type { InstiVault } from 'blockchain/instiVault.types'
import { every10Seconds$ } from 'blockchain/network.constants'
import type { NetworkNames } from 'blockchain/networks'
import { NetworkIds } from 'blockchain/networks'
import { createOraclePriceData$, createTokenPriceInUSD$ } from 'blockchain/prices'
import { tokenPrices$ } from 'blockchain/prices.constants'
import {
  createAccountBalance$,
  createAllowance$,
  createBalance$,
  createBalanceFromAddress$,
  createCollateralTokens$,
} from 'blockchain/tokens'
import { charterIlks } from 'blockchain/tokens/mainnet'
import {
  getPositionIdFromDpmProxy$,
  getUserDpmProxies$,
  getUserDpmProxy$,
} from 'blockchain/userDpmProxies'
import { createVaultsFromIds$, decorateVaultsWithValue$ } from 'blockchain/vaults'
import type { Vault } from 'blockchain/vaults.types'
import type { AccountContext } from 'components/context'
import { pluginDevModeHelpers } from 'components/devModeHelpers'
import dayjs from 'dayjs'
import { getProxiesRelatedWithPosition$ } from 'features/aave/helpers/getProxiesRelatedWithPosition'
import { getStrategyConfig$ } from 'features/aave/helpers/getStrategyConfig'
import {
  createReadPositionCreatedEvents$,
  getLastCreatedPositionForProxy$,
} from 'features/aave/services'
import type { PositionId } from 'features/aave/types/position-id'
import { getAjnaPosition$ } from 'features/ajna/positions/common/observables/getAjnaPosition'
import type { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import {
  getDpmPositionData$,
  getDpmPositionDataV2$,
} from 'features/ajna/positions/common/observables/getDpmPositionData'
import { createAutomationTriggersData } from 'features/automation/api/automationTriggersData'
import type { TriggersData } from 'features/automation/api/automationTriggersData.types'
import { MULTIPLY_VAULT_PILL_CHANGE_SUBJECT } from 'features/automation/protection/stopLoss/state/multiplyVaultPillChange.constants'
import type { MultiplyPillChange } from 'features/automation/protection/stopLoss/state/multiplyVaultPillChange.types'
import { createBonusPipe$ } from 'features/bonus/bonusPipe'
import { createMakerProtocolBonusAdapter } from 'features/bonus/makerProtocolBonusAdapter'
import { InstitutionalBorrowManageAdapter } from 'features/borrow/manage/pipes/adapters/institutionalBorrowManageAdapter'
import type { ManageInstiVaultState } from 'features/borrow/manage/pipes/adapters/institutionalBorrowManageAdapter.types'
import { StandardBorrowManageAdapter } from 'features/borrow/manage/pipes/adapters/standardBorrowManageAdapter'
import { createManageVault$ } from 'features/borrow/manage/pipes/manageVault'
import type { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault.types'
import { createOpenVault$ } from 'features/borrow/open/pipes/openVault'
import { createDaiDeposit$ } from 'features/dsr/helpers/daiDeposit'
import { createDsrDeposit$ } from 'features/dsr/helpers/dsrDeposit'
import { createDsrHistory$ } from 'features/dsr/helpers/dsrHistory'
import { chi, dsr, Pie, pie } from 'features/dsr/helpers/potCalls'
import { createDsr$ } from 'features/dsr/utils/createDsr'
import { createProxyAddress$ as createDsrProxyAddress$ } from 'features/dsr/utils/proxy'
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
import type { ExchangeAction, ExchangeType } from 'features/exchange/exchange'
import { createExchangeQuote$ } from 'features/exchange/exchange'
import { followedVaults$ } from 'features/follow/api'
import { createGeneralManageVault$ } from 'features/generalManageVault/generalManageVault'
import type { VaultType } from 'features/generalManageVault/vaultType.types'
import { createIlkDataListWithBalances$ } from 'features/ilks/ilksWithBalances'
import { createManageMultiplyVault$ } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { createOpenMultiplyVault$ } from 'features/multiply/open/pipes/openMultiplyVault'
import { createVaultsNotices$ } from 'features/notices/vaultsNotices'
import { createReclaimCollateral$ } from 'features/reclaimCollateral/reclaimCollateral'
import {
  createBalanceInfo$,
  createBalancesArrayInfo$,
  createBalancesFromAddressArrayInfo$,
} from 'features/shared/balanceInfo'
import type { BalanceInfo } from 'features/shared/balanceInfo.types'
import { createCheckOasisCDPType$ } from 'features/shared/checkOasisCDPType'
import { createPriceInfo$ } from 'features/shared/priceInfo'
import { checkVaultTypeUsingApi$, getApiVaults, saveVaultUsingApi$ } from 'features/shared/vaultApi'
import { getAllowanceStateMachine } from 'features/stateMachines/allowance'
import {
  getCreateDPMAccountTransactionMachine,
  getDPMAccountStateMachine,
} from 'features/stateMachines/dpmAccount'
import { getGasEstimation$ } from 'features/stateMachines/proxy/pipelines'
import { transactionContextService } from 'features/stateMachines/transaction'
import { createVaultHistory$ } from 'features/vaultHistory/vaultHistory'
import { vaultsWithHistory$ } from 'features/vaultHistory/vaultsHistory'
import { createAssetActions$ } from 'features/vaultsOverview/pipes/assetActions'
import type { AaveLikePosition } from 'features/vaultsOverview/pipes/positions'
import {
  createAaveV2Position$,
  createAaveV3DpmPosition$,
  createMakerPositions$,
  createPositions$,
} from 'features/vaultsOverview/pipes/positions'
import { createMakerPositionsList$ } from 'features/vaultsOverview/pipes/positionsList'
import { createPositionsOverviewSummary$ } from 'features/vaultsOverview/pipes/positionsOverviewSummary'
import { bigNumberTostring } from 'helpers/bigNumberToString'
import { getYieldChange$, getYields$ } from 'helpers/earn/calculations'
import { doGasEstimation } from 'helpers/form'
import { supportedBorrowIlks, supportedEarnIlks, supportedMultiplyIlks } from 'helpers/productCards'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { uiChanges } from 'helpers/uiChanges'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { getAaveV2Services } from 'lendingProtocols/aave-v2'
import { getAaveV3Services } from 'lendingProtocols/aave-v3'
import { getSparkV3Services } from 'lendingProtocols/spark-v3'
import { isEqual, memoize } from 'lodash'
import { equals } from 'ramda'
import type { Observable } from 'rxjs'
import { combineLatest, defer, of } from 'rxjs'
import {
  distinctUntilChanged,
  distinctUntilKeyChanged,
  map,
  mergeMap,
  shareReplay,
  switchMap,
} from 'rxjs/operators'

import { refreshInterval } from './constants'
import type { MainContext } from './MainContext.types'
import type { TxHelpers } from './TxHelpers'
import type { ProtocolsServices } from './types'
import curry from 'ramda/src/curry'

export function setupProductContext(
  {
    account$,
    chainContext$,
    connectedContext$,
    context$,
    everyBlock$,
    gasPrice$,
    once$,
    onEveryBlock$,
    oracleContext$,
    txHelpers$,
  }: MainContext,
  {
    balance$,
    cdpManagerIlks$,
    charterCdps$,
    cropJoinCdps$,
    ilkData$,
    ilkToToken$,
    mainnetDpmProxies$,
    optimismDpmProxies$,
    arbitrumDpmProxies$,
    mainnetReadPositionCreatedEvents$,
    optimismReadPositionCreatedEvents$,
    arbitrumReadPositionCreatedEvents$,
    oraclePriceData$,
    proxyAddress$,
    standardCdps$,
    urnResolver$,
    userSettings$,
    vatGem$,
    vatUrns$,
    vault$,
    vaults$,
  }: AccountContext,
) {
  console.info('Product context setup')
  combineLatest(account$, connectedContext$)
    .pipe(
      mergeMap(([account, network]) => {
        return of({
          networkName: network.name,
          connectionKind: network.connectionKind,
          account: account?.toLowerCase(),
          method: network.connectionMethod,
          walletLabel: network.walletLabel,
        })
      }),
      distinctUntilChanged(isEqual),
    )
    .subscribe(({ account, networkName, connectionKind, method, walletLabel }) => {
      if (account) {
        setUser({ id: account, walletLabel: walletLabel })
        mixpanelIdentify(account, { walletType: connectionKind, walletLabel: walletLabel })
        trackingEvents.accountChange(account, networkName, connectionKind, method, walletLabel)
      }
    })

  const tokenPriceUSD$ = memoize(
    curry(createTokenPriceInUSD$)(every10Seconds$, tokenPrices$),
    (tokens: string[]) => tokens.sort((a, b) => a.localeCompare(b)).join(','),
  )
  const tokenPriceUSDStatic$ = memoize(
    curry(createTokenPriceInUSD$)(once$, tokenPrices$),
    (tokens: string[]) => tokens.sort((a, b) => a.localeCompare(b)).join(','),
  )

  const daiEthTokenPrice$ = tokenPriceUSD$(['DAI', 'ETH'])

  function addGasEstimation$<S extends HasGasEstimation>(
    state: S,
    call: (send: TxHelpers, state: S) => Observable<number> | undefined,
  ): Observable<S> {
    return doGasEstimation(gasPrice$, daiEthTokenPrice$, txHelpers$, state, call)
  }

  // protocols
  const aaveV2Services = getAaveV2Services({
    refresh$: onEveryBlock$,
  })

  const aaveV3Services = getAaveV3Services({
    refresh$: onEveryBlock$,
    networkId: NetworkIds.MAINNET,
  })
  const aaveV3OptimismServices = getAaveV3Services({
    refresh$: onEveryBlock$,
    networkId: NetworkIds.OPTIMISMMAINNET,
  })
  const aaveV3ArbitrumServices = getAaveV3Services({
    refresh$: onEveryBlock$,
    networkId: NetworkIds.ARBITRUMMAINNET,
  })
  const sparkV3Services = getSparkV3Services({
    refresh$: onEveryBlock$,
    networkId: NetworkIds.MAINNET,
  })

  // base

  const vatIlksLean$ = observe(once$, chainContext$, vatIlk)
  const spotIlksLean$ = observe(once$, chainContext$, spotIlk)
  const jugIlksLean$ = observe(once$, chainContext$, jugIlk)
  const dogIlksLean$ = observe(once$, chainContext$, dogIlk)

  const charterNib$ = observe(onEveryBlock$, context$, charterNib)
  const charterPeace$ = observe(onEveryBlock$, context$, charterPeace)
  const charterUline$ = observe(onEveryBlock$, context$, charterUline)

  const cropperStake$ = observe(onEveryBlock$, context$, cropperStake)
  const cropperShare$ = observe(onEveryBlock$, context$, cropperShare)
  const cropperStock$ = observe(onEveryBlock$, context$, cropperStock)
  const cropperTotal$ = observe(onEveryBlock$, context$, cropperStock)
  const cropperCrops$ = observe(onEveryBlock$, context$, cropperCrops)
  const cropperBonusTokenAddress$ = observe(onEveryBlock$, context$, cropperBonusTokenAddress)

  const pipZzzLean$ = observe(once$, chainContext$, pipZzz)
  const pipHopLean$ = observe(once$, context$, pipHop)
  const pipPeekLean$ = observe(once$, oracleContext$, pipPeek)
  const pipPeepLean$ = observe(once$, oracleContext$, pipPeep)

  const unclaimedCrvLdoRewardsForIlk$ = observe(onEveryBlock$, context$, crvLdoRewardsEarned)

  const charter = {
    nib$: (args: { ilk: string; usr: string }) => charterNib$(args),
    peace$: (args: { ilk: string; usr: string }) => charterPeace$(args),
    uline$: (args: { ilk: string; usr: string }) => charterUline$(args),
  }

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

  const tokenBalanceLean$ = observe(once$, context$, tokenBalance)
  const tokenBalanceFromAddress$ = observe(onEveryBlock$, context$, tokenBalanceFromAddress)

  const balanceLean$ = memoize(
    curry(createBalance$)(once$, chainContext$, tokenBalanceLean$),
    (token, address) => `${token}_${address}`,
  )

  const balanceFromAddress$ = memoize(
    curry(createBalanceFromAddress$)(onEveryBlock$, chainContext$, tokenBalanceFromAddress$),
    (token, address) => `${token.address}_${token.precision}_${address}`,
  )

  const userDpmProxies$ = curry(getUserDpmProxies$)(context$)

  const userDpmProxy$ = memoize(curry(getUserDpmProxy$)(context$), (vaultId) => vaultId)
  const positionIdFromDpmProxy$ = memoize(
    curry(getPositionIdFromDpmProxy$)(context$),
    (dpmProxy) => dpmProxy,
  )

  const tokenAllowance$ = observe(onEveryBlock$, context$, tokenAllowance)
  const tokenBalanceRawForJoin$ = observe(onEveryBlock$, chainContext$, tokenBalanceRawForJoin)
  const tokenDecimals$ = observe(onEveryBlock$, chainContext$, tokenDecimals)
  const tokenSymbol$ = observe(onEveryBlock$, chainContext$, tokenSymbol)
  const tokenName$ = observe(onEveryBlock$, chainContext$, tokenName)

  const allowance$ = curry(createAllowance$)(context$, tokenAllowance$)

  const ilkDataLean$ = memoize(
    curry(createIlkData$)(vatIlksLean$, spotIlksLean$, jugIlksLean$, dogIlksLean$, ilkToToken$),
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

  const potDsr$ = context$.pipe(
    switchMap((context) => {
      return everyBlock$(defer(() => call(context, dsr)()))
    }),
  )
  const potChi$ = context$.pipe(
    switchMap((context) => {
      return everyBlock$(defer(() => call(context, chi)()))
    }),
  )

  const potBigPie$ = context$.pipe(
    switchMap((context) => {
      return everyBlock$(defer(() => call(context, Pie)()))
    }),
  )

  const potTotalValueLocked$ = combineLatest(potChi$, potBigPie$).pipe(
    switchMap(([chi, potBigPie]) =>
      of(potBigPie.div(new BigNumber(10).pow(18)).times(chi.div(new BigNumber(10).pow(27)))),
    ),
    shareReplay(1),
  )

  const proxyAddressDsrObservable$ = memoize(
    (addressFromUrl: string) =>
      context$.pipe(
        switchMap((context) => everyBlock$(createDsrProxyAddress$(context, addressFromUrl))),
        shareReplay(1),
      ),
    (item) => item,
  )

  const dsrHistory$ = memoize(
    (addressFromUrl: string) =>
      combineLatest(context$, proxyAddressDsrObservable$(addressFromUrl), onEveryBlock$).pipe(
        switchMap(([context, proxyAddress, _]) => {
          return proxyAddress ? defer(() => createDsrHistory$(context, proxyAddress)) : of([])
        }),
      ),
    (item) => item,
  )

  // TODO: Lines 737 to 773, think we are needing to modify this to use different context, lots of repeated code
  const dsr$ = memoize(
    (addressFromUrl: string) =>
      createDsr$(
        context$,
        everyBlock$,
        onEveryBlock$,
        dsrHistory$(addressFromUrl),
        potDsr$,
        potChi$,
        addressFromUrl,
      ),
    (item) => item,
  )

  const potPie$ = memoize(
    (addressFromUrl: string) =>
      combineLatest(context$, proxyAddressDsrObservable$(addressFromUrl)).pipe(
        switchMap(([context, proxyAddress]) => {
          if (!proxyAddress) return of(zero)
          return everyBlock$(
            defer(() => call(context, pie)(proxyAddress)),
            equals,
          )
        }),
      ),
    (item) => item,
  )

  const daiDeposit$ = memoize(
    (addressFromUrl: string) => createDaiDeposit$(potPie$(addressFromUrl), potChi$),
    (item) => item,
  )

  const dsrDeposit$ = memoize(
    (addressFromUrl: string) =>
      createDsrDeposit$(
        context$,
        txHelpers$,
        proxyAddressDsrObservable$(addressFromUrl),
        allowance$,
        balancesInfoArray$(['DAI', 'SDAI'], addressFromUrl),
        daiDeposit$(addressFromUrl),
        potDsr$,
        dsr$(addressFromUrl),
        addGasEstimation$,
      ),
    (item) => item,
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

  const balancesInfoArray$ = curry(createBalancesArrayInfo$)(balance$)
  const balancesFromAddressInfoArray$ = curry(createBalancesFromAddressArrayInfo$)(
    balanceFromAddress$,
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
      quoteToken?: string,
    ) =>
      createExchangeQuote$(
        context$,
        undefined,
        token,
        slippage,
        amount,
        action,
        exchangeType,
        quoteToken,
      ),
    (token: string, slippage: BigNumber, amount: BigNumber, action: string, exchangeType: string) =>
      `${token}_${slippage.toString()}_${amount.toString()}_${action}_${exchangeType}`,
  )

  const vaultWithValue$ = memoize(
    curry(decorateVaultsWithValue$)(vaults$, exchangeQuote$, userSettings$),
  )

  const proxiesRelatedWithPosition$ = memoize(
    curry(getProxiesRelatedWithPosition$)(proxyAddress$, userDpmProxy$),
    (positionId: PositionId) => `${positionId.walletAddress}-${positionId.vaultId}`,
  )

  const readPositionCreatedEvents$ = memoize(
    curry(createReadPositionCreatedEvents$)(context$, userDpmProxies$),
  )

  const lastCreatedPositionForProxy$ = memoize(curry(getLastCreatedPositionForProxy$)(context$))

  const strategyConfig$ = memoize(
    curry(getStrategyConfig$)(
      proxiesRelatedWithPosition$,
      aaveV2Services.aaveLikeProxyConfiguration$,
      lastCreatedPositionForProxy$,
    ),
    (positionId: PositionId, networkName: NetworkNames) =>
      `${positionId.walletAddress}-${positionId.vaultId}-${networkName}`,
  )

  const automationTriggersData$ = memoize(
    curry(createAutomationTriggersData)(chainContext$, onEveryBlock$, proxiesRelatedWithPosition$),
  )

  const mainnetPositionCreatedEventsForProtocol$ = memoize(
    (walletAddress: string, protocol: LendingProtocol) => {
      return mainnetReadPositionCreatedEvents$(walletAddress).pipe(
        map((events) => events.filter((event) => event.protocol === protocol)),
      )
    },
    (wallet, protocol) => `${wallet}-${protocol}`,
  )

  const mainnetAaveV2PositionCreatedEvents$ = memoize((walletAddress: string) => {
    return mainnetPositionCreatedEventsForProtocol$(walletAddress, LendingProtocol.AaveV2)
  })

  const mainnetAaveV3PositionCreatedEvents$ = memoize((walletAddress: string) => {
    return mainnetPositionCreatedEventsForProtocol$(walletAddress, LendingProtocol.AaveV3)
  })

  const mainnetAaveV2Positions$: (walletAddress: string) => Observable<AaveLikePosition[]> =
    memoize(
      curry(createAaveV2Position$)(
        {
          dsProxy$: proxyAddress$,
          userDpmProxies$: mainnetDpmProxies$,
        },
        {
          tickerPrices$: tokenPriceUSDStatic$,
          context$,
          automationTriggersData$,
          readPositionCreatedEvents$: mainnetAaveV2PositionCreatedEvents$,
        },
        aaveV2Services,
      ),
    )

  const aaveMainnetAaveV3Positions$: (walletAddress: string) => Observable<AaveLikePosition[]> =
    memoize(
      curry(createAaveV3DpmPosition$)(
        context$,
        mainnetDpmProxies$,
        tokenPriceUSDStatic$,
        mainnetAaveV3PositionCreatedEvents$,
        getApiVaults,
        automationTriggersData$,
        aaveV3Services,
        NetworkIds.MAINNET,
      ),
      (wallet) => wallet,
    )

  const aaveOptimismPositions$: (walletAddress: string) => Observable<AaveLikePosition[]> = memoize(
    curry(createAaveV3DpmPosition$)(
      context$,
      optimismDpmProxies$,
      tokenPriceUSDStatic$,
      optimismReadPositionCreatedEvents$,
      getApiVaults,
      () => of<TriggersData | undefined>(undefined), // Triggers are not supported on optimism
      aaveV3OptimismServices,
      NetworkIds.OPTIMISMMAINNET,
    ),
    (wallet) => wallet,
  )

  const aaveArbitrumPositions$: (walletAddress: string) => Observable<AaveLikePosition[]> = memoize(
    curry(createAaveV3DpmPosition$)(
      context$,
      arbitrumDpmProxies$,
      tokenPriceUSDStatic$,
      arbitrumReadPositionCreatedEvents$,
      getApiVaults,
      () => of<TriggersData | undefined>(undefined), // Triggers are not supported on arbitrum
      aaveV3ArbitrumServices,
      NetworkIds.ARBITRUMMAINNET,
    ),
    (wallet) => wallet,
  )

  const makerPositions$ = memoize(curry(createMakerPositions$)(vaultWithValue$))
  const positions$ = memoize(
    curry(createPositions$)(
      makerPositions$,
      mainnetAaveV2Positions$,
      aaveMainnetAaveV3Positions$,
      aaveOptimismPositions$,
      aaveArbitrumPositions$,
    ),
  )

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
        exchangeQuote$,
        addGasEstimation$,
        getProportions$,
        vaultHistory$,
        makerOracleTokenPrices$,
        id,
      ),
    bigNumberTostring,
  )

  const checkOasisCDPType$: ({
    id,
    protocol,
  }: {
    id: BigNumber
    protocol: string
  }) => Observable<VaultType> = curry(createCheckOasisCDPType$)(
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

  const vaultBanners$ = memoize(
    curry(createVaultsNotices$)(context$, priceInfo$, vault$, vaultHistory$),
    bigNumberTostring,
  )

  const reclaimCollateral$ = memoize(
    curry(createReclaimCollateral$)(context$, txHelpers$, proxyAddress$),
    bigNumberTostring,
  )

  const makerOracleTokenPrices$ = memoize(
    curry(createMakerOracleTokenPrices$)(chainContext$),
    (token: string, timestamp: dayjs.Dayjs) => {
      return `${token}-${timestamp.format('YYYY-MM-DD HH:mm')}`
    },
  )

  const makerOracleTokenPricesForDates$ = memoize(
    curry(createMakerOracleTokenPricesForDates$)(chainContext$),
    (token: string, timestamps: dayjs.Dayjs[]) => {
      return `${token}-${timestamps.map((t) => t.format('YYYY-MM-DD HH:mm')).join(' ')}`
    },
  )

  const yields$ = memoize(
    (ilk: string, date?: dayjs.Dayjs) => {
      return getYields$(makerOracleTokenPricesForDates$, ilkData$, ilk, date)
    },
    (ilk: string, date: dayjs.Dayjs = dayjs()) => `${ilk}-${date.format('YYYY-MM-DD')}`,
  )

  const yieldsChange$ = memoize(
    curry(getYieldChange$)(yields$),
    (currentDate: dayjs.Dayjs, previousDate: dayjs.Dayjs, ilk: string) =>
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
      exchangeQuote$,
      onEveryBlock$,
      addGasEstimation$,
      ilk,
      token1Balance$,
      getGuniMintAmount$,
      userSettings$,
    ),
  )

  const vaultsFromId$ = memoize(
    curry(createVaultsFromIds$)(onEveryBlock$, followedVaults$, vault$, chainContext$, [
      charterCdps$,
      cropJoinCdps$,
      standardCdps$,
    ]),
  )

  const followedList$ = memoize(
    curry(createMakerPositionsList$)(
      context$,
      ilksWithBalance$,
      memoize(
        curry(vaultsWithHistory$)(
          chainContext$,
          curry(decorateVaultsWithValue$)(vaultsFromId$, exchangeQuote$, userSettings$),
          refreshInterval,
        ),
      ),
    ),
  )

  const protocols: ProtocolsServices = {
    [LendingProtocol.AaveV2]: aaveV2Services,
    [LendingProtocol.AaveV3]: {
      [NetworkIds.MAINNET]: aaveV3Services,
      [NetworkIds.OPTIMISMMAINNET]: aaveV3OptimismServices,
      [NetworkIds.ARBITRUMMAINNET]: aaveV3ArbitrumServices,
    },
    [LendingProtocol.SparkV3]: {
      [NetworkIds.MAINNET]: sparkV3Services,
    },
  }

  const contextForAddress$ = connectedContext$.pipe(
    distinctUntilKeyChanged('account'),
    shareReplay(1),
  )

  const gasEstimation$ = curry(getGasEstimation$)(gasPrice$, daiEthTokenPrice$)

  const commonTransactionServices = transactionContextService(context$)

  const dpmAccountTransactionMachine = getCreateDPMAccountTransactionMachine(
    txHelpers$,
    connectedContext$,
    commonTransactionServices,
  )

  const dpmAccountStateMachine = getDPMAccountStateMachine(
    context$,
    txHelpers$,
    gasEstimation$,
    dpmAccountTransactionMachine,
  )

  const allowanceStateMachine = getAllowanceStateMachine(
    txHelpers$,
    connectedContext$,
    commonTransactionServices,
  )

  const allowanceForAccount$: (token: string, spender: string) => Observable<BigNumber> = memoize(
    (token: string, spender: string) =>
      contextForAddress$.pipe(switchMap(({ account }) => allowance$(token, account, spender))),
    (token, spender) => `${token}-${spender}`,
  )

  const dpmPositionData$ = memoize(
    curry(getDpmPositionData$)(proxiesRelatedWithPosition$, lastCreatedPositionForProxy$),
    (positionId: PositionId) => `${positionId.walletAddress}-${positionId.vaultId}`,
  )

  // v2 because it takes into account all positions created using specific proxies and filter them
  // out based on params from URL i.e. 2x positions with id 950 but on different pools, based on URL params
  // only single position should be picked to be displayed
  const dpmPositionDataV2$ = memoize(
    curry(getDpmPositionDataV2$)(proxiesRelatedWithPosition$, readPositionCreatedEvents$),
    (positionId: PositionId, collateralToken?: string, quoteToken?: string, product?: string) =>
      `${positionId.walletAddress}-${positionId.vaultId}-${collateralToken}-${quoteToken}-${product}`,
  )

  const ajnaPosition$ = memoize(
    curry(getAjnaPosition$)(context$, onEveryBlock$),
    (
      collateralPrice: BigNumber,
      quotePrice: BigNumber,
      dpmPositionData: DpmPositionData,
      collateralAddress?: string,
      quoteAddress?: string,
    ) =>
      `${dpmPositionData.vaultId}-${collateralPrice.decimalPlaces(2).toString()}-${quotePrice
        .decimalPlaces(2)
        .toString()}-${collateralAddress}-${quoteAddress}`,
  )

  const identifiedTokens$ = memoize(curry(identifyTokens$)(context$, once$), (tokens: string[]) =>
    tokens.join(),
  )

  return {
    aaveLikeAvailableLiquidityInUSDC$: aaveV2Services.aaveLikeAvailableLiquidityInUSDC$,
    aaveLikeLiquidations$: aaveV2Services.aaveLikeLiquidations$, // @deprecated,
    aaveLikeProtocolData$: aaveV2Services.aaveLikeProtocolData$,
    aaveLikeUserAccountData$: aaveV2Services.aaveLikeUserAccountData$,
    addGasEstimation$,
    ajnaPosition$,
    allowance$,
    allowanceForAccount$,
    allowanceStateMachine,
    automationTriggersData$,
    balanceInfo$,
    balancesFromAddressInfoArray$,
    balancesInfoArray$,
    bonus$,
    chainContext$,
    commonTransactionServices,
    contextForAddress$,
    daiEthTokenPrice$,
    dpmAccountStateMachine,
    dpmPositionData$,
    dpmPositionDataV2$,
    dsr$,
    dsrDeposit$,
    exchangeQuote$,
    followedList$,
    gasEstimation$,
    generalManageVault$,
    identifiedTokens$,
    ilkDataList$,
    ilks$: ilksSupportedOnNetwork$,
    instiVault$,
    manageGuniVault$,
    manageInstiVault$,
    manageMultiplyVault$,
    manageVault$,
    openGuniVault$,
    openMultiplyVault$,
    openVault$,
    positionIdFromDpmProxy$,
    positionsOverviewSummary$,
    potDsr$,
    potTotalValueLocked$,
    priceInfo$,
    protocols,
    readPositionCreatedEvents$,
    reclaimCollateral$,
    strategyConfig$,
    tokenPriceUSD$,
    tokenPriceUSDStatic$,
    totalValueLocked$,
    userDpmProxies$,
    userDpmProxy$,
    vaultBanners$,
    vaultHistory$,
    yields$,
    yieldsChange$,
  }
}
