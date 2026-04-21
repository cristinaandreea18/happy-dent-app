export const getHolidayDates = async (year) => {
  const response = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/RO`
  );
  const data = await response.json();
  return data.map((h) => h.date);
};
