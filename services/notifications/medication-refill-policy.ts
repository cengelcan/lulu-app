export function shouldSendMedicationRefillNotification(
  remainingDoses: number,
  refillThreshold: number
): boolean {
  return remainingDoses === refillThreshold;
}
