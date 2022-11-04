import { SidebarSection } from '../../../../components/sidebar/SidebarSection'
import { VaultActionInput } from '../../../../components/vault/VaultActionInput'
import React, { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { combineLatest, Observable, Subject } from 'rxjs'
import { TxHelpers } from '../../../../components/AppContext'
import { callOperationExecutor } from '../../../../blockchain/calls/operationExecutor'
import { TxMetaKind } from '../../../../blockchain/calls/txMeta'
import { OPERATION_NAMES } from '@oasisdex/oasis-actions'
import { depositETH, withdrawETH } from '../../../../blockchain/calls/aave/aaveWethGateway'
import { first, map, switchMap } from 'rxjs/operators'
import { useObservable } from '../../../../helpers/observableHook'
import { useAaveContext } from '../../AaveContextProvider'
import { useAppContext } from '../../../../components/AppContextProvider'
import { TokenBalanceArgs } from '../../../../blockchain/calls/erc20'

function openAavePosition$(
  txnHelpers$: Observable<TxHelpers>,
  depositAmount$: Observable<BigNumber>,
) {
  return combineLatest(txnHelpers$, depositAmount$).pipe(
    switchMap(([txnHelpers, depositAmount]) => {
      return txnHelpers.sendWithGasEstimation(depositETH, {
        kind: TxMetaKind.depositAave,
        depositAmount: depositAmount,
        address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      })
    }),
  )
}

const deposit$ = new Subject<BigNumber>()

export function SidebarDepositEthAave(props: { onDeposit: (depositAmount: BigNumber) => void }) {
  const [enteredAmount, setEnteredAmount] = useState<BigNumber | undefined>()

  const { txHelpers$ } = useAppContext()

  const [withdrawTxData] = useObservable(openAavePosition$(txHelpers$, deposit$))
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    if (withdrawTxData?.meta.depositAmount) {
      props.onDeposit(withdrawTxData.meta.depositAmount)
    }
  }, [withdrawTxData?.meta.depositAmount && withdrawTxData?.meta.depositAmount.toString()])

  return (
    <SidebarSection
      title="Deposit ETH to AAVE V2"
      content={
        <>
          <VaultActionInput
            action="Deposit"
            currencyCode={'ETH'}
            onChange={(e) => {
              setEnteredAmount(new BigNumber(e.target.value))
            }}
            hasError={false}
            amount={enteredAmount}
          />
        </>
      }
      primaryButton={{
        label: 'Deposit',
        disabled: !enteredAmount || !enteredAmount.gt(0),
        action: () => {
          setClicked(true)
          deposit$.next(enteredAmount)
        },
        isLoading: clicked,
      }}
    />
  )
}
