
// This utility is for ELO score calculations that might be used outside the context

// Calculate ELO rating changes given two players' ratings
export const calculateEloChange = (
  winnerRating: number, 
  loserRating: number, 
  kFactor: number = 32
): [number, number] => {
  // Expected scores using ELO formula
  const expectedWinnerScore = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoserScore = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));
  
  // Calculate new ratings
  const newWinnerRating = winnerRating + kFactor * (1 - expectedWinnerScore);
  const newLoserRating = loserRating + kFactor * (0 - expectedLoserScore);
  
  return [newWinnerRating, newLoserRating];
};

// Calculate reliability score based on number of comparisons relative to possible pairs
export const calculateReliabilityScore = (
  itemCount: number, 
  comparisonCount: number
): number => {
  // Total possible pairs is n(n-1)/2
  const totalPossiblePairs = itemCount * (itemCount - 1) / 2;
  
  // Full coverage would be at least 1 comparison per pair
  const basicCoveragePercent = Math.min(comparisonCount / totalPossiblePairs, 1);
  
  // Enhanced reliability comes with more comparisons (diminishing returns)
  // We consider full reliability to be achieved at 3x the number of items
  const idealComparisons = itemCount * 3;
  const enhancedReliabilityPercent = Math.min(comparisonCount / idealComparisons, 1);
  
  // Combine basic coverage and enhanced reliability
  // 60% of the score is about covering all pairs, 40% about having multiple comparisons
  return basicCoveragePercent * 0.6 + enhancedReliabilityPercent * 0.4;
};

// Calculate tier based on rating
export const calculateTier = (rating: number, allRatings: number[]): string => {
  const min = Math.min(...allRatings);
  const max = Math.max(...allRatings);
  const range = max - min;
  
  // If there's no significant range, everyone is in tier C
  if (range < 50) return "C";
  
  // Calculate percentile position of this rating
  const position = (rating - min) / range;
  
  // Assign tier based on percentile
  if (position >= 0.95) return "S";
  if (position >= 0.8) return "A";
  if (position >= 0.6) return "B";
  if (position >= 0.4) return "C";
  if (position >= 0.2) return "D";
  return "F";
};
