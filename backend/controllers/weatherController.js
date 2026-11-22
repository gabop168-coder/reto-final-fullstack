const axios = require('axios');

// GET /api/weather?lat=20.6597&lon=-103.3496
const getWeather = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat) || 20.6597;
    const lon = parseFloat(req.query.lon) || -103.3496;

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ message: 'Coordenadas inválidas.' });
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const response = await axios.get(url, { timeout: 5000 });

    if (!response.data || !response.data.current_weather) {
      return res.status(502).json({ message: 'No se pudo obtener el clima desde el servicio externo.' });
    }

    const { temperature, windspeed, weathercode, time } = response.data.current_weather;

    res.json({
      location: { lat, lon },
      temperature,
      unit: '°C',
      windspeed,
      weathercode,
      time
    });
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.response) {
      return res.status(502).json({ message: 'Error al comunicarse con la API externa de clima.' });
    }
    next(error);
  }
};

module.exports = { getWeather };