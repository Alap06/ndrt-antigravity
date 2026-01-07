import { useState, useEffect } from 'react';
import { Map, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GOVERNORATES } from '../../services/weatherApi';

const TunisiaMap = ({ gouvernorats, selectedGouvernorat, onSelectGouvernorat, weatherData }) => {
    const { language, translations } = useApp();
    const [hoveredGouvernorat, setHoveredGouvernorat] = useState(null);
    const [showLabels, setShowLabels] = useState(true);

    const t = translations;

    const getRiskColor = (risk) => {
        const colors = {
            'faible': '#10B981',
            'modéré': '#F59E0B',
            'élevé': '#F97316',
            'critique': '#EF4444'
        };
        return colors[risk] || '#6B7280';
    };

    const getRiskLabel = (risk) => {
        const labels = {
            fr: { 'faible': 'Faible', 'modéré': 'Modéré', 'élevé': 'Élevé', 'critique': 'Critique' },
            ar: { 'faible': 'منخفض', 'modéré': 'معتدل', 'élevé': 'مرتفع', 'critique': 'حرج' },
            en: { 'faible': 'Low', 'modéré': 'Moderate', 'élevé': 'High', 'critique': 'Critical' }
        };
        return labels[language]?.[risk] || risk;
    };

    const getGouvernoratRisk = (id) => {
        const gouvernorat = gouvernorats.find(g => g.id === id);
        return gouvernorat?.risk || 'faible';
    };

    const getGouvernoratName = (id) => {
        const gov = GOVERNORATES[id];
        if (!gov) {
            const found = gouvernorats.find(g => g.id === id);
            return found?.name || id;
        }
        if (language === 'ar') return gov.nameAr;
        if (language === 'en') return gov.nameEn;
        return gov.name;
    };

    // City positions on the map for labels
    const cityPositions = {
        'tunis': { x: 175, y: 90, major: true },
        'bizerte': { x: 155, y: 45, major: true },
        'ariana': { x: 150, y: 78, major: false },
        'ben-arous': { x: 175, y: 115, major: false },
        'manouba': { x: 130, y: 85, major: false },
        'nabeul': { x: 205, y: 120, major: true },
        'zaghouan': { x: 155, y: 135, major: false },
        'beja': { x: 108, y: 80, major: true },
        'jendouba': { x: 70, y: 70, major: true },
        'kef': { x: 80, y: 120, major: true },
        'siliana': { x: 118, y: 130, major: false },
        'sousse': { x: 195, y: 170, major: true },
        'monastir': { x: 210, y: 208, major: false },
        'mahdia': { x: 195, y: 240, major: true },
        'sfax': { x: 185, y: 290, major: true },
        'kairouan': { x: 150, y: 175, major: true },
        'kasserine': { x: 90, y: 180, major: true },
        'sidi-bouzid': { x: 125, y: 235, major: true },
        'gabes': { x: 175, y: 345, major: true },
        'medenine': { x: 195, y: 415, major: true },
        'tataouine': { x: 175, y: 470, major: true },
        'gafsa': { x: 70, y: 245, major: true },
        'tozeur': { x: 55, y: 305, major: true },
        'kebili': { x: 105, y: 340, major: true }
    };

    // SVG paths for each governorat
    const gouvernoratPaths = {
        'bizerte': 'M 150 20 L 180 25 L 195 45 L 185 70 L 160 75 L 140 60 L 135 35 Z',
        'tunis': 'M 175 75 L 195 80 L 200 100 L 185 110 L 165 100 L 160 85 Z',
        'ariana': 'M 160 75 L 175 75 L 170 95 L 155 90 L 150 80 Z',
        'ben-arous': 'M 170 100 L 190 105 L 195 125 L 175 130 L 160 115 Z',
        'manouba': 'M 140 75 L 160 80 L 155 100 L 140 105 L 125 90 Z',
        'nabeul': 'M 195 90 L 220 95 L 230 130 L 215 150 L 195 140 L 185 110 Z',
        'zaghouan': 'M 160 115 L 185 120 L 190 145 L 170 155 L 150 140 L 145 120 Z',
        'beja': 'M 110 60 L 140 65 L 145 90 L 130 110 L 100 100 L 95 75 Z',
        'jendouba': 'M 70 50 L 110 55 L 105 85 L 80 95 L 55 80 L 60 55 Z',
        'kef': 'M 80 95 L 110 100 L 115 130 L 95 145 L 70 130 L 65 105 Z',
        'siliana': 'M 115 105 L 145 110 L 150 140 L 130 155 L 105 145 L 100 115 Z',
        'sousse': 'M 190 150 L 215 155 L 220 185 L 200 195 L 180 180 L 175 160 Z',
        'monastir': 'M 200 195 L 225 200 L 228 215 L 210 225 L 195 210 Z',
        'mahdia': 'M 195 215 L 215 220 L 220 250 L 200 265 L 180 250 L 178 225 Z',
        'sfax': 'M 180 260 L 210 265 L 220 310 L 195 330 L 165 310 L 160 275 Z',
        'kairouan': 'M 145 145 L 175 150 L 180 190 L 160 210 L 130 195 L 125 160 Z',
        'kasserine': 'M 90 145 L 125 150 L 130 195 L 105 220 L 75 200 L 70 160 Z',
        'sidi-bouzid': 'M 125 200 L 160 205 L 165 255 L 140 275 L 110 255 L 105 215 Z',
        'gabes': 'M 165 310 L 200 315 L 210 355 L 185 375 L 155 355 L 150 325 Z',
        'medenine': 'M 185 375 L 220 380 L 235 430 L 205 455 L 170 430 L 165 390 Z',
        'tataouine': 'M 170 430 L 210 435 L 225 500 L 190 530 L 150 500 L 145 450 Z',
        'gafsa': 'M 70 205 L 110 210 L 120 260 L 95 285 L 55 265 L 50 225 Z',
        'tozeur': 'M 45 270 L 80 275 L 90 320 L 65 345 L 35 325 L 30 285 Z',
        'kebili': 'M 95 290 L 140 295 L 150 360 L 120 390 L 80 365 L 75 310 Z'
    };

    const hoveredData = gouvernorats.find(g => g.id === hoveredGouvernorat);
    const hoveredWeather = weatherData?.[hoveredGouvernorat];

    const mapTitle = {
        fr: 'Carte de la Tunisie',
        ar: 'خريطة تونس',
        en: 'Tunisia Map'
    };

    const legendLabels = {
        fr: { low: 'Faible', moderate: 'Modéré', high: 'Élevé', critical: 'Critique' },
        ar: { low: 'منخفض', moderate: 'معتدل', high: 'مرتفع', critical: 'حرج' },
        en: { low: 'Low', moderate: 'Moderate', high: 'High', critical: 'Critical' }
    };

    const labels = legendLabels[language] || legendLabels.fr;

    return (
        <div className="tunisia-map-container animate-scaleIn">
            <div className="tunisia-map-header">
                <h3 style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)',
                    color: 'var(--text-primary)',
                    fontWeight: 600
                }}>
                    <Map size={20} style={{ color: 'var(--primary)' }} />
                    {mapTitle[language] || mapTitle.fr}
                </h3>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => setShowLabels(!showLabels)}
                        title={showLabels ? 'Hide labels' : 'Show labels'}
                        style={{ opacity: showLabels ? 1 : 0.5 }}
                    >
                        {showLabels ? 'Aa' : 'Aa'}
                    </button>
                    <button className="btn btn-ghost btn-icon">
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            <div className="tunisia-map" style={{ position: 'relative' }}>
                <svg
                    viewBox="0 0 260 550"
                    style={{ width: '100%', maxWidth: '320px', height: 'auto' }}
                >
                    {/* Gradient and filter definitions */}
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <filter id="shadow">
                            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3" />
                        </filter>
                    </defs>

                    {/* Render governorate paths */}
                    {Object.entries(gouvernoratPaths).map(([id, path]) => {
                        const risk = getGouvernoratRisk(id);
                        const isSelected = selectedGouvernorat === id;
                        const isHovered = hoveredGouvernorat === id;

                        return (
                            <path
                                key={id}
                                d={path}
                                fill={getRiskColor(risk)}
                                fillOpacity={isSelected ? 0.9 : isHovered ? 0.75 : 0.55}
                                stroke={isSelected ? 'var(--primary)' : isHovered ? '#fff' : 'var(--border)'}
                                strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    filter: isSelected ? 'url(#glow)' : 'none'
                                }}
                                onClick={() => onSelectGouvernorat(id)}
                                onMouseEnter={() => setHoveredGouvernorat(id)}
                                onMouseLeave={() => setHoveredGouvernorat(null)}
                            />
                        );
                    })}

                    {/* City labels */}
                    {showLabels && Object.entries(cityPositions).map(([id, pos]) => {
                        const isSelected = selectedGouvernorat === id;
                        const isHovered = hoveredGouvernorat === id;
                        const name = getGouvernoratName(id);

                        return (
                            <g key={`label-${id}`}>
                                {/* City dot */}
                                <circle
                                    cx={pos.x}
                                    cy={pos.y - 5}
                                    r={pos.major ? 3 : 2}
                                    fill={isSelected ? 'var(--primary)' : isHovered ? '#fff' : 'var(--text-primary)'}
                                    style={{ transition: 'all 0.2s' }}
                                />
                                {/* City name */}
                                <text
                                    x={pos.x}
                                    y={pos.y + 5}
                                    fill={isSelected ? 'var(--primary)' : 'var(--text-primary)'}
                                    fontSize={pos.major ? (language === 'ar' ? 7 : 8) : (language === 'ar' ? 6 : 7)}
                                    fontWeight={pos.major || isSelected ? 600 : 400}
                                    textAnchor="middle"
                                    style={{
                                        filter: 'url(#shadow)',
                                        transition: 'all 0.2s',
                                        direction: language === 'ar' ? 'rtl' : 'ltr'
                                    }}
                                >
                                    {name}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Tooltip with weather data */}
                {hoveredData && (
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 10,
                        minWidth: '180px'
                    }}>
                        <div style={{
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 'var(--spacing-xs)'
                        }}>
                            <span>{getGouvernoratName(hoveredData.id)}</span>
                            {hoveredWeather && (
                                <span style={{ fontSize: 'var(--font-size-lg)' }}>
                                    {hoveredWeather.weather_icon || '🌤️'}
                                </span>
                            )}
                        </div>
                        <div style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{language === 'ar' ? 'الخطر' : language === 'en' ? 'Risk' : 'Risque'}:</span>
                                <span style={{ color: getRiskColor(hoveredData.risk), fontWeight: 500 }}>
                                    {getRiskLabel(hoveredData.risk)}
                                </span>
                            </div>
                            {hoveredWeather && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{language === 'ar' ? 'الحرارة' : language === 'en' ? 'Temp' : 'Temp'}:</span>
                                        <span style={{ fontWeight: 500 }}>{hoveredWeather.temperature}°C</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{language === 'ar' ? 'الرياح' : language === 'en' ? 'Wind' : 'Vent'}:</span>
                                        <span>{hoveredWeather.wind_speed} km/h</span>
                                    </div>
                                </>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{language === 'ar' ? 'تنبيهات' : language === 'en' ? 'Alerts' : 'Alertes'}:</span>
                                <span style={{ color: hoveredData.alerts > 0 ? 'var(--alert-orange)' : 'inherit' }}>
                                    {hoveredData.alerts}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="map-legend">
                <div className="legend-item">
                    <div className="legend-color green" />
                    <span>{labels.low}</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color yellow" />
                    <span>{labels.moderate}</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color orange" />
                    <span>{labels.high}</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color red" />
                    <span>{labels.critical}</span>
                </div>
            </div>
        </div>
    );
};

export default TunisiaMap;
