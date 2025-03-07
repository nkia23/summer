import { Icon } from '@makerdao/dai-ui-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Flex } from 'theme-ui'

interface AssetsTableDataRiskProtectionIconProps {
  isOwner?: boolean
  level: number
  link: string
}

export function AssetsTableDataCellRiskProtectionIcon({
  isOwner,
  level,
}: AssetsTableDataRiskProtectionIconProps) {
  const { t } = useTranslation()

  return level > 0 ? (
    <Flex
      sx={{
        justifyContent: 'flex-end',
      }}
    >
      <Icon name="stop_loss_active" size={36} />
    </Flex>
  ) : (
    <Button
      variant="action"
      sx={{
        pointerEvents: 'none',
      }}
    >
      {isOwner ? t('discover.table.activate') : t('discover.table.inactive')}
    </Button>
  )
}
