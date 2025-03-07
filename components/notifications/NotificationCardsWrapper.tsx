import { trackingEvents } from 'analytics/trackingEvents'
import { MixpanelCommonAnalyticsSections, MixpanelNotificationsEventIds } from 'analytics/types'
import { useNotificationSocket } from 'components/context'
import { NotificationCard } from 'components/notifications/NotificationCard'
import { NotificationsEmptyList } from 'components/notifications/NotificationsEmptyList'
import { getNotificationTitle } from 'features/notifications/helpers'
import type { NotificationChange } from 'features/notifications/notificationChange'
import { NOTIFICATION_CHANGE } from 'features/notifications/notificationChange'
import { NotificationTypes } from 'features/notifications/types'
import { useUIChanges } from 'helpers/uiChangesHook'
import React from 'react'

export function NotificationCardsWrapper() {
  const { socket, analyticsData } = useNotificationSocket()
  const [notificationsState] = useUIChanges<NotificationChange>(NOTIFICATION_CHANGE)

  const validNotifications = notificationsState.allNotifications
    .filter((item) => item.notificationType in NotificationTypes)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))

  const account = analyticsData.walletAddress

  function markReadHandler(notificationId: string) {
    socket?.emit('markread', {
      address: account,
      notificationId,
    })
    trackingEvents.notifications.buttonClick(
      MixpanelNotificationsEventIds.MarkAsRead,
      MixpanelCommonAnalyticsSections.NotificationCenter,
      analyticsData,
    )
  }

  function editHandler(notificationId: string, isRead: boolean) {
    !isRead && markReadHandler(notificationId)
    socket?.emit('markread', {
      address: account,
      notificationId,
    })

    trackingEvents.notifications.buttonClick(
      MixpanelNotificationsEventIds.GoToVault,
      MixpanelCommonAnalyticsSections.NotificationCenter,
      analyticsData,
    )
  }

  return (
    <>
      {validNotifications.length > 0 ? (
        <>
          {validNotifications.map((item) => (
            <NotificationCard
              key={item.id}
              {...item}
              title={getNotificationTitle({
                type: item.notificationType,
                timestamp: item.timestamp,
                additionalData: item.additionalData,
              })}
              markReadHandler={markReadHandler}
              editHandler={editHandler}
            />
          ))}
        </>
      ) : (
        <NotificationsEmptyList />
      )}
    </>
  )
}
