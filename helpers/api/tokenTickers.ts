import { getCoinbaseTickers } from 'server/services/coinbase'
import { getCoingeckoTickers } from 'server/services/coingecko'
import { getCoinPaprikaTickers } from 'server/services/coinPaprika'
import { getSDaiOracleTicker } from 'server/services/sdaiOracle'

export async function tokenTickers() {
  const results = await Promise.all([
    getCoinPaprikaTickers().catch((error) => {
      console.error('Error getting coinpaprika tickers', error)
      return {}
    }),
    getCoinbaseTickers().catch((error) => {
      console.error('Error getting coinbase tickers', error)
      return {}
    }),
    getCoingeckoTickers().catch((error) => {
      console.error('Error getting coingecko tickers', error)
      return {}
    }),
    getSDaiOracleTicker().catch((error) => {
      console.error('Error getting sDAI oracle price', error)
      return {}
    }),
  ])
  // Merge prices from all services into one tickers blob
  return results.reduce((acc, el) => ({ ...acc, ...el }), {})
}
