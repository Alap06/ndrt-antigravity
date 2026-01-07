import { useState, useEffect } from 'react';
import {
    Cloud,
    Droplets,
    Wind,
    Thermometer,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    MapPin,
    Activity,
    Shield,
    Users,
    FileText,
    Radio,
    RefreshCw,
    Wifi,
    WifiOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import GouvernoratCard from '../components/Dashboard/GouvernoratCard';
import TunisiaMap from '../components/Dashboard/TunisiaMap';
import AlertsPanel from '../components/Dashboard/AlertsPanel';
import WeatherCard from '../components/Dashboard/WeatherCard';
import RiskPanel from '../components/Dashboard/RiskPanel';
import gouvernoratsData from '../data/gouvernorats.json';
import weatherMockData from '../data/weatherMock.json';
import alertsData from '../data/alertsMock.json';
import { weatherService } from '../services/weatherApi';
import { smartAlertService } from '../services/alertService';

const Dashboard = () => {
    const { language, translations } = useApp();
    const [selectedGouvernorat, setSelectedGouvernorat] = useState('bizerte');
    const [gouvernorats, setGouvernorats] = useState([]);
    const [activeAlerts, setActiveAlerts] = useState([]);
    const [realTimeAlerts, setRealTimeAlerts] = useState([]);
    const [weatherData, setWeatherData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [dataSource, setDataSource] = useState('Simulation');
    const [lastUpdate, setLastUpdate] = useState(null);

    const t = translations;

    // Load initial data
    useEffect(() => {
        setGouvernorats(gouvernoratsData.gouvernorats);
        setActiveAlerts(alertsData.active_alerts);
        loadWeatherData();
    }, [language]);

    // Load weather data from real APIs
    const loadWeatherData = async () => {
        setIsLoading(true);
        try {
            // Fetch weather for selected governorate first
            const selectedWeather = await weatherService.getWeather(selectedGouvernorat, language);
            setWeatherData(prev => ({ ...prev, [selectedGouvernorat]: selectedWeather }));
            setDataSource(weatherService.getCurrentSource());

            // Fetch remaining governorates in background
            const allWeather = await weatherService.getAllWeather(language);
            setWeatherData(allWeather);
            setLastUpdate(new Date());

            // Detect alerts from real weather data
            const detectedAlerts = smartAlertService.detectAllAlerts(
                allWeather,
                gouvernoratsData.gouvernorats,
                language
            );
            setRealTimeAlerts(detectedAlerts);

        } catch (error) {
            console.error('Error loading weather data:', error);
            // Fallback to mock data
            const mockWeather = {};
            Object.keys(weatherMockData.current_conditions).forEach(id => {
                mockWeather[id] = {
                    ...weatherMockData.current_conditions[id],
                    gouvernoratId: id,
                    source: 'Simulation',
                    isRealData: false
                };
            });
            setWeatherData(mockWeather);
            setDataSource('Simulation');
            setRealTimeAlerts([]);
        }
        setIsLoading(false);
    };

    const handleRefresh = () => {
        weatherService.clearCache();
        loadWeatherData();
    };

    // Get current weather for selected governorate
    const currentWeather = weatherData[selectedGouvernorat] || weatherMockData.current_conditions[selectedGouvernorat];
    const riskIndices = weatherData[selectedGouvernorat]
        ? weatherService.calculateRiskIndices(weatherData[selectedGouvernorat])
        : weatherMockData.risk_indices[selectedGouvernorat] || weatherMockData.risk_indices.tunis;

    // Calculate stats
    const criticalGouvernorats = gouvernorats.filter(g => g.risk === 'critique').length;
    const highRiskGouvernorats = gouvernorats.filter(g => g.risk === 'élevé').length;
    const totalAlerts = activeAlerts.length;
    const activeStations = weatherMockData.stations_status.active;
    const totalStations = weatherMockData.stations_status.total;

    // Translated labels
    const statLabels = {
        fr: {
            criticalGov: 'Gouvernorats Critiques',
            highGov: 'Gouvernorats Élevés',
            activeAlerts: 'Alertes Actives',
            activeStations: 'Stations Actives',
            sinceYesterday: 'depuis hier',
            available: 'disponibles',
            surveillance: 'Surveillance des 24 Gouvernorats',
            filter: 'Filtrer',
            refresh: 'Actualiser'
        },
        ar: {
            criticalGov: 'ولايات حرجة',
            highGov: 'ولايات عالية الخطر',
            activeAlerts: 'تنبيهات نشطة',
            activeStations: 'محطات نشطة',
            sinceYesterday: 'منذ الأمس',
            available: 'متاحة',
            surveillance: 'مراقبة 24 ولاية',
            filter: 'تصفية',
            refresh: 'تحديث'
        },
        en: {
            criticalGov: 'Critical Governorates',
            highGov: 'High Risk Governorates',
            activeAlerts: 'Active Alerts',
            activeStations: 'Active Stations',
            sinceYesterday: 'since yesterday',
            available: 'available',
            surveillance: 'Surveillance of 24 Governorates',
            filter: 'Filter',
            refresh: 'Refresh'
        }
    };

    const labels = statLabels[language] || statLabels.fr;

    const stats = [
        {
            label: labels.criticalGov,
            value: criticalGouvernorats,
            icon: AlertTriangle,
            color: 'red',
            trend: 'up',
            trendValue: `+1 ${labels.sinceYesterday}`
        },
        {
            label: labels.highGov,
            value: highRiskGouvernorats,
            icon: TrendingUp,
            color: 'orange',
            trend: 'up',
            trendValue: `+2 ${labels.sinceYesterday}`
        },
        {
            label: labels.activeAlerts,
            value: totalAlerts,
            icon: Radio,
            color: 'yellow',
            trend: 'down',
            trendValue: `-3 ${labels.sinceYesterday}`
        },
        {
            label: labels.activeStations,
            value: `${activeStations}/${totalStations}`,
            icon: Activity,
            color: 'green',
            trend: 'stable',
            trendValue: `93.5% ${labels.available}`
        },
    ];

    return (
        <div className="dashboard animate-fadeIn">
            {/* Data Source Indicator */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-md)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    {dataSource === 'Open-Meteo' || dataSource === 'WeatherAPI' || dataSource === 'OpenWeatherMap' ? (
                        <Wifi size={16} style={{ color: 'var(--alert-green)' }} />
                    ) : (
                        <WifiOff size={16} style={{ color: 'var(--alert-yellow)' }} />
                    )}
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        {language === 'ar' ? 'مصدر البيانات' : language === 'en' ? 'Data Source' : 'Source des données'}:
                        <strong style={{ marginLeft: 'var(--spacing-xs)', color: 'var(--text-primary)' }}>
                            {dataSource}
                        </strong>
                    </span>
                    {lastUpdate && (
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginLeft: 'var(--spacing-md)' }}>
                            {language === 'ar' ? 'آخر تحديث' : language === 'en' ? 'Last update' : 'Dernière MAJ'}:
                            {lastUpdate.toLocaleTimeString(language === 'ar' ? 'ar-TN' : 'fr-TN')}
                        </span>
                    )}
                </div>
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    style={{ opacity: isLoading ? 0.5 : 1 }}
                >
                    <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
                </button>
            </div>

            {/* Stats Row */}
            <div className="dashboard-grid stagger" style={{ marginBottom: 'var(--spacing-lg)' }}>
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`stat-card ${stat.color} col-span-3 animate-slideInUp`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="stat-card-header">
                            <div className="stat-card-icon">
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <div className="stat-card-value">{stat.value}</div>
                        <div className="stat-card-label">{stat.label}</div>
                        <div className={`stat-card-trend ${stat.trend}`}>
                            {stat.trend === 'up' ? <TrendingUp size={14} /> :
                                stat.trend === 'down' ? <TrendingDown size={14} /> : null}
                            <span>{stat.trendValue}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
                {/* Tunisia Map */}
                <div className="col-span-5">
                    <TunisiaMap
                        gouvernorats={gouvernorats}
                        selectedGouvernorat={selectedGouvernorat}
                        onSelectGouvernorat={setSelectedGouvernorat}
                        weatherData={weatherData}
                    />
                </div>

                {/* Weather & Risk Panel */}
                <div className="col-span-4">
                    <WeatherCard
                        weather={currentWeather}
                        gouvernorat={gouvernorats.find(g => g.id === selectedGouvernorat)}
                        isRealData={currentWeather?.isRealData}
                        source={currentWeather?.source}
                    />
                    <div style={{ marginTop: 'var(--spacing-lg)' }}>
                        <RiskPanel riskIndices={riskIndices} />
                    </div>
                </div>

                {/* Alerts Panel */}
                <div className="col-span-3">
                    <AlertsPanel alerts={activeAlerts} realTimeAlerts={realTimeAlerts} />
                </div>
            </div>

            {/* Gouvernorats Grid */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="card-header">
                    <h2 className="card-title">
                        <MapPin size={20} />
                        {labels.surveillance}
                    </h2>
                    <div className="card-actions">
                        <button className="btn btn-secondary">
                            {labels.filter}
                        </button>
                        <button className="btn btn-primary" onClick={handleRefresh} disabled={isLoading}>
                            {isLoading ? <RefreshCw size={16} className="spin" /> : labels.refresh}
                        </button>
                    </div>
                </div>
                <div className="gouvernorats-grid stagger">
                    {gouvernorats.map((gouvernorat, index) => (
                        <GouvernoratCard
                            key={gouvernorat.id}
                            gouvernorat={gouvernorat}
                            weather={weatherData[gouvernorat.id] || weatherMockData.current_conditions[gouvernorat.id]}
                            isSelected={selectedGouvernorat === gouvernorat.id}
                            onClick={() => setSelectedGouvernorat(gouvernorat.id)}
                            style={{ animationDelay: `${index * 30}ms` }}
                        />
                    ))}
                </div>
            </div>

            {/* Developer Credit */}
            <div style={{
                marginTop: 'var(--spacing-xl)',
                padding: 'var(--spacing-lg)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-md)'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'var(--gradient-primary)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: 'var(--font-size-lg)'
                    }}>
                        AA
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            fontSize: 'var(--font-size-base)'
                        }}>
                            Ala Amara
                        </div>
                        <div style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--primary)',
                            fontWeight: 500
                        }}>
                            Membre Actif NDRT
                        </div>
                    </div>
                </div>
                <div style={{
                    marginTop: 'var(--spacing-sm)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-muted)'
                }}>
                    Croissant Rouge Tunisien - Équipe Nationale d'Intervention Rapide
                </div>
            </div>

            <style>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
