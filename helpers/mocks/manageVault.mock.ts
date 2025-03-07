import { BigNumber } from 'bignumber.js'
import { maxUint256 } from 'blockchain/calls/erc20.constants'
import { CharteredDssProxyActionsContractAdapter } from 'blockchain/calls/proxyActions/adapters/CharteredDssProxyActionsContractAdapter'
import { StandardDssProxyActionsContractAdapter } from 'blockchain/calls/proxyActions/adapters/standardDssProxyActionsContractAdapter'
import type { IlkData } from 'blockchain/ilks.types'
import type { InstiVault } from 'blockchain/instiVault.types'
import type { Context } from 'blockchain/network.types'
import type { Vault } from 'blockchain/vaults.types'
import type { TriggersData } from 'features/automation/api/automationTriggersData.types'
import { InstitutionalBorrowManageAdapter } from 'features/borrow/manage/pipes/adapters/institutionalBorrowManageAdapter'
import type { ManageInstiVaultState } from 'features/borrow/manage/pipes/adapters/institutionalBorrowManageAdapter.types'
import { StandardBorrowManageAdapter } from 'features/borrow/manage/pipes/adapters/standardBorrowManageAdapter'
import { createManageVault$ } from 'features/borrow/manage/pipes/manageVault'
import type { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault.types'
import type { BalanceInfo } from 'features/shared/balanceInfo.types'
import type { PriceInfo } from 'features/shared/priceInfo.types'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import { protoTxHelpers } from 'helpers/protoTxHelpers'
import { getStateUnpacker } from 'helpers/testHelpers'
import { one, zero } from 'helpers/zero'
import type { Observable } from 'rxjs'
import { of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import type { MockBalanceInfoProps } from './balanceInfo.mock'
import { mockBalanceInfo$ } from './balanceInfo.mock'
import { mockContext$ } from './context.mock'
import type { MockIlkDataProps } from './ilks.mock'
import { mockIlkData$ } from './ilks.mock'
import { addGasEstimationMock } from './openVault.mock'
import type { MockPriceInfoProps } from './priceInfo.mock'
import { mockPriceInfo$ } from './priceInfo.mock'
import { mockedEmptyStopLossTrigger } from './stopLoss.mock'
import type { MockVaultProps } from './vaults.mock'
import { mockVault$ } from './vaults.mock'

export const MOCK_VAULT_ID = one
export const MOCK_CHAIN_ID = new BigNumber(2137)

const mockedBorrowEvents: VaultHistoryEvent[] = [
  {
    token: 'ETH',
    kind: 'WITHDRAW',
    collateralAmount: new BigNumber(-2),
    oraclePrice: new BigNumber(2705),
    ethPrice: new BigNumber(2650),
    rate: new BigNumber(1),
    hash: '0x',
    timestamp: 'string',
    id: 'string',
  },
  {
    token: 'ETH',
    kind: 'GENERATE',
    daiAmount: new BigNumber(1000),
    oraclePrice: new BigNumber(2650),
    ethPrice: new BigNumber(2650),
    rate: new BigNumber(1),
    hash: '0x',
    timestamp: 'string',
    id: 'string',
  },
  {
    token: 'ETH',
    kind: 'DEPOSIT',
    collateralAmount: new BigNumber(5),
    oraclePrice: new BigNumber(2700),
    ethPrice: new BigNumber(2650),
    rate: new BigNumber(1),
    hash: '0x',
    timestamp: 'string',
    id: 'string',
  },
]

export interface MockManageVaultProps {
  _context$?: Observable<Context>
  _txHelpers$?: Observable<TxHelpers>
  _ilkData$?: Observable<IlkData>
  _priceInfo$?: Observable<PriceInfo>
  _balanceInfo$?: Observable<BalanceInfo>
  _proxyAddress$?: Observable<string | undefined>
  _vaultHistory$?: Observable<VaultHistoryEvent[]>
  _automationTriggersData$?: Observable<TriggersData>
  _collateralAllowance$?: Observable<BigNumber>
  _daiAllowance$?: Observable<BigNumber>
  _vault$?: Observable<Vault>
  _saveVaultType$?: Observable<void>

  ilkData?: MockIlkDataProps
  priceInfo?: MockPriceInfoProps
  balanceInfo?: MockBalanceInfoProps
  vault?: MockVaultProps

  proxyAddress?: string
  collateralAllowance?: BigNumber
  daiAllowance?: BigNumber
  account?: string
  status?: 'connected'
  gasEstimationUsd?: BigNumber
}

function buildMockDependencies({
  _context$,
  _txHelpers$,
  _ilkData$,
  _priceInfo$,
  _balanceInfo$,
  _proxyAddress$,
  _vaultHistory$,
  _automationTriggersData$,
  _collateralAllowance$,
  _daiAllowance$,
  _vault$,
  _saveVaultType$,

  ilkData,
  priceInfo,
  balanceInfo,
  vault,
  proxyAddress,
  collateralAllowance,
  daiAllowance,
  account = '0xVaultController',
  status = 'connected',
  gasEstimationUsd,
}: MockManageVaultProps = {}) {
  const token = vault && vault.ilk ? vault.ilk.split('-')[0] : 'WBTC'

  const context$ =
    _context$ ||
    mockContext$({
      account,
      status,
    })
  const txHelpers$ = _txHelpers$ || of(protoTxHelpers)

  function priceInfo$() {
    return _priceInfo$ || mockPriceInfo$({ ...priceInfo, token })
  }

  function ilkData$() {
    return (
      _ilkData$ ||
      mockIlkData$({
        _priceInfo$: priceInfo$(),
        ...ilkData,
      })
    )
  }

  function balanceInfo$() {
    return _balanceInfo$ || mockBalanceInfo$({ ...balanceInfo, address: account })
  }

  function proxyAddress$() {
    return _proxyAddress$ || of(proxyAddress)
  }

  function vaultHistory$() {
    return _vaultHistory$ || of(mockedBorrowEvents)
  }

  function automationTriggersData$() {
    return _automationTriggersData$ || of(mockedEmptyStopLossTrigger)
  }

  function allowance$(_token: string) {
    return _token === 'DAI'
      ? _daiAllowance$ || daiAllowance
        ? of(daiAllowance || zero)
        : of(maxUint256)
      : _collateralAllowance$ || collateralAllowance
      ? of(collateralAllowance || zero)
      : of(maxUint256)
  }

  function vault$() {
    return (
      _vault$ ||
      priceInfo$().pipe(
        switchMap((priceInfo) => {
          return mockVault$({
            _ilkData$: ilkData$(),
            priceInfo,
            ...vault,
          }).vault$
        }),
      )
    )
  }

  function saveVaultType$() {
    return _saveVaultType$ || of(undefined)
  }

  function gasEstimationMock$<T>(state: T) {
    return addGasEstimationMock(state, gasEstimationUsd)
  }

  return {
    token,
    context$,
    txHelpers$,
    priceInfo$,
    ilkData$,
    balanceInfo$,
    proxyAddress$,
    allowance$,
    vault$,
    saveVaultType$,
    vaultHistory$,
    automationTriggersData$,
    gasEstimationMock$,
  }
}

export function mockManageVault$(
  args: MockManageVaultProps = {},
): Observable<ManageStandardBorrowVaultState> {
  const {
    context$,
    txHelpers$,
    proxyAddress$,
    allowance$,
    priceInfo$,
    balanceInfo$,
    ilkData$,
    vault$,
    saveVaultType$,
    vaultHistory$,
    automationTriggersData$,
    gasEstimationMock$,
  } = buildMockDependencies(args)

  return createManageVault$<Vault, ManageStandardBorrowVaultState>(
    context$ as Observable<Context>,
    txHelpers$,
    proxyAddress$,
    allowance$,
    priceInfo$,
    balanceInfo$,
    ilkData$,
    vault$,
    saveVaultType$,
    gasEstimationMock$,
    vaultHistory$,
    () => of(StandardDssProxyActionsContractAdapter),
    StandardBorrowManageAdapter,
    automationTriggersData$,
    MOCK_VAULT_ID,
  )
}

export interface MockManageInstiVaultProps extends MockManageVaultProps {
  _instiVault$?: Observable<InstiVault>
}

export function mockManageInstiVault$(
  args: MockManageInstiVaultProps = {},
): Observable<ManageInstiVaultState> {
  const {
    context$,
    txHelpers$,
    proxyAddress$,
    allowance$,
    priceInfo$,
    balanceInfo$,
    ilkData$,
    saveVaultType$,
    vaultHistory$,
    automationTriggersData$,
    gasEstimationMock$,
  } = buildMockDependencies(args)

  function instiVault$(): Observable<InstiVault> {
    const { instiVault$ } = mockVault$()

    return args._instiVault$ || instiVault$
  }

  return createManageVault$<InstiVault, ManageInstiVaultState>(
    context$ as Observable<Context>,
    txHelpers$,
    proxyAddress$,
    allowance$,
    priceInfo$,
    balanceInfo$,
    ilkData$,
    instiVault$,
    saveVaultType$,
    gasEstimationMock$,
    vaultHistory$,
    () => of(new CharteredDssProxyActionsContractAdapter()),
    InstitutionalBorrowManageAdapter,
    automationTriggersData$,
    MOCK_VAULT_ID,
  )
}

export function mockManageVault(props: MockManageVaultProps = {}) {
  return getStateUnpacker(mockManageVault$(props))
}
