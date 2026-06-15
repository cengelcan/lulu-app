export function getCheckInReminderContent(petName: string): { title: string; body: string } {
  return {
    title: 'Pet Health Journal',
    body: `How is ${petName} today?`,
  };
}
