import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const campusSpots = [
  'Block 14 MSB',
  'Block 25-28',
  'Block 33',
  'Block 34',
  'Campus Cafe',
  'BH2 Hostel',
  'Uni-Apartments',
  'Food Square',
];

export const LocationProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem('unibites_location') || 'Block 14 MSB';
  });

  const setLocation = (spot) => {
    setSelectedLocation(spot);
    localStorage.setItem('unibites_location', spot);
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setLocation,
        campusSpots,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
export default LocationContext;
