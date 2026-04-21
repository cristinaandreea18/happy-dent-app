import fetch from 'node-fetch';

const getPublicHolidays = async (req, res, next) => {
  try {
    const year = parseInt(req.params.year, 10) || new Date().getFullYear();
    const response = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/RO`
    );
    const data = await response.json();

    const formatted = data.map((holiday) => ({
      id: `holiday_${holiday.date}`,
      title: holiday.localName,
      start: holiday.date,
      display: 'background',
      color: 'rgba(255, 0, 0, 0.2)',
      overlap: false,
      extendedProps: { isHoliday: true },
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error('Eroare în holidaysController:', err);
    next(err);
  }
};

export default { getPublicHolidays };
