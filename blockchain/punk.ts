import { default as arbitrumGoerliAddreses } from 'blockchain/addresses/arbitrum-goerli.json'
import { Context } from 'blockchain/network'
import { ethers } from 'ethers'
import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'

const ARBITRUM_GOERLI_RPC = 'https://goerli-rollup.arbitrum.io/rpc'
const arbitrumGoerliHttpProvider = new ethers.providers.JsonRpcProvider(ARBITRUM_GOERLI_RPC)

const resolverInterface = new ethers.utils.Interface([
  'function getFirstDefaultDomain(address _addr) public view returns(string memory)',
])

export function resolvePunkName$(context$: Observable<Context>, address: string) {
  return context$.pipe(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    switchMap(async (context) => {
      return await arbitrumGoerliHttpProvider
        .call({
          to: arbitrumGoerliAddreses['PUNK_DOMAINS_RESOLVER'],
          data: resolverInterface.encodeFunctionData('getFirstDefaultDomain', [address]),
        })
        .then((result) => {
          return resolverInterface.decodeFunctionResult('getFirstDefaultDomain', result)[0]
        })
    }),
  )
}

export async function mintDomain(domain: string, address: string) {
  const ethereum = (window as any).ethereum

  const tldAddress = arbitrumGoerliAddreses['PUNK_DOMAINS_TESTOASIS_TLD_MINT']
  const intf = new ethers.utils.Interface([
    'function price() external view returns(uint256)',
    'function mint(string memory _domainName, address _domainHolder, address _referrer) external payable returns(uint256)',
  ])
  const signer = new ethers.providers.Web3Provider(ethereum).getSigner()
  const contract = new ethers.Contract(tldAddress, intf, signer)
  const selectedPrice = await contract.price()

  try {
    const tx = await contract.mint(domain, address, ethers.constants.AddressZero, {
      value: String(selectedPrice),
    })

    if (tx) {
      await tx.wait()
    }
  } catch (e) {
    console.log(e)
    console.log('error')
  }
}
