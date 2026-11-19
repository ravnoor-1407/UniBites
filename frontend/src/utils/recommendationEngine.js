// UniBite Smart Break-Time Recommendation Engine (Phase 6)
// Rule-based estimation avoiding unnecessary black-box complexity

export const calculateBreakFeasibility = ({
  breakMinutes = 20,
  itemPrepTime = 8,
  ordersAhead = 2,
  walkingDistanceMinutes = 3,
  eatingMinutes = 8,
}) => {
  // 1. Kitchen wait time calculation
  const queueWaitTime = Math.round(ordersAhead * 2.5);
  const totalKitchenTime = itemPrepTime + queueWaitTime;

  // 2. Round-trip transit (from lecture room to outlet and back)
  const roundTripWalking = walkingDistanceMinutes * 2;

  // 3. Total required time
  const totalRequiredTime = totalKitchenTime + roundTripWalking + eatingMinutes;

  // 4. Feasibility categorization
  const bufferRemaining = breakMinutes - totalRequiredTime;

  if (bufferRemaining >= 4) {
    return {
      status: 'Recommended',
      badgeColor: 'success',
      badgeVariant: 'success',
      totalRequiredTime,
      bufferRemaining,
      confidence: 'High',
      headline: 'Safe & Stress-Free',
      message: `Total time ~${totalRequiredTime} mins. You have a ${bufferRemaining}-minute buffer before your next class.`,
    };
  } else if (bufferRemaining >= -2) {
    return {
      status: 'Risky',
      badgeColor: 'warning',
      badgeVariant: 'warning',
      totalRequiredTime,
      bufferRemaining,
      confidence: 'Medium',
      headline: 'Tight Schedule',
      message: `Total time ~${totalRequiredTime} mins. Very close to the bell. Consider fast pickup or pre-ordering.`,
    };
  } else {
    return {
      status: 'Not Suitable',
      badgeColor: 'danger',
      badgeVariant: 'danger',
      totalRequiredTime,
      bufferRemaining,
      confidence: 'Low',
      headline: 'High Risk of Missing Class',
      message: `Estimated ~${totalRequiredTime} mins needed vs your ${breakMinutes}-min break. We recommend a faster outlet.`,
    };
  }
};
