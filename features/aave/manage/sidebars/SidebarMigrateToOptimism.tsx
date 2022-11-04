import { SidebarSection } from '../../../../components/sidebar/SidebarSection'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'
import { StrategyInformationContainer } from '../../common/components/informationContainer'
import React, { useState } from 'react'
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
import { staticFilesRuntimeUrl } from '../../../../helpers/staticPaths'
import { Icon } from '@makerdao/dai-ui-icons'

export const L1_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
export const L2_ADDRESS = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

export function SidebarMigrateToOptimism(props: { depositedAmount: BigNumber; migrated: boolean }) {
  enum MigrateState {
    READY_TO_MIGRATE = 'READY_TO_MIGRATE',
    MIGRATING = 'MIGRATING',
    PROMPTING_NETWORK = 'PROMPTING_NETWORK',
    DONE = 'DONE',
  }
  const [state, setState] = useState<MigrateState>(
    props.migrated ? MigrateState.PROMPTING_NETWORK : MigrateState.READY_TO_MIGRATE,
  )

  if (state === MigrateState.READY_TO_MIGRATE) {
    return <ReadyToMigrate {...props} onMigrate={() => setState(MigrateState.MIGRATING)} />
  } else if (state === MigrateState.MIGRATING && !props.migrated) {
    return <Migrating />
  } else if (state === MigrateState.PROMPTING_NETWORK) {
    return <PromptNetworkSwitch onSwitch={() => setState(MigrateState.DONE)} />
  } else {
    return <NetworkSwitched />
  }
}

function NetworkSwitched() {
  return (
    <SidebarSection
      title={'Manage Your Vault'}
      content={
        <Grid gap={3}>
          <Text as="p" variant="paragraph2" sx={{ color: 'neutral80' }}>
            You are now on Optimism network.
          </Text>
          <Box sx={{ position: 'relative' }}>
            <Flex sx={{ justifyContent: 'center', mb: 4 }}>
              <Image
                src={staticFilesRuntimeUrl('/static/img/Profile-Logo1.svg')}
                sx={{ height: '120px', marginTop: '30px' }}
              />
            </Flex>
          </Box>
        </Grid>
      }
      primaryButton={{
        label: 'Go to your position',
        action: () => {},
      }}
    />
  )
}

function Migrating() {
  return (
    <SidebarSection
      title={'Manage Your Vault'}
      content={
        <Grid gap={3}>
          <Text as="p" variant="paragraph2" sx={{ color: 'neutral80' }}>
            You position is currently being migrated. Please wait.
          </Text>
          <Box sx={{ position: 'relative' }}>
            <Flex sx={{ justifyContent: 'center', mb: 4 }}>
              <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
            </Flex>
            <Box sx={{ zIndex: 20, position: 'absolute', left: '274px', top: '30px' }}>
              <Image src={staticFilesRuntimeUrl('/static/img/Group1997.svg')} />
              <Image
                src={staticFilesRuntimeUrl('/static/img/Profile-Logo1.svg')}
                sx={{ zIndex: 30, position: 'absolute', left: '30px', top: '30px' }}
              />
            </Box>
          </Box>
        </Grid>
      }
      primaryButton={{
        label: 'Migration in progress',
        action: () => {},
        disabled: true,
        isLoading: true,
      }}
    />
  )
}

function PromptNetworkSwitch(props: { onSwitch: () => void }) {
  const [waitingForSwitch, setWaitingForSwitch] = useState(false)
  return (
    <SidebarSection
      title={'Manage Your Vault'}
      content={
        <Grid gap={3}>
          <Text as="p" variant="paragraph2" sx={{ color: 'neutral80' }}>
            You position has been successfully migrated to AAVE V3 on Optimism. You will now need to
            switch networks.
          </Text>
          <Flex sx={{ justifyContent: 'center', mb: 4 }}>
            <Image src={staticFilesRuntimeUrl('/static/img/optimism_done.png')} />
          </Flex>
        </Grid>
      }
      primaryButton={{
        label: waitingForSwitch ? 'Confirm network in wallet' : 'Switch to Optimism Network',
        action: () => {
          const w = window as any
          if (w && w.ethereum) {
            setWaitingForSwitch(true)
            w.ethereum
              .request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x' + parseInt('10').toString(16),
                    chainName: 'Optimism',
                    nativeCurrency: {
                      name: 'Ether',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['https://mainnet.optimism.io'],
                    blockExplorerUrls: ['https://optimistic.etherscan.io/'],
                  },
                ],
              })
              .then(() => props.onSwitch())
          }
        },
        disabled: waitingForSwitch,
      }}
    />
  )
}

function ReadyToMigrate(props: { depositedAmount: BigNumber; onMigrate: () => void }) {
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
                  2.30%
                  <VaultChangesInformationArrow />
                  2.40 %
                </Flex>
              }
            />
            <VaultChangesInformationItem
              label="Max LTV"
              value={
                <Flex>
                  71%
                  <VaultChangesInformationArrow />
                  71%
                </Flex>
              }
            />
            <VaultChangesInformationItem
              label="Position LTV"
              value={
                <Flex>
                  0%
                  <VaultChangesInformationArrow />
                  0%
                </Flex>
              }
            />
            <VaultChangesInformationItem
              label="Collateral"
              value={
                <Flex>
                  10.00
                  <VaultChangesInformationArrow />
                  10.00
                </Flex>
              }
            />
            <VaultChangesInformationItem
              label="Debt"
              value={
                <Flex>
                  0
                  <VaultChangesInformationArrow />0
                </Flex>
              }
            />
            <VaultChangesInformationItem label="Bridge Fees" value="0.0001 ETH" />
            <VaultChangesInformationItem label="Estimated transaction cost" value="0.001 ETH" />
            <VaultChangesInformationItem label="Estimated confirmation time" value="8 minutes" />
          </VaultChangesInformationContainer>
        </Grid>
      }
      primaryButton={{
        label: 'Migrate Now',
        action: () => {
          migrationClick$.next(props.depositedAmount)
          props.onMigrate()
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
