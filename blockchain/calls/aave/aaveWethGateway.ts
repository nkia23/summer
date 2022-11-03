import { CallDef, TransactionDef } from '../callsHelpers'
import { AaveWethGateway } from '../../../types/web3-v1-contracts/aave-weth-gateway'
import { TxMeta } from '@oasisdex/transactions'
import { Erc20 } from '../../../types/web3-v1-contracts/erc20'
import { amountToWei } from '@oasisdex/utils'
import { ApproveData } from '../erc20'
import { contractDesc } from '../../config'
import * as aaveWethGateway from '../../abi/aave-weth-gateway.json'
import BigNumber from 'bignumber.js'
import { TxMetaKind } from '../txMeta'

export type AaveWethGatewayTxDepositData = {
  kind: TxMetaKind
  depositAmount?: BigNumber
  address: string
}

const AAVE_LENDING_POOL = '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9'

export const AAVE_WETH_GATEWAY = '0xEFFC18fC3b7eb8E676dac549E0c693ad50D1Ce31'

export const depositETH: TransactionDef<AaveWethGatewayTxDepositData> = {
  call: (args, { contract }) => {
    return contract<AaveWethGateway>(contractDesc(aaveWethGateway, AAVE_WETH_GATEWAY)).methods
      .depositETH
  },
  prepareArgs: (args, context) => {
    return [AAVE_LENDING_POOL, args.address, 0]
  },
  options: (args) => {
    console.log(`deposit amount ${args.depositAmount}`)
    if (!args.depositAmount) {
      throw new Error('depositAmount is required')
    }
    return {
      value: amountToWei(args.depositAmount).toString(),
    }
  },
}

export type AaveWethGatewayTxWithdrawData = {
  kind: TxMetaKind
  withdrawAmount?: BigNumber
  address: string
}

export const withdrawETH: TransactionDef<AaveWethGatewayTxWithdrawData> = {
  call: (args, { contract }) => {
    return contract<AaveWethGateway>(contractDesc(aaveWethGateway, AAVE_WETH_GATEWAY)).methods
      .withdrawETH
  },
  prepareArgs: ({ withdrawAmount, address }, context) => {
    if (!withdrawAmount) {
      throw new Error('depositAmount is required')
    }
    return [AAVE_LENDING_POOL, amountToWei(withdrawAmount).toString(), address]
  },
}
//
// export const approve: TransactionDef<ApproveData> = {
//   call: ({ token }, { tokens, contract }) => contract<Erc20>(tokens[token]).methods.approve,
//   prepareArgs: ({ spender, amount }) => [spender, amountToWei(amount).toFixed(0)],
// }
