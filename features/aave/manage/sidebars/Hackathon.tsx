import { Box, Grid } from 'theme-ui'
import { Banner } from '../../../../components/Banner'
import { L1_ADDRESS, L2_ADDRESS, SidebarMigrateToOptimism } from './SidebarMigrateToOptimism'
import React, { useState } from 'react'
import { SidebarDepositEthAave } from './SidebarDepositEthAave'
import BigNumber from 'bignumber.js'
import { combineLatest, Observable, Subject } from 'rxjs'
import { TxHelpers } from '../../../../components/AppContext'
import { map, startWith, switchMap } from 'rxjs/operators'
import { depositETH } from '../../../../blockchain/calls/aave/aaveWethGateway'
import { TxMetaKind } from '../../../../blockchain/calls/txMeta'
import { TokenBalanceArgs } from '../../../../blockchain/calls/erc20'
import { useObservable } from '../../../../helpers/observableHook'
import { useAppContext } from '../../../../components/AppContextProvider'
import { zero } from '../../../../helpers/zero'
import { formatAmount, formatBigNumber } from '../../../../helpers/formatters/format'
import {
  DetailsSectionContentCard,
  DetailsSectionContentCardWrapper,
} from '../../../../components/DetailsSectionContentCard'

export function Hackathon() {
  const { tokenBalance$, migrateFromAavePosition$, withdrawFromAavePosition$ } = useAppContext()
  const [l1Balance] = useObservable(
    tokenBalance$({
      account: L1_ADDRESS,
      token: 'aWETH',
    }),
  )

  const [l2Balance] = useObservable(
    tokenBalance$({
      account: L2_ADDRESS,
      token: 'aWETH',
    }),
  )
  useObservable(migrateFromAavePosition$)

  useObservable(withdrawFromAavePosition$)

  const tbalL1 = l1Balance || zero
  const hasL1Deposit = tbalL1.toFixed(2) !== '0.00'
  return (
    <Grid variant="vaultContainer">
      <DetailsSectionContentCardWrapper>
        <DetailsSectionContentCard
          title="ETH on AAVE V2"
          value={formatBigNumber(tbalL1 || zero, 2)}
          unit="ETH (L1)"
        />
        <DetailsSectionContentCard
          title="ETH on AAVE V3"
          value={formatBigNumber(l2Balance || zero, 2)}
          unit="ETH (L2)"
        />
      </DetailsSectionContentCardWrapper>
      <Box>
        {hasL1Deposit ? (
          <SidebarMigrateToOptimism depositedAmount={l1Balance || zero} />
        ) : (
          <SidebarDepositEthAave onDeposit={() => console.log('deposited')} />
        )}
      </Box>
    </Grid>
  )
}
