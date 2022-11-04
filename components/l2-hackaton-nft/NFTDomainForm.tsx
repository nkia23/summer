import BigNumber from 'bignumber.js'
import { getDomainHolder, getDomainPrice, mintDomain } from 'blockchain/punk'
import { amountFromWei } from 'blockchain/utils'
import { InfoSection } from 'components/infoSection/InfoSection'
import { MessageCard } from 'components/MessageCard'
import { WithArrow } from 'components/WithArrow'
import { ethers } from 'ethers'
import { AppSpinner } from 'helpers/AppSpinner'
import { useToggle } from 'helpers/useToggle'
import React, { useEffect, useState } from 'react'
import { Box, Button, Card, Flex, Heading, Input, Link, Text } from 'theme-ui'

// export interface NFTDomainFormProps {}

const steps = ['Switch network', 'Domain verification', 'Confirm transaction', 'Order confirmation']
const arbitrumGoerliNetworkId = 421613

export function NFTDomainForm() {
  const ethereum = (window as any).ethereum

  const [networkId, setNetworkId] = useState<number>(Number(ethereum.networkVersion))
  const [address, setAddress] = useState<string>(ethers.constants.AddressZero)

  const [step, setStep] = useState<number>(0)
  const [isLoading, , setIsLoading] = useToggle(false)

  const [domain, setDomain] = useState<string>('')
  const [domainPrice, setDomainPrice] = useState<string>('')
  const [transactionHash, setTransactionHash] = useState<string>('')
  const [errors, setErrors] = useState<string[]>([])

  const isPrimaryDisabled = (step === 1 && domain === '') || isLoading || step === 3
  const isSecondaryHidden = step === 0 || step === 1 || step === 3

  useEffect(() => {
    async function getChainId() {
      await ethereum.enable()

      if (address === ethers.constants.AddressZero)
        setAddress((await ethereum.request({ method: 'eth_requestAccounts' }))[0])
      if (networkId === arbitrumGoerliNetworkId) setDomainPrice(await getDomainPrice())
    }
    void getChainId()
  }, [networkId])
  ethereum.on('networkChanged', function (networkId: number) {
    setNetworkId(Number(networkId))
  })
  ethereum.on('accountsChanged', function (accounts: string[]) {
    setAddress(accounts[0])
  })

  useEffect(() => {
    if (networkId === arbitrumGoerliNetworkId) {
      setStep(1)
      setIsLoading(false)
    } else setStep(0)
  }, [networkId])

  function switchNetwork() {
    setIsLoading(true)

    ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          blockExplorerUrls: ['https://goerli.arbiscan.io'],
          chainId: '0x66EED',
          chainName: 'Arbitrum Goerli Testnet',
          nativeCurrency: { decimals: 18, name: 'ETH', symbol: 'ETH' },
          rpcUrls: ['https://goerli-rollup.arbitrum.io/rpc'],
        },
      ],
    })
  }
  function verifyDomain() {
    setIsLoading(true)
    void getDomainHolder(domain)
      .then((response) => {
        if (response === ethers.constants.AddressZero) {
          setStep(2)
          setErrors([])
        } else setErrors(['Selected domain is taken, please try something different'])
      })
      .catch(({ error }) => {
        setErrors([
          error?.data?.message ||
            error?.message ||
            'Unable to process transaction, please try again later',
        ])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }
  function buyDomain() {
    setIsLoading(true)
    void mintDomain(domain, address, domainPrice)
      .then((response) => {
        setTransactionHash(response.transactionHash)
        setStep(3)
        setErrors([])
      })
      .catch(({ error }) => {
        setErrors([
          error?.data?.message ||
            error?.message ||
            'Unable to process transaction, please try again later',
        ])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }
  function back() {
    setErrors([])
    setStep(step - 1)
  }

  return (
    <Card
      sx={{
        p: 0,
        border: 'lightMuted',
      }}
    >
      <Heading
        variant="boldParagraph2"
        sx={{
          mb: '24px',
          mx: '24px',
          py: '24px',
          borderBottom: 'lightMuted',
        }}
      >
        Mint your domain
      </Heading>
      <Box
        sx={{
          position: 'relative',
          px: '24px',
        }}
      >
        {isLoading && (
          <AppSpinner
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
              m: 'auto',
              zIndex: 2,
            }}
            variant="extraLarge"
          />
        )}
        <Box
          sx={{
            opacity: isLoading ? 0.5 : 1,
            transition: 'opacity 200ms',
            maxWidth: ['100%', '100%', '60%'],
          }}
        >
          {step === 0 && (
            <>
              <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
                Looks like you are in wrong network. This POC supports only Arbitrum Goerli Testnet,
                click continue to switch to supported network.
              </Text>
            </>
          )}
          {step === 1 && (
            <>
              <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
                Enter your name to see if domain is available to grab.
              </Text>
              <Box sx={{ mt: 3, position: 'relative' }}>
                <Input
                  value={domain}
                  onChange={(e) => {
                    setDomain(e.target.value)
                  }}
                  sx={{
                    pr: '74px',
                    borderColor: 'neutral20',
                    transition: 'border-color 200ms',
                    '&:hover': {
                      borderColor: 'neutral60',
                    },
                    '&:focus, &:focus:hover': {
                      borderColor: 'neutral80',
                    },
                  }}
                />
                <Text
                  sx={{
                    position: 'absolute',
                    height: '20px',
                    top: 0,
                    right: 3,
                    lineHeight: '55px',
                    fontSize: 5,
                  }}
                >
                  .oasis
                </Text>
              </Box>
            </>
          )}
          {step === 2 && (
            <>
              <Text as="p" variant="paragraph3" sx={{ mb: 3, color: 'neutral80' }}>
                Your selected domain{' '}
                <Text as="strong" sx={{ color: 'primary100' }}>
                  {domain}.oasis
                </Text>{' '}
                is available!
              </Text>
              <InfoSection
                title="Order information"
                items={[
                  {
                    label: 'Domain price',
                    value: `${amountFromWei(new BigNumber(domainPrice), 'ETH')} ETH`,
                  },
                  {
                    label: 'Estimated gas fee',
                    value: 'Unable to estimate',
                  },
                ]}
              />
            </>
          )}
          {step === 3 && (
            <>
              <Text as="p" variant="paragraph3" sx={{ mb: 1, color: 'neutral80' }}>
                Congratulations!{' '}
                <Text as="strong" sx={{ color: 'primary100' }}>
                  {domain}.oasis
                </Text>{' '}
                domain is now yours forever.
              </Text>
              <Link
                target="_blank"
                href={`https://goerli-rollup-explorer.arbitrum.io/tx/${transactionHash}`}
              >
                <WithArrow variant="paragraph3" sx={{ color: 'interactive100' }}>
                  Check your transaction on block explorer
                </WithArrow>
              </Link>
            </>
          )}
          {errors.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <MessageCard messages={errors} type="error" withBullet={errors.length > 1} />
            </Box>
          )}
        </Box>
      </Box>
      <Flex
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: '24px',
          p: '24px',
          borderTop: 'lightMuted',
        }}
      >
        <Text as="p" variant="paragraph3">
          Step {step} of 3: {steps[step]}
        </Text>
        <Box>
          {!isSecondaryHidden && (
            <Button variant="action" sx={{ mr: 2 }} onClick={back}>
              Back
            </Button>
          )}
          <Button
            variant="tertiary"
            disabled={isPrimaryDisabled}
            onClick={() => {
              if (step === 0) switchNetwork()
              if (step === 1) verifyDomain()
              if (step === 2) buyDomain()
            }}
          >
            Continue
          </Button>
        </Box>
      </Flex>
    </Card>
  )
}
