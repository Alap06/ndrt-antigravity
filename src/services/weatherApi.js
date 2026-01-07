// Multi-Source Weather API Service
// Integrates: Open-Meteo (primary), WeatherAPI (secondary), OpenWeatherMap (fallback)
// With caching and fallback support

// API Keys - Users can configure these
const API_CONFIG = {
    weatherApi: {
        key: '', // Get free key at https://www.weatherapi.com/
        enabled: false
    },
    openWeatherMap: {
        key: '', // Get free key at https://openweathermap.org/api
        enabled: false
    }
};

// Tunisian Governorates with coordinates
export const GOVERNORATES = {
    'tunis': { lat: 36.8065, lon: 10.1815, name: 'Tunis', nameAr: 'تونس', nameEn: 'Tunis' },
    'ariana': { lat: 36.8663, lon: 10.1647, name: 'Ariana', nameAr: 'أريانة', nameEn: 'Ariana' },
    'ben-arous': { lat: 36.7533, lon: 10.2283, name: 'Ben Arous', nameAr: 'بن عروس', nameEn: 'Ben Arous' },
    'manouba': { lat: 36.8101, lon: 9.8614, name: 'Manouba', nameAr: 'منوبة', nameEn: 'Manouba' },
    'nabeul': { lat: 36.4513, lon: 10.7357, name: 'Nabeul', nameAr: 'نابل', nameEn: 'Nabeul' },
    'zaghouan': { lat: 36.4028, lon: 10.1428, name: 'Zaghouan', nameAr: 'زغوان', nameEn: 'Zaghouan' },
    'bizerte': { lat: 37.2744, lon: 9.8739, name: 'Bizerte', nameAr: 'بنزرت', nameEn: 'Bizerte' },
    'beja': { lat: 36.7256, lon: 9.1817, name: 'Béja', nameAr: 'باجة', nameEn: 'Beja' },
    'jendouba': { lat: 36.5011, lon: 8.7803, name: 'Jendouba', nameAr: 'جندوبة', nameEn: 'Jendouba' },
    'kef': { lat: 36.1743, lon: 8.7049, name: 'Le Kef', nameAr: 'الكاف', nameEn: 'Kef' },
    'siliana': { lat: 36.0849, lon: 9.3708, name: 'Siliana', nameAr: 'سليانة', nameEn: 'Siliana' },
    'sousse': { lat: 35.8254, lon: 10.6360, name: 'Sousse', nameAr: 'سوسة', nameEn: 'Sousse' },
    'monastir': { lat: 35.7643, lon: 10.8113, name: 'Monastir', nameAr: 'المنستير', nameEn: 'Monastir' },
    'mahdia': { lat: 35.5047, lon: 11.0622, name: 'Mahdia', nameAr: 'المهدية', nameEn: 'Mahdia' },
    'sfax': { lat: 34.7406, lon: 10.7603, name: 'Sfax', nameAr: 'صفاقس', nameEn: 'Sfax' },
    'kairouan': { lat: 35.6781, lon: 10.0963, name: 'Kairouan', nameAr: 'القيروان', nameEn: 'Kairouan' },
    'kasserine': { lat: 35.1676, lon: 8.8304, name: 'Kasserine', nameAr: 'القصرين', nameEn: 'Kasserine' },
    'sidi-bouzid': { lat: 35.0354, lon: 9.4839, name: 'Sidi Bouzid', nameAr: 'سيدي بوزيد', nameEn: 'Sidi Bouzid' },
    'gabes': { lat: 33.8815, lon: 10.0982, name: 'Gabès', nameAr: 'قابس', nameEn: 'Gabes' },
    'medenine': { lat: 33.3399, lon: 10.5055, name: 'Médenine', nameAr: 'مدنين', nameEn: 'Medenine' },
    'tataouine': { lat: 32.9297, lon: 10.4518, name: 'Tataouine', nameAr: 'تطاوين', nameEn: 'Tataouine' },
    'gafsa': { lat: 34.4311, lon: 8.7757, name: 'Gafsa', nameAr: 'قفصة', nameEn: 'Gafsa' },
    'tozeur': { lat: 33.9197, lon: 8.1339, name: 'Tozeur', nameAr: 'توزر', nameEn: 'Tozeur' },
    'kebili': { lat: 33.7044, lon: 8.9650, name: 'Kébili', nameAr: 'قبلي', nameEn: 'Kebili' }
};

// Weather codes mapping for all languages
const WEATHER_CODES = {
    0: { fr: 'Ciel dégagé', ar: 'سماء صافية', en: 'Clear sky', icon: '☀️' },
    1: { fr: 'Principalement dégagé', ar: 'صافي جزئياً', en: 'Mainly clear', icon: '🌤️' },
    2: { fr: 'Partiellement nuageux', ar: 'غائم جزئياً', en: 'Partly cloudy', icon: '⛅' },
    3: { fr: 'Couvert', ar: 'غائم', en: 'Overcast', icon: '☁️' },
    45: { fr: 'Brouillard', ar: 'ضباب', en: 'Fog', icon: '🌫️' },
    48: { fr: 'Brouillard givrant', ar: 'ضباب متجمد', en: 'Rime fog', icon: '🌫️' },
    51: { fr: 'Bruine légère', ar: 'رذاذ خفيف', en: 'Light drizzle', icon: '🌧️' },
    53: { fr: 'Bruine modérée', ar: 'رذاذ معتدل', en: 'Moderate drizzle', icon: '🌧️' },
    55: { fr: 'Bruine dense', ar: 'رذاذ كثيف', en: 'Dense drizzle', icon: '🌧️' },
    61: { fr: 'Pluie légère', ar: 'أمطار خفيفة', en: 'Light rain', icon: '🌧️' },
    63: { fr: 'Pluie modérée', ar: 'أمطار معتدلة', en: 'Moderate rain', icon: '🌧️' },
    65: { fr: 'Pluie forte', ar: 'أمطار غزيرة', en: 'Heavy rain', icon: '🌧️' },
    71: { fr: 'Neige légère', ar: 'ثلوج خفيفة', en: 'Light snow', icon: '🌨️' },
    73: { fr: 'Neige modérée', ar: 'ثلوج معتدلة', en: 'Moderate snow', icon: '🌨️' },
    75: { fr: 'Neige forte', ar: 'ثلوج كثيفة', en: 'Heavy snow', icon: '❄️' },
    80: { fr: 'Averses légères', ar: 'زخات خفيفة', en: 'Light showers', icon: '🌦️' },
    81: { fr: 'Averses modérées', ar: 'زخات معتدلة', en: 'Moderate showers', icon: '🌦️' },
    82: { fr: 'Averses violentes', ar: 'زخات عنيفة', en: 'Violent showers', icon: '⛈️' },
    95: { fr: 'Orage', ar: 'عاصفة رعدية', en: 'Thunderstorm', icon: '⛈️' },
    96: { fr: 'Orage avec grêle légère', ar: 'رعد مع برد خفيف', en: 'Thunderstorm with hail', icon: '⛈️' },
    99: { fr: 'Orage avec grêle forte', ar: 'رعد مع برد قوي', en: 'Severe thunderstorm', icon: '⛈️' }
};

// Cache for weather data
const weatherCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

class MultiSourceWeatherService {
    constructor() {
        this.sources = ['open-meteo', 'weatherapi', 'openweathermap'];
        this.currentSource = null;
        this.lastFetchTime = {};
    }

    // Configure API keys
    setApiKey(service, key) {
        if (API_CONFIG[service]) {
            API_CONFIG[service].key = key;
            API_CONFIG[service].enabled = !!key;
        }
    }

    // Get governorate name by language
    getGovernorateName(id, lang = 'fr') {
        const gov = GOVERNORATES[id];
        if (!gov) return id;
        if (lang === 'ar') return gov.nameAr;
        if (lang === 'en') return gov.nameEn;
        return gov.name;
    }

    // Get weather description by code
    getWeatherDescription(code, lang = 'fr') {
        const weather = WEATHER_CODES[code] || WEATHER_CODES[1];
        return weather[lang] || weather.fr;
    }

    // Get weather icon by code
    getWeatherIcon(code) {
        return WEATHER_CODES[code]?.icon || '🌤️';
    }

    // Check cache
    getCached(governorateId) {
        const cached = weatherCache.get(governorateId);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }
        return null;
    }

    // Set cache
    setCache(governorateId, data) {
        weatherCache.set(governorateId, {
            data,
            timestamp: Date.now()
        });
    }

    // Main fetch method with fallback
    async getWeather(governorateId, lang = 'fr') {
        const gov = GOVERNORATES[governorateId];
        if (!gov) {
            throw new Error(`Unknown governorate: ${governorateId}`);
        }

        // Check cache first
        const cached = this.getCached(governorateId);
        if (cached) {
            return { ...cached, fromCache: true };
        }

        // Try each source with fallback
        const errors = [];

        // 1. Try Open-Meteo (primary - no API key needed)
        try {
            const data = await this.fetchOpenMeteo(gov, lang);
            this.currentSource = 'Open-Meteo';
            this.setCache(governorateId, data);
            return data;
        } catch (error) {
            errors.push(`Open-Meteo: ${error.message}`);
        }

        // 2. Try WeatherAPI (if configured)
        if (API_CONFIG.weatherApi.enabled) {
            try {
                const data = await this.fetchWeatherAPI(gov, lang);
                this.currentSource = 'WeatherAPI';
                this.setCache(governorateId, data);
                return data;
            } catch (error) {
                errors.push(`WeatherAPI: ${error.message}`);
            }
        }

        // 3. Try OpenWeatherMap (if configured)
        if (API_CONFIG.openWeatherMap.enabled) {
            try {
                const data = await this.fetchOpenWeatherMap(gov, lang);
                this.currentSource = 'OpenWeatherMap';
                this.setCache(governorateId, data);
                return data;
            } catch (error) {
                errors.push(`OpenWeatherMap: ${error.message}`);
            }
        }

        // 4. Fallback to mock data
        console.warn('All API sources failed, using mock data:', errors);
        this.currentSource = 'Simulation';
        const mockData = this.getMockWeather(governorateId, lang);
        this.setCache(governorateId, mockData);
        return mockData;
    }

    // Open-Meteo API (FREE, no key required)
    async fetchOpenMeteo(gov, lang) {
        const url = new URL('https://api.open-meteo.com/v1/forecast');
        url.searchParams.append('latitude', gov.lat);
        url.searchParams.append('longitude', gov.lon);
        url.searchParams.append('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure,visibility,uv_index');
        url.searchParams.append('hourly', 'temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m');
        url.searchParams.append('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max');
        url.searchParams.append('timezone', 'Africa/Tunis');
        url.searchParams.append('forecast_days', '7');

        const response = await fetch(url.toString(), { timeout: 5000 });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const current = data.current;

        return {
            gouvernoratId: Object.keys(GOVERNORATES).find(k => GOVERNORATES[k].lat === gov.lat),
            gouvernorat: this.getGovernorateName(Object.keys(GOVERNORATES).find(k => GOVERNORATES[k].lat === gov.lat), lang),
            timestamp: new Date().toISOString(),
            source: 'Open-Meteo',
            isRealData: true,

            // Current conditions
            temperature: Math.round(current.temperature_2m),
            feels_like: Math.round(current.apparent_temperature),
            humidity: current.relative_humidity_2m,
            pressure: Math.round(current.surface_pressure),
            precipitation: current.precipitation || 0,
            wind_speed: Math.round(current.wind_speed_10m),
            wind_direction: this.degreesToDirection(current.wind_direction_10m, lang),
            wind_gusts: Math.round(current.wind_gusts_10m || 0),
            visibility: Math.round((current.visibility || 10000) / 1000),
            uv_index: current.uv_index || 0,
            weather_code: current.weather_code,
            weather_description: this.getWeatherDescription(current.weather_code, lang),
            weather_icon: this.getWeatherIcon(current.weather_code),

            // Forecast
            hourly: data.hourly ? this.formatHourlyForecast(data.hourly, lang) : [],
            daily: data.daily ? this.formatDailyForecast(data.daily, lang) : []
        };
    }

    // WeatherAPI.com
    async fetchWeatherAPI(gov, lang) {
        const langMap = { fr: 'fr', ar: 'ar', en: 'en' };
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_CONFIG.weatherApi.key}&q=${gov.lat},${gov.lon}&days=7&aqi=yes&lang=${langMap[lang] || 'fr'}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const current = data.current;

        return {
            gouvernoratId: Object.keys(GOVERNORATES).find(k => GOVERNORATES[k].lat === gov.lat),
            gouvernorat: this.getGovernorateName(Object.keys(GOVERNORATES).find(k => GOVERNORATES[k].lat === gov.lat), lang),
            timestamp: new Date().toISOString(),
            source: 'WeatherAPI',
            isRealData: true,

            temperature: Math.round(current.temp_c),
            feels_like: Math.round(current.feelslike_c),
            humidity: current.humidity,
            pressure: Math.round(current.pressure_mb),
            precipitation: current.precip_mm || 0,
            wind_speed: Math.round(current.wind_kph),
            wind_direction: current.wind_dir,
            wind_gusts: Math.round(current.gust_kph || 0),
            visibility: Math.round(current.vis_km),
            uv_index: current.uv || 0,
            weather_code: current.condition.code,
            weather_description: current.condition.text,
            weather_icon: current.condition.icon,

            // Air quality
            air_quality: current.air_quality ? {
                pm2_5: current.air_quality.pm2_5,
                pm10: current.air_quality.pm10,
                co: current.air_quality.co
            } : null,

            hourly: [],
            daily: data.forecast?.forecastday?.map(day => ({
                date: day.date,
                temp_max: Math.round(day.day.maxtemp_c),
                temp_min: Math.round(day.day.mintemp_c),
                precipitation: day.day.totalprecip_mm,
                weather_description: day.day.condition.text
            })) || []
        };
    }

    // OpenWeatherMap API
    async fetchOpenWeatherMap(gov, lang) {
        const langMap = { fr: 'fr', ar: 'ar', en: 'en' };
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${gov.lat}&lon=${gov.lon}&appid=${API_CONFIG.openWeatherMap.key}&units=metric&lang=${langMap[lang] || 'fr'}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        return {
            gouvernoratId: Object.keys(GOVERNORATES).find(k => GOVERNORATES[k].lat === gov.lat),
            gouvernorat: this.getGovernorateName(Object.keys(GOVERNORATES).find(k => GOVERNORATES[k].lat === gov.lat), lang),
            timestamp: new Date().toISOString(),
            source: 'OpenWeatherMap',
            isRealData: true,

            temperature: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            precipitation: data.rain?.['1h'] || 0,
            wind_speed: Math.round(data.wind.speed * 3.6),
            wind_direction: this.degreesToDirection(data.wind.deg, lang),
            wind_gusts: Math.round((data.wind.gust || 0) * 3.6),
            visibility: Math.round((data.visibility || 10000) / 1000),
            uv_index: 0,
            weather_code: data.weather[0]?.id || 800,
            weather_description: data.weather[0]?.description || '',
            weather_icon: `https://openweathermap.org/img/wn/${data.weather[0]?.icon}@2x.png`,

            hourly: [],
            daily: []
        };
    }

    // Format hourly forecast
    formatHourlyForecast(hourly, lang) {
        const now = new Date();
        const result = [];

        for (let i = 0; i < Math.min(24, hourly.time.length); i++) {
            const time = new Date(hourly.time[i]);
            if (time >= now) {
                result.push({
                    time: time.toLocaleTimeString(lang === 'ar' ? 'ar-TN' : 'fr-TN', { hour: '2-digit', minute: '2-digit' }),
                    temperature: Math.round(hourly.temperature_2m[i]),
                    precipitation: hourly.precipitation[i] || 0,
                    precipitation_probability: hourly.precipitation_probability?.[i] || 0,
                    weather_code: hourly.weather_code[i],
                    weather_icon: this.getWeatherIcon(hourly.weather_code[i]),
                    wind_speed: Math.round(hourly.wind_speed_10m[i])
                });
            }
            if (result.length >= 8) break;
        }

        return result;
    }

    // Format daily forecast
    formatDailyForecast(daily, lang) {
        return daily.time.map((date, i) => ({
            date: new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-TN' : 'fr-TN', { weekday: 'short', day: 'numeric' }),
            temp_max: Math.round(daily.temperature_2m_max[i]),
            temp_min: Math.round(daily.temperature_2m_min[i]),
            precipitation: daily.precipitation_sum[i] || 0,
            wind_speed: Math.round(daily.wind_speed_10m_max[i]),
            weather_code: daily.weather_code[i],
            weather_icon: this.getWeatherIcon(daily.weather_code[i]),
            weather_description: this.getWeatherDescription(daily.weather_code[i], lang)
        }));
    }

    // Convert degrees to direction
    degreesToDirection(degrees, lang) {
        const directions = {
            fr: ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'],
            ar: ['ش', 'شر', 'ر', 'جر', 'ج', 'جغ', 'غ', 'شغ'],
            en: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
        };
        const index = Math.round(degrees / 45) % 8;
        return (directions[lang] || directions.fr)[index];
    }

    // Get all governorates weather
    async getAllWeather(lang = 'fr') {
        const results = {};
        const promises = Object.keys(GOVERNORATES).map(async (id) => {
            try {
                results[id] = await this.getWeather(id, lang);
            } catch (error) {
                console.error(`Error fetching ${id}:`, error);
                results[id] = this.getMockWeather(id, lang);
            }
        });

        await Promise.all(promises);
        return results;
    }

    // Calculate risk indices
    calculateRiskIndices(weather) {
        const floodRisk = Math.min(100, Math.round(
            (weather.precipitation * 3) +
            (weather.humidity > 85 ? 25 : weather.humidity > 70 ? 10 : 0)
        ));

        const stormRisk = Math.min(100, Math.round(
            (weather.wind_speed > 50 ? 60 : weather.wind_speed > 30 ? 35 : weather.wind_speed > 20 ? 15 : 0) +
            ([95, 96, 99].includes(weather.weather_code) ? 40 : 0)
        ));

        const heatwaveRisk = Math.min(100, Math.round(
            Math.max(0, (weather.temperature - 38) * 15)
        ));

        const agriculturalRisk = Math.min(100, Math.round(
            (floodRisk * 0.4) + (stormRisk * 0.3) + (heatwaveRisk * 0.3)
        ));

        const maxRisk = Math.max(floodRisk, stormRisk, heatwaveRisk);
        let alertLevel = 'vert';
        if (maxRisk >= 75) alertLevel = 'rouge';
        else if (maxRisk >= 50) alertLevel = 'orange';
        else if (maxRisk >= 30) alertLevel = 'jaune';

        return {
            flood_risk: floodRisk,
            storm_risk: stormRisk,
            heatwave_risk: heatwaveRisk,
            agricultural_risk: agriculturalRisk,
            overall_alert_level: alertLevel
        };
    }

    // Mock weather data for fallback
    getMockWeather(governorateId, lang) {
        const gov = GOVERNORATES[governorateId];
        const mockData = {
            'bizerte': { temp: 14, humidity: 82, precip: 35, wind: 38, code: 63 },
            'kasserine': { temp: 9, humidity: 88, precip: 28, wind: 32, code: 65 },
            'tunis': { temp: 16, humidity: 68, precip: 8, wind: 22, code: 2 },
            'jendouba': { temp: 11, humidity: 80, precip: 22, wind: 28, code: 61 },
            'zaghouan': { temp: 12, humidity: 84, precip: 25, wind: 30, code: 63 },
            'kairouan': { temp: 15, humidity: 70, precip: 12, wind: 25, code: 61 },
            'sfax': { temp: 19, humidity: 52, precip: 0, wind: 18, code: 1 },
            'sousse': { temp: 18, humidity: 58, precip: 2, wind: 20, code: 2 },
            'gabes': { temp: 20, humidity: 48, precip: 0, wind: 15, code: 0 },
            'tozeur': { temp: 22, humidity: 35, precip: 0, wind: 12, code: 0 },
            'medenine': { temp: 21, humidity: 42, precip: 0, wind: 14, code: 1 }
        };

        const data = mockData[governorateId] || { temp: 17, humidity: 60, precip: 5, wind: 18, code: 2 };

        return {
            gouvernoratId: governorateId,
            gouvernorat: this.getGovernorateName(governorateId, lang),
            timestamp: new Date().toISOString(),
            source: 'Simulation',
            isRealData: false,

            temperature: data.temp,
            feels_like: data.temp - 2,
            humidity: data.humidity,
            pressure: 1015,
            precipitation: data.precip,
            wind_speed: data.wind,
            wind_direction: 'NW',
            wind_gusts: data.wind + 12,
            visibility: data.precip > 15 ? 6 : 10,
            uv_index: data.precip > 0 ? 2 : 5,
            weather_code: data.code,
            weather_description: this.getWeatherDescription(data.code, lang),
            weather_icon: this.getWeatherIcon(data.code),

            hourly: [],
            daily: []
        };
    }

    // Get current data source
    getCurrentSource() {
        return this.currentSource || 'N/A';
    }

    // Clear cache
    clearCache() {
        weatherCache.clear();
    }
}

// Export singleton instance
export const weatherService = new MultiSourceWeatherService();
export { WEATHER_CODES };
export default weatherService;
