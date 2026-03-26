self.addEventListener('push', function(event) {
  const data = event.data?.json() || {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'Jaleca', {
      body: data.body,
      icon: '/logo-sem-tagline.jpg',
      data: { url: data.url }
    })
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/'))
})
