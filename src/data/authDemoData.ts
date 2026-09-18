import type { AuthUser } from '../types/multiRole';

export const DEMO_CITIZEN: AuthUser = {
  id: 'CITIZEN-DL-7821',
  role: 'citizen',
  name: 'Rahul Sharma',
  email: 'rahul.delhi@gmail.com',
  phone: '+91 98101 44321',
  ward: 'Ward 14 — Rohini North',
  badge: 'Verified Citizen Guardian',
  karmaPoints: 340,
  avatar: 'RS',
};

export const DEMO_OFFICER: AuthUser = {
  id: 'OFFICER-CMD-904',
  role: 'officer',
  name: 'Inspector Vikram Malhotra',
  email: 'vikram.malhotra@mcd.delhigov.in',
  phone: '+91 11 2341 8899',
  designation: 'Chief Incident Commander',
  department: 'Disaster & Civic Response Command',
  badgeId: 'DL-MCD-CMD-0984',
  badge: 'Municipal Authority • Level 4 Clearance',
  clearanceLevel: 4,
  avatar: 'VM',
};
