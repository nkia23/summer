import BigNumber from 'bignumber.js'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import type { AjnaBorrowerEventsResponse } from 'features/ajna/history/types'

export const mapAjnaAuctionResponse = (event: AjnaBorrowerEventsResponse) => ({
  // blockNumber: new BigNumber(event.blockNumber),
  // collateralAddress: event.collateralAddress,
  // collateralAfter: new BigNumber(event.collateralAfter),
  // collateralBefore: new BigNumber(event.collateralBefore),
  // collateralDelta: new BigNumber(event.collateralDelta),
  // collateralOraclePrice: new BigNumber(event.collateralOraclePrice),
  // collateralToken: event.collateralToken,
  // collateralTokenPriceUSD: new BigNumber(event.collateralTokenPriceUSD),
  // debtAddress: event.debtAddress,
  // debtAfter: new BigNumber(event.debtAfter),
  // debtBefore: new BigNumber(event.debtBefore),
  // debtDelta: new BigNumber(event.debtDelta),
  // debtOraclePrice: new BigNumber(event.debtOraclePrice),
  // debtToken: event.debtToken,
  // debtTokenPriceUSD: new BigNumber(event.debtTokenPriceUSD),
  // depositedUSD: new BigNumber(event.depositedUSD),
  // ethPrice: new BigNumber(event.ethPrice),
  // gasFeeUSD: new BigNumber(event.gasFeeUSD),
  // gasPrice: new BigNumber(event.gasPrice),
  // gasUsed: new BigNumber(event.gasUsed),
  id: event.id,
  settledDebt: new BigNumber(event.settledDebt).shiftedBy(NEGATIVE_WAD_PRECISION),
  debtToCover: new BigNumber(event.debtToCover).shiftedBy(NEGATIVE_WAD_PRECISION),
  collateralForLiquidation: new BigNumber(event.collateralForLiquidation).shiftedBy(
    NEGATIVE_WAD_PRECISION,
  ),
  remainingCollateral: new BigNumber(event.remainingCollateral).shiftedBy(NEGATIVE_WAD_PRECISION),
  kind: event.kind,
  // liquidationPriceAfter: new BigNumber(event.liquidationPriceAfter),
  // liquidationPriceBefore: new BigNumber(event.liquidationPriceBefore),
  // ltvAfter: new BigNumber(event.ltvAfter),
  // ltvBefore: new BigNumber(event.ltvBefore),
  // marketPrice: new BigNumber(event.marketPrice),
  // multipleAfter: new BigNumber(event.multipleAfter),
  // multipleBefore: new BigNumber(event.multipleBefore),
  // netValueAfter: new BigNumber(event.netValueAfter),
  // netValueBefore: new BigNumber(event.netValueBefore),
  // oasisFee: new BigNumber(event.oasisFee),
  // oasisFeeToken: event.oasisFeeToken,
  // oasisFeeUSD: new BigNumber(event.oasisFeeUSD),
  // quoteTokensAfter: new BigNumber(event.quoteTokensAfter),
  // quoteTokensBefore: new BigNumber(event.quoteTokensBefore),
  // quoteTokensDelta: new BigNumber(event.quoteTokensDelta),
  // quoteTokensMoved: new BigNumber(event.quoteTokensMoved),
  // moveQuoteFromPrice: new BigNumber(ajnaBuckets[Number(event.moveQuoteFromIndex)]).shiftedBy(
  //   NEGATIVE_WAD_PRECISION,
  // ),
  // moveQuoteToPrice: new BigNumber(ajnaBuckets[Number(event.moveQuoteToIndex)]).shiftedBy(
  //   NEGATIVE_WAD_PRECISION,
  // ),
  // addOrRemovePrice: new BigNumber(ajnaBuckets[Number(event.addOrRemoveIndex)]).shiftedBy(
  //   NEGATIVE_WAD_PRECISION,
  // ),
  // isOpen: event.isOpen,
  // swapFromAmount: new BigNumber(event.swapFromAmount),
  // swapFromToken: event.swapFromToken,
  // swapToAmount: new BigNumber(event.swapToAmount),
  // swapToToken: event.swapToToken,
  timestamp: Number(event.timestamp) * 1000,
  txHash: event.txHash,
})
