import { BigNumber } from 'bignumber.js'
import { RAD, RAY, WAD } from 'components/constants'
import padEnd from 'lodash/padEnd'
//@ts-ignore
import ethAbi from 'web3-eth-abi'

import { getToken } from './tokensMetadata'

export function amountFromRay(amount: BigNumber): BigNumber {
  return amount.div(RAY).decimalPlaces(RAY.toString().length)
}

export function amountFromRad(amount: BigNumber): BigNumber {
  return amount.div(RAD).decimalPlaces(RAD.toString().length)
}

export function funcSigTopic(v: string): string {
  //@ts-ignore
  return padEnd(ethAbi.encodeFunctionSignature(v), 66, '0')
}

export function amountToWei(amount: BigNumber, token: string): BigNumber {
  const { precision } = getToken(token)
  return amount.times(new BigNumber(10).pow(precision))
}

export function amountFromWei(amount: BigNumber, token: string): BigNumber {
  const { precision } = getToken(token)
  return amount.div(new BigNumber(10).pow(precision))
}

export function amountToWad(amount: BigNumber): BigNumber {
  return amount.times(WAD)
}

export function amountToWeiRoundDown(amount: BigNumber, token: string): BigNumber {
  const { precision } = getToken(token)
  return amount.times(new BigNumber(10).pow(precision)).decimalPlaces(0, BigNumber.ROUND_DOWN)
}
