// Campus Distance Matrix (in walking minutes) between key spots at the university
// Consistent, realistic campus layout modeling walking times across academic blocks, hostels and food courts.

const campusSpots = [
  'Block 14 MSB',
  'Block 25-28',
  'Block 33',
  'Block 34',
  'Campus Cafe',
  'BH2 Hostel',
  'Uni-Apartments',
  'Food Square'
];

// Matrix representing walking minutes between locations (symmetric)
const walkingTimes = {
  'Block 14 MSB': {
    'Block 14 MSB': 1,
    'Block 25-28': 4,
    'Block 33': 6,
    'Block 34': 7,
    'Campus Cafe': 3,
    'BH2 Hostel': 9,
    'Uni-Apartments': 8,
    'Food Square': 5,
  },
  'Block 25-28': {
    'Block 14 MSB': 4,
    'Block 25-28': 1,
    'Block 33': 3,
    'Block 34': 4,
    'Campus Cafe': 5,
    'BH2 Hostel': 8,
    'Uni-Apartments': 7,
    'Food Square': 6,
  },
  'Block 33': {
    'Block 14 MSB': 6,
    'Block 25-28': 3,
    'Block 33': 1,
    'Block 34': 2,
    'Campus Cafe': 7,
    'BH2 Hostel': 6,
    'Uni-Apartments': 4,
    'Food Square': 7,
  },
  'Block 34': {
    'Block 14 MSB': 7,
    'Block 25-28': 4,
    'Block 33': 2,
    'Block 34': 1,
    'Campus Cafe': 8,
    'BH2 Hostel': 5,
    'Uni-Apartments': 4,
    'Food Square': 8,
  },
  'Campus Cafe': {
    'Block 14 MSB': 3,
    'Block 25-28': 5,
    'Block 33': 7,
    'Block 34': 8,
    'Campus Cafe': 1,
    'BH2 Hostel': 10,
    'Uni-Apartments': 9,
    'Food Square': 4,
  },
  'BH2 Hostel': {
    'Block 14 MSB': 9,
    'Block 25-28': 8,
    'Block 33': 6,
    'Block 34': 5,
    'Campus Cafe': 10,
    'BH2 Hostel': 1,
    'Uni-Apartments': 4,
    'Food Square': 9,
  },
  'Uni-Apartments': {
    'Block 14 MSB': 8,
    'Block 25-28': 7,
    'Block 33': 4,
    'Block 34': 4,
    'Campus Cafe': 9,
    'BH2 Hostel': 4,
    'Uni-Apartments': 1,
    'Food Square': 8,
  },
  'Food Square': {
    'Block 14 MSB': 5,
    'Block 25-28': 6,
    'Block 33': 7,
    'Block 34': 8,
    'Campus Cafe': 4,
    'BH2 Hostel': 9,
    'Uni-Apartments': 8,
    'Food Square': 1,
  },
};

/**
 * Get walking time between two campus spots
 * @param {string} fromSpot 
 * @param {string} toSpot 
 * @returns {number} walking minutes
 */
function getWalkingTime(fromSpot, toSpot) {
  if (!fromSpot || !toSpot) return 5;
  if (walkingTimes[fromSpot] && walkingTimes[fromSpot][toSpot] !== undefined) {
    return walkingTimes[fromSpot][toSpot];
  }
  return 5; // default fallback
}

module.exports = {
  campusSpots,
  walkingTimes,
  getWalkingTime,
};
