export function getDashboardMetrics({ contacts = [], meetings = [] }) {
  const totalContacts = contacts.length;

  const countriesSet = new Set();
  const continentMap = {};
  const companyMap = {};
  const roleMap = {};
  const countryMap = {};

  contacts.forEach((contact) => {
    const country = contact?.paises?.nombre?.trim();
    const continent = contact?.paises?.continente?.trim();
    const company = contact?.empresa?.trim();
    const role = contact?.cargo?.trim();

    if (country) {
      countriesSet.add(country);
      countryMap[country] = (countryMap[country] || 0) + 1;
    }

    if (continent) {
      continentMap[continent] = (continentMap[continent] || 0) + 1;
    }

    if (company) {
      companyMap[company] = (companyMap[company] || 0) + 1;
    }

    if (role) {
      roleMap[role] = (roleMap[role] || 0) + 1;
    }
  });

  const now = new Date();

  const upcomingMeetings = meetings.filter((meeting) => {
    if (!meeting?.fecha_inicio) return false;

    const meetingDate = new Date(meeting.fecha_inicio);
    const diffDays = (meetingDate - now) / (1000 * 60 * 60 * 24);

    return diffDays >= 0 && diffDays <= 7;
  });

  const topCompanies = Object.entries(companyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value], index) => ({
      id: index,
      label,
      value,
    }));

  const topRoles = Object.entries(roleMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([role, total]) => ({
      role,
      total,
    }));

  const topCountries = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, total]) => ({
      country,
      total,
    }));

  const continentData = Object.entries(continentMap)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value,
    }));

  return {
    totalContacts,
    totalCountries: countriesSet.size,
    totalMeetings: meetings.length,
    upcomingMeetings: upcomingMeetings.length,
    upcomingMeetingsRatio:
      meetings.length > 0
        ? Math.round((upcomingMeetings.length / meetings.length) * 100)
        : 0,
    topCompanies,
    topRoles,
    topCountries,
    continentData,
  };
}