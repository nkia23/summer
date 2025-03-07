import type BigNumber from 'bignumber.js'
import { WAD_PRECISION } from 'components/constants'
import { ajnaDefaultPoolRangeMarketPriceOffset } from 'features/ajna/common/consts'
import { snapToPredefinedValues } from 'features/ajna/positions/earn/helpers/snapToPredefinedValues'
import { one, zero } from 'helpers/zero'

export const getMinMaxAndRange = ({
  highestThresholdPrice,
  lowestUtilizedPrice,
  lowestUtilizedPriceIndex,
  mostOptimisticMatchingPrice,
  marketPrice,
  isOracless,
  mompOffset, // 0 - 1, percentage value
  htpOffset, // 0 - 1, percentage value
}: {
  highestThresholdPrice: BigNumber
  lowestUtilizedPrice: BigNumber
  lowestUtilizedPriceIndex: BigNumber
  mostOptimisticMatchingPrice: BigNumber
  marketPrice: BigNumber
  isOracless: boolean
  mompOffset: number
  htpOffset: number
}) => {
  // check whether pool contain liquidity and borrowers, if no generate default range from the lowest price to market price
  // for oraceless we don't show slider in this case. so logic is not adjusted for that occasion
  if (lowestUtilizedPriceIndex.eq(zero)) {
    const defaultRange = [marketPrice.times(one.minus(ajnaDefaultPoolRangeMarketPriceOffset))]

    while (defaultRange[defaultRange.length - 1].lt(marketPrice)) {
      defaultRange.push(
        defaultRange[defaultRange.length - 1].times(1.005).decimalPlaces(WAD_PRECISION),
      )
    }

    return {
      min: snapToPredefinedValues(defaultRange[0]),
      max: snapToPredefinedValues(defaultRange[defaultRange.length - 1]),
      range: defaultRange,
    }
  }

  // Generate ranges from min to lup
  const lupNearHtpRange = [lowestUtilizedPrice]

  while (lupNearHtpRange[lupNearHtpRange.length - 1].gt(highestThresholdPrice)) {
    lupNearHtpRange.push(lupNearHtpRange[lupNearHtpRange.length - 1].div(1.005))
  }

  const nearHtpMinRange = [lupNearHtpRange[lupNearHtpRange.length - 1]]

  while (
    nearHtpMinRange[nearHtpMinRange.length - 1].gt(nearHtpMinRange[0].times(one.minus(htpOffset)))
  ) {
    nearHtpMinRange.push(nearHtpMinRange[nearHtpMinRange.length - 1].div(1.005))
  }

  // Generate ranges from lup to max
  const lupNearMompRange = [lowestUtilizedPrice]

  while (lupNearMompRange[lupNearMompRange.length - 1].lt(mostOptimisticMatchingPrice)) {
    lupNearMompRange.push(lupNearMompRange[lupNearMompRange.length - 1].times(1.005))
  }

  const nearMompMaxRange = [lupNearMompRange[lupNearMompRange.length - 1]]

  while (
    nearMompMaxRange[nearMompMaxRange.length - 1].lt(
      nearMompMaxRange[0].times(one.plus(mompOffset)),
    )
  ) {
    nearMompMaxRange.push(nearMompMaxRange[nearMompMaxRange.length - 1].times(1.005))
  }

  const range = [
    ...new Set([...nearHtpMinRange, ...lupNearHtpRange, ...lupNearMompRange, ...nearMompMaxRange]),
  ]
    .filter((item) => (isOracless ? true : item.lt(marketPrice)))
    .sort((a, b) => a.toNumber() - b.toNumber())
    .map((item) => item.decimalPlaces(18))

  return {
    min: snapToPredefinedValues(range[0]),
    max: snapToPredefinedValues(range[range.length - 1]),
    range,
  }
}
