import {
    Thermometer,
    Droplets,
    Wind,
    Eye,
    Gauge,
    Cloud,
    CloudRain,
    CloudLightning,
    Sun,
    CloudSun
} from 'lucide-react';

const getWeatherIcon = (code) => {
    if (!code) return <CloudSun size={60} />;
    if (code >= 200 && code < 300) return <CloudLightning size={60} />;
    if (code >= 300 && code < 600) return <CloudRain size={60} />;
    if (code >= 800 && code < 802) return <Sun size={60} />;
    return <Cloud size={60} />;
};

const WeatherCard = ({ weather, gouvernorat }) => {
    if (!weather) {
        return (
            <div className="weather-current">
                <div className="weather-location">
                    <h2>Sélectionnez un gouvernorat</h2>
                    <span>Cliquez sur la carte pour voir les conditions météo</span>
                </div>
            </div>
        );
    }

    return (
        <div className="weather-current animate-scaleIn">
            <div className="weather-location">
                <h2>{weather.gouvernorat}</h2>
                <span>
                    Dernière mise à jour: {new Date(weather.timestamp).toLocaleTimeString('fr-TN')}
                </span>
            </div>

            <div className="weather-main">
                <div className="weather-temp">
                    {weather.temperature}<sup>°C</sup>
                </div>
                <div className="weather-icon" style={{
                    color: weather.weather_code >= 500 ? 'var(--alert-orange)' : 'var(--alert-yellow)'
                }}>
                    {getWeatherIcon(weather.weather_code)}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontSize: 'var(--font-size-lg)',
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--spacing-xs)'
                    }}>
                        {weather.weather_description}
                    </div>
                    <div style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-muted)'
                    }}>
                        Ressenti: {weather.feels_like}°C
                    </div>
                </div>
            </div>

            <div className="weather-details">
                <div className="weather-detail">
                    <Droplets className="weather-detail-icon" />
                    <div className="weather-detail-value">{weather.humidity}%</div>
                    <div className="weather-detail-label">Humidité</div>
                </div>
                <div className="weather-detail">
                    <Wind className="weather-detail-icon" />
                    <div className="weather-detail-value">{weather.wind_speed} km/h</div>
                    <div className="weather-detail-label">{weather.wind_direction}</div>
                </div>
                <div className="weather-detail">
                    <CloudRain className="weather-detail-icon" />
                    <div className="weather-detail-value">{weather.precipitation} mm</div>
                    <div className="weather-detail-label">Précip. 24h</div>
                </div>
                <div className="weather-detail">
                    <Gauge className="weather-detail-icon" />
                    <div className="weather-detail-value">{weather.pressure} hPa</div>
                    <div className="weather-detail-label">Pression</div>
                </div>
            </div>

            {/* Additional Info */}
            <div style={{
                marginTop: 'var(--spacing-lg)',
                paddingTop: 'var(--spacing-md)',
                borderTop: '1px solid var(--border)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--spacing-md)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Visibilité</div>
                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {weather.visibility} km
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Indice UV</div>
                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {weather.uv_index}
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Rafales</div>
                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {weather.wind_gusts} km/h
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherCard;
