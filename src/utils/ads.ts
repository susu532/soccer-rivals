export const adManager = {
  triggerMidRoll: () => {
    console.log('[AdManager] Triggering Mid-roll Ad...');
    // Placeholder for actual ad SDK call
  },
  triggerRewarded: (onReward: () => void) => {
    console.log('[AdManager] Triggering Rewarded Ad...');
    // Simulate watching ad
    setTimeout(() => {
      console.log('[AdManager] Ad finished, granting reward.');
      onReward();
    }, 2000);
  },
  triggerHappyMoment: () => {
    console.log('[AdManager] Happy Moment triggered!');
    // Placeholder for actual SDK call
  }
};
