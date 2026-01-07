import { useState, useEffect } from 'react';
import {
    Radar,
    RefreshCw,
    Filter,
    Download,
    MapPin,
    Thermometer,
    Droplets,
    Wind,
    Eye,
    Clock,
    Activity
} from 'lucide-react';
import gouvernoratsData from '../data/gouvernorats.json';
import weatherData from '../data/weatherMock.json';

const Surveillance = () => {
    const [gouvernorats, setGouvernorats] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [sortBy, setSortBy] = useState('risk');

    useEffect(() => {
        setGouvernorats(gouvernoratsData.gouvernorats);
    }, []);

    const regions = Object.keys(gouvernoratsData.regions);

    const filteredGouvernorats = gouvernorats.filter(g => {
        if (selectedRegion === 'all') return true;
        return gouvernoratsData.regions[selectedRegion]?.includes(g.id);
    });

    const sortedGouvernorats = [...filteredGouvernorats].sort((a, b) => {
        if (sortBy === 'risk') {
            const riskOrder = { 'critique': 0, 'élevé': 1, 'modéré': 2, 'faible': 3 };
            return riskOrder[a.risk] - riskOrder[b.risk];
        }
        if (sortBy === 'alerts') {
            return b.alerts - a.alerts;
        }
        return a.name.localeCompare(b.name);
    });

    const getRiskColor = (risk) => {
        const colors = {
            'faible': 'var(--alert-green)',
            'modéré': 'var(--alert-yellow)',
            'élevé': 'var(--alert-orange)',
            'critique': 'var(--alert-red)'
        };
        return colors[risk] || 'var(--text-muted)';
    };

    return (
        <div className="surveillance animate-fadeIn">
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-lg)'
            }}>
                <div>
                    <h1 style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)'
                    }}>
                        <Radar size={28} style={{ color: 'var(--primary)' }} />
                        Surveillance en Temps Réel
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                        Monitoring des 24 gouvernorats tunisiens
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <button className="btn btn-secondary">
                        <Filter size={16} />
                        Filtres
                    </button>
                    <button className="btn btn-secondary">
                        <Download size={16} />
                        Exporter
                    </button>
                    <button className="btn btn-primary">
                        <RefreshCw size={16} />
                        Actualiser
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-lg)',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
                        <label className="form-label">Région</label>
                        <select
                            className="form-select"
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                        >
                            <option value="all">Toutes les régions</option>
                            {regions.map(region => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
                        <label className="form-label">Trier par</label>
                        <select
                            className="form-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="risk">Niveau de risque</option>
                            <option value="alerts">Nombre d'alertes</option>
                            <option value="name">Nom</option>
                        </select>
                    </div>
                    <div style={{
                        marginLeft: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        color: 'var(--text-muted)',
                        fontSize: 'var(--font-size-sm)'
                    }}>
                        <Activity size={16} />
                        <span>Dernière MAJ: {new Date().toLocaleTimeString('fr-TN')}</span>
                    </div>
                </div>
            </div>

            {/* Stations Status */}
            <div className="dashboard-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stat-card green col-span-3">
                    <div className="stat-card-value">{weatherData.stations_status.active}</div>
                    <div className="stat-card-label">Stations Actives</div>
                </div>
                <div className="stat-card yellow col-span-3">
                    <div className="stat-card-value">{weatherData.stations_status.maintenance}</div>
                    <div className="stat-card-label">En Maintenance</div>
                </div>
                <div className="stat-card red col-span-3">
                    <div className="stat-card-value">{weatherData.stations_status.offline}</div>
                    <div className="stat-card-label">Hors Ligne</div>
                </div>
                <div className="stat-card col-span-3">
                    <div className="stat-card-value">{weatherData.stations_status.total}</div>
                    <div className="stat-card-label">Total Stations</div>
                </div>
            </div>

            {/* Gouvernorats Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Gouvernorat</th>
                            <th>Région</th>
                            <th>Risque</th>
                            <th>Alertes</th>
                            <th>Température</th>
                            <th>Précipitations</th>
                            <th>Vent</th>
                            <th>Stations</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedGouvernorats.map((gouvernorat) => {
                            const weather = weatherData.current_conditions[gouvernorat.id];
                            return (
                                <tr key={gouvernorat.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            <MapPin size={16} style={{ color: 'var(--primary)' }} />
                                            <strong>{gouvernorat.name}</strong>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{gouvernorat.region}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: 'var(--font-size-xs)',
                                            fontWeight: 600,
                                            background: `${getRiskColor(gouvernorat.risk)}20`,
                                            color: getRiskColor(gouvernorat.risk)
                                        }}>
                                            {gouvernorat.risk.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            color: gouvernorat.alerts > 0 ? 'var(--alert-red)' : 'var(--text-muted)',
                                            fontWeight: gouvernorat.alerts > 0 ? 600 : 400
                                        }}>
                                            {gouvernorat.alerts}
                                        </span>
                                    </td>
                                    <td>
                                        {weather ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Thermometer size={14} />
                                                {weather.temperature}°C
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        {weather ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Droplets size={14} />
                                                {weather.precipitation} mm
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        {weather ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Wind size={14} />
                                                {weather.wind_speed} km/h
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td>{gouvernorat.stations}</td>
                                    <td>
                                        <button className="btn btn-ghost btn-icon" title="Voir détails">
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Surveillance;
