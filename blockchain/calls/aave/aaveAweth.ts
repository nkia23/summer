import { CallDef } from '../callsHelpers'
import { BigNumber } from 'bignumber.js'
import { Erc20 } from '../../../types/web3-v1-contracts/erc20'
import { amountFromWei } from '@oasisdex/utils'
import { getToken } from '../../tokensMetadata'
import { TokenBalanceArgs } from '../erc20'

export interface TokenBalanceArgs {
  token: string
  account: string
}

export const tokenBalance: CallDef<TokenBalanceArgs, BigNumber> = {
  call: ({ token }, { contract, tokens }) => contract<Erc20>(tokens[token]).methods.balanceOf,
  prepareArgs: ({ account }) => [account],
  postprocess: (result, { token }) =>
    amountFromWei(new BigNumber(result), getToken(token).precision),
}
