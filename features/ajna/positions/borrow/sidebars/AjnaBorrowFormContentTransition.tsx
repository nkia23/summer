import { Icon } from '@makerdao/dai-ui-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'theme-ui'

export function AjnaBorrowFormContentTransition() {
  const { t } = useTranslation()

  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('vault-form.header.go-to-multiply')}
      </Text>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('vault-form.subtext.confirm')}
      </Text>
      <Icon name="multiply_transition" size="auto" />
    </>
  )
}
