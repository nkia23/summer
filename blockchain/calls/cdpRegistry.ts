import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { CdpRegistry } from 'types/web3-v1-contracts'
import Web3 from 'web3'

import { CallDef } from './callsHelpers'

export const cdpRegistryOwns: CallDef<BigNumber, string> = {
  call: (_, { contract, chainId }) =>
    contract<CdpRegistry>(getNetworkContracts(chainId).cdpRegistry).methods.owns,
  prepareArgs: (cdpId) => [cdpId.toString()],
  postprocess: (address: any) => address,
}

export const cdpRegistryCdps: CallDef<{ ilk: string; usr: string }, BigNumber | null> = {
  call: (_, { contract, chainId }) =>
    contract<CdpRegistry>(getNetworkContracts(chainId).cdpRegistry).methods.cdps,
  prepareArgs: ({ ilk, usr }) => [Web3.utils.utf8ToHex(ilk), usr],
  postprocess: (cdpId: any) => {
    return parseInt(cdpId) === 0 ? null : new BigNumber(cdpId)
  },
}
