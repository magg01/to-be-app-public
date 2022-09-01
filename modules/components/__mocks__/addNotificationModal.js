const mockOneOffEventItem = (eventType, eventPlanTitle) => ({
  type: eventType,
  id: 0,
  eventDate: new Date().toISOString(),
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  notificationId: null,
  planTitle: eventPlanTitle,
  toBeTitle: "Well-rested",
});

export { mockOneOffEventItem };
