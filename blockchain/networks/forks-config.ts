import { JsonRpcBatchProvider } from 'blockchain/jsonRpcBatchProvider'
import { getStorageValue } from 'helpers/useLocalStorage'
import { keyBy, memoize } from 'lodash'

import { NetworkIds } from './network-ids'
import { NetworkLabelType, NetworkNames } from './network-names'
import { NetworkConfig, NetworkConfigHexId, networksByName } from './networks-config'
import {
  CustomForkParameterType,
  CustomForkStorageKey,
  isValidCustomForkParameter,
} from './use-custom-fork-parameter'

export const forkSettings = getStorageValue<CustomForkParameterType>(
  CustomForkStorageKey,
  {},
  isValidCustomForkParameter,
)

export const forkNetworks: NetworkConfig[] = Object.entries(forkSettings).map(
  ([networkName, forkNetwork]) => {
    const originalNetworkConfig = networksByName[networkName]
    return {
      ...originalNetworkConfig,
      id: forkNetwork.id as unknown as NetworkIds,
      originalId: originalNetworkConfig.id,
      hexId: `0x${Number(forkNetwork.id).toString(16)}` as NetworkConfigHexId,
      label: `${originalNetworkConfig.label} Test` as NetworkLabelType,
      rpcUrl: forkNetwork.url,
      getReadProvider: memoize(() => new JsonRpcBatchProvider(forkNetwork.url)),
      name: `${originalNetworkConfig.name}-test` as NetworkNames,
      isCustomFork: true,
      getParentNetwork: () => originalNetworkConfig,
    }
  },
)

export const forkNetworksByOriginalId = keyBy(forkNetworks, 'originalId')
export const forksByHexId = keyBy(forkNetworks, 'hexId')
