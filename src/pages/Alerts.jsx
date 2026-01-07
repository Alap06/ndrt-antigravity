import { useState, useEffect } from 'react';
import {
    Bell,
    Plus,
    Filter,
    MapPin,
    Clock,
    Users,
    AlertTriangle,
    CloudRain,
    Wind,
    ChevronRight,
    CheckCircle,
    XCircle
} from 'lucide-react';
import alertsData from '../data/alertsMock.json';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [selectedSeverity, setSelectedSeverity] = useState('all');

    useEffect(() => {
        setAlerts(alertsData.active_alerts);
    }, []);

    const filteredAlerts = alerts.filter(alert => {
        if (selectedSeverity === 'all') return true;
        return alert.severity === selectedSeverity;
    });

    const stats = alertsData.alert_statistics.today;

    const getAlertIcon = (type) => {
        switch (type) {
            case 'inondation': return <CloudRain size={20} />;
            case 'vent_violent': return <Wind size={20} />;
            default: return <AlertTriangle size={20} />;
        }
    };

    const getSeverityColor = (severity) => {
        const colors = {
            'vert': 'var(--alert-green)',
            'jaune': 'var(--alert-yellow)',
            'orange': 'var(--alert-orange)',
            'rouge': 'var(--alert-red)'
        };
        return colors[severity] || 'var(--text-muted)';
    };

    return (
        <div className="alerts-page animate-fadeIn">
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
                        <Bell size={28} style={{ color: 'var(--primary)' }} />
                        Système d'Alertes
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                        Gestion et distribution des alertes météorologiques
                    </p>
                </div>
                <button className="btn btn-primary btn-lg">
                    <Plus size={18} />
                    Nouvelle Alerte
                </button>
            </div>

            {/* Stats */}
            <div className="dashboard-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="stat-card col-span-3">
                    <div className="stat-card-value">{stats.total}</div>
                    <div className="stat-card-label">Alertes Aujourd'hui</div>
                </div>
                <div className="stat-card red col-span-3">
                    <div className="stat-card-value">{stats.rouge}</div>
                    <div className="stat-card-label">Niveau Rouge</div>
                </div>
                <div className="stat-card orange col-span-3">
                    <div className="stat-card-value">{stats.orange}</div>
                    <div className="stat-card-label">Niveau Orange</div>
                </div>
                <div className="stat-card yellow col-span-3">
                    <div className="stat-card-value">{stats.jaune}</div>
                    <div className="stat-card-label">Niveau Jaune</div>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                        Filtrer par niveau:
                    </span>
                    {['all', 'rouge', 'orange', 'jaune', 'vert'].map(severity => (
                        <button
                            key={severity}
                            className={`btn ${selectedSeverity === severity ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setSelectedSeverity(severity)}
                            style={{
                                background: selectedSeverity === severity && severity !== 'all'
                                    ? getSeverityColor(severity)
                                    : undefined
                            }}
                        >
                            {severity === 'all' ? 'Tous' : severity.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Alerts Grid */}
            <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
                {filteredAlerts.map((alert) => (
                    <div
                        key={alert.id}
                        className="card animate-slideInUp"
                        style={{
                            borderLeft: `4px solid ${getSeverityColor(alert.severity)}`
                        }}
                    >
                        <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                            {/* Icon */}
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: 'var(--radius-lg)',
                                background: `${getSeverityColor(alert.severity)}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: getSeverityColor(alert.severity),
                                flexShrink: 0
                            }}>
                                {getAlertIcon(alert.type)}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: 'var(--spacing-sm)'
                                }}>
                                    <div>
                                        <h3 style={{
                                            fontSize: 'var(--font-size-lg)',
                                            fontWeight: 600,
                                            color: 'var(--text-primary)',
                                            marginBottom: 'var(--spacing-xs)'
                                        }}>
                                            {alert.title}
                                        </h3>
                                        <div style={{
                                            display: 'flex',
                                            gap: 'var(--spacing-md)',
                                            color: 'var(--text-muted)',
                                            fontSize: 'var(--font-size-sm)'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <MapPin size={14} />
                                                {alert.gouvernorat}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={14} />
                                                {new Date(alert.issued_at).toLocaleString('fr-TN')}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Users size={14} />
                                                {alert.affected_population?.toLocaleString()} habitants
                                            </span>
                                        </div>
                                    </div>
                                    <span style={{
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: 600,
                                        background: getSeverityColor(alert.severity),
                                        color: 'white'
                                    }}>
                                        {alert.severity.toUpperCase()}
                                    </span>
                                </div>

                                <p style={{
                                    color: 'var(--text-secondary)',
                                    marginBottom: 'var(--spacing-md)',
                                    lineHeight: 1.6
                                }}>
                                    {alert.description}
                                </p>

                                {/* Affected Areas */}
                                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                    <span style={{
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: 500,
                                        color: 'var(--text-muted)'
                                    }}>
                                        Zones affectées:
                                    </span>
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 'var(--spacing-xs)',
                                        marginTop: 'var(--spacing-xs)'
                                    }}>
                                        {alert.affected_areas.map((area, idx) => (
                                            <span key={idx} style={{
                                                padding: '4px 10px',
                                                background: 'var(--surface-light)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: 'var(--font-size-xs)',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {area}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Recommendations */}
                                {alert.recommendations && (
                                    <div>
                                        <span style={{
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: 500,
                                            color: 'var(--text-muted)'
                                        }}>
                                            Recommandations:
                                        </span>
                                        <ul style={{
                                            marginTop: 'var(--spacing-xs)',
                                            paddingLeft: 'var(--spacing-lg)',
                                            color: 'var(--text-secondary)',
                                            fontSize: 'var(--font-size-sm)'
                                        }}>
                                            {alert.recommendations.slice(0, 3).map((rec, idx) => (
                                                <li key={idx}>{rec}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{
                                    display: 'flex',
                                    gap: 'var(--spacing-sm)',
                                    marginTop: 'var(--spacing-md)',
                                    paddingTop: 'var(--spacing-md)',
                                    borderTop: '1px solid var(--border)'
                                }}>
                                    <button className="btn btn-primary">
                                        Générer Rapport
                                    </button>
                                    <button className="btn btn-secondary">
                                        Distribuer
                                    </button>
                                    <button className="btn btn-ghost">
                                        <CheckCircle size={16} />
                                        Valider
                                    </button>
                                    <button className="btn btn-ghost" style={{ color: 'var(--alert-red)' }}>
                                        <XCircle size={16} />
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Alerts;
