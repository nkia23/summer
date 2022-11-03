import { SidebarSection } from '../../../../components/sidebar/SidebarSection'
import { Flex, Grid, Text } from 'theme-ui'
import { StrategyInformationContainer } from '../../common/components/informationContainer'
import React from 'react'
import {
  VaultChangesInformationArrow,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from '../../../../components/vault/VaultChangesInformation'
import { useManageAaveStateMachineContext } from '../containers/AaveManageStateMachineContext'
import { useActor } from '@xstate/react'
import { formatPercent } from '../../../../helpers/formatters/format'
import { zero } from '../../../../helpers/zero'
import { useAaveContext } from '../../AaveContextProvider'
import { useEarnContext } from '../../../earn/EarnContextProvider'
import { useObservable } from '../../../../helpers/observableHook'
import { combineLatest, Observable, of, Subject } from 'rxjs'
import { TxHelpers } from '../../../../components/AppContext'
import BigNumber from 'bignumber.js'
import { catchError, filter, switchMap } from 'rxjs/operators'
import {
  AAVE_WETH_GATEWAY,
  depositETH,
  withdrawETH,
} from '../../../../blockchain/calls/aave/aaveWethGateway'
import { TxMetaKind } from '../../../../blockchain/calls/txMeta'
import { useAppContext } from '../../../../components/AppContextProvider'
import { approve } from '../../../../blockchain/calls/erc20'
import { TxStatus } from '@oasisdex/transactions'
import { tap } from 'rxjs/internal/operators'

export const L1_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
export const L2_ADDRESS = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

export function SidebarMigrateToOptimism(props: { depositedAmount: BigNumber }) {
  const { migrationClick$, withdrawal$ } = useAppContext()

  return (
    <SidebarSection
      title={'Manage Your Vault'}
      content={
        <Grid gap={3}>
          <Text as="p" variant="paragraph2" sx={{ color: 'neutral80' }}>
            To migrate your Aave Vault to another network, please see the details below and confirm.
            You may need to wait a short time before the deposits are confirmed on the other
            network, and this time can vary.
          </Text>
          <VaultChangesInformationContainer title="Migrate Aave Position - L1 -> L2 (Optimism)">
            <VaultChangesInformationItem
              label="Variable Rate"
              value={
                <Flex>
                  {formatPercent(new BigNumber(2.3).times(100), {
                    precision: 2,
                  })}
                  <VaultChangesInformationArrow />
                  TODO %
                </Flex>
              }
            />
            <VaultChangesInformationItem
              label="Max LTV"
              value={
                <Flex>
                  {formatPercent(new BigNumber(70).times(100), { precision: 2 })}
                  <VaultChangesInformationArrow />
                  TODO %
                </Flex>
              }
            />
            <VaultChangesInformationItem
              label="Position LTV"
              value={
                <Flex>
                  {formatPercent(new BigNumber(0.7).times(100).times(100), { precision: 2 })}
                  <VaultChangesInformationArrow />
                  TODO %
                </Flex>
              }
            />
            <VaultChangesInformationItem
              label="Collateral"
              value={
                <Flex>
                  {new BigNumber(70).times(100).toFixed(2)}
                  <VaultChangesInformationArrow />
                  TODO %
                </Flex>
              }
            />
            <VaultChangesInformationItem
              label="Debt"
              value={
                <Flex>
                  {new BigNumber(70).times(100).toFixed(2)}
                  <VaultChangesInformationArrow />
                  TODO %
                </Flex>
              }
            />
            <VaultChangesInformationItem label="Bridge Fees" value="TODO %" />
            <VaultChangesInformationItem label="Estimated transaction cost" value="TODO %" />
            <VaultChangesInformationItem label="Estimated confirmation time" value="TODO %" />
          </VaultChangesInformationContainer>
        </Grid>
      }
      primaryButton={{
        label: 'Migrate Now',
        action: () => {
          migrationClick$.next(props.depositedAmount)
        },
      }}
      secondaryButton={{
        label: 'Withdraw all',
        action: () => {
          withdrawal$.next(props.depositedAmount)
        },
      }}
    />
  )
}
