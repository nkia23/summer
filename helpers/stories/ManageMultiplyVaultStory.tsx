import { isProductContextAvailable, productContext } from 'components/context'
import { SharedUIContext } from 'components/SharedUIProvider'
import { GeneralManageControl } from 'components/vault/GeneralManageControl'
import { createGeneralManageVault$ } from 'features/generalManageVault/generalManageVault'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import { defaultMutableManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault.constants'
import type { MutableManageMultiplyVaultState } from 'features/multiply/manage/pipes/MutableManageMultiplyVaultState.types'
import type { ProductContext } from 'helpers/context/ProductContext.types'
import type { MockManageMultiplyVaultProps } from 'helpers/mocks/manageMultiplyVault.mock'
import { MOCK_VAULT_ID, mockManageMultiplyVault$ } from 'helpers/mocks/manageMultiplyVault.mock'
import { memoize } from 'lodash'
import React, { useEffect } from 'react'
import { EMPTY, from, of } from 'rxjs'
import { first } from 'rxjs/operators'
import { Card, Container, Grid } from 'theme-ui'
import { InjectTokenIconsDefs } from 'theme/tokenIcons'

type ManageMultiplyVaultStory = { title?: string } & MockManageMultiplyVaultProps

export function manageMultiplyVaultStory({
  title,
  account,
  balanceInfo,
  priceInfo,
  vault,
  ilkData,
  proxyAddress,
  collateralAllowance,
  daiAllowance,
  exchangeQuote,
}: ManageMultiplyVaultStory = {}) {
  return (
      {
        depositAmount,
        withdrawAmount,
        generateAmount,
        paybackAmount,
        ...otherState
      }: Partial<MutableManageMultiplyVaultState> = defaultMutableManageMultiplyVaultState(
        vault?.collateral,
      ),
    ) =>
    () => {
      const obs$ = mockManageMultiplyVault$({
        account,
        balanceInfo,
        priceInfo,
        vault,
        ilkData,
        proxyAddress,
        collateralAllowance,
        daiAllowance,
        exchangeQuote,
      })

      useEffect(() => {
        const subscription = obs$
          .pipe(first())
          .subscribe(({ injectStateOverride, priceInfo: { currentCollateralPrice } }) => {
            const newState: Partial<MutableManageMultiplyVaultState> = {
              ...otherState,
              ...(depositAmount && {
                depositAmount,
                depositAmountUSD: depositAmount.times(currentCollateralPrice),
              }),
              ...(withdrawAmount && {
                withdrawAmount,
                withdrawAmountUSD: withdrawAmount.times(currentCollateralPrice),
              }),
              ...(generateAmount && {
                generateAmount,
              }),
              ...(paybackAmount && {
                paybackAmount,
              }),
            }

            injectStateOverride(newState || {})
          })

        return subscription.unsubscribe()
      }, [])

      const ctx = {
        vaultHistory$: memoize(() => of([])),
        context$: of({ etherscan: 'url' }),
        generalManageVault$: memoize(() =>
          createGeneralManageVault$(
            () => from([]),
            () => obs$,
            () => obs$,
            // @ts-ignore, don't need to mock regular here
            () => of(EMPTY),
            () => of(VaultType.Multiply),
            () => of(EMPTY),
            MOCK_VAULT_ID,
          ),
        ),
        manageMultiplyVault$: () => obs$,
        manageGuniVault$: () => obs$,
      } as any as ProductContext

      return (
        <productContext.Provider value={ctx as any}>
          <SharedUIContext.Provider
            value={{
              vaultFormOpened: true,
              setVaultFormOpened: () => null,
              setVaultFormToggleTitle: () => null,
            }}
          >
            <ManageMultiplyVaultStoryContainer title={title} />
          </SharedUIContext.Provider>
        </productContext.Provider>
      )
    }
}

const ManageMultiplyVaultStoryContainer = ({ title }: { title?: string }) => {
  if (!isProductContextAvailable()) return null

  return (
    <Container variant="appContainer">
      <InjectTokenIconsDefs />
      <Grid>
        {title && <Card>{title}</Card>}
        <GeneralManageControl id={MOCK_VAULT_ID} />
      </Grid>
    </Container>
  )
}
