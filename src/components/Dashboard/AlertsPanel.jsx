import { Bell, AlertTriangle, CloudRain, Wind, Thermometer, ChevronRight, Eye, Snowflake, Sun, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const getAlertIcon = (type) => {
    const icons = {
        'inondation': CloudRain,
        'pluie_intense': CloudRain,
        'pluie_forte': CloudRain,
        'pluie': CloudRain,
        'vent_violent': Wind,
        'vent_fort': Wind,
        'tempete': Wind,
        'orage': Zap,
        'canicule': Sun,
        'chaleur': Thermometer,
        'froid': Snowflake,
        'gel': Snowflake,
        'brouillard': Eye,
        'brouillard_dense': Eye,
        'brume': Eye,
        'vigilance': AlertTriangle
    };
    return icons[type] || AlertTriangle;
};

const AlertsPanel = ({ alerts = [], realTimeAlerts = [] }) => {
    const { language, translations } = useApp();

    // Combine static alerts with real-time detected alerts
    const allAlerts = [...realTimeAlerts, ...alerts];

    const criticalCount = allAlerts.filter(a => a.severity === 'rouge').length;
    const orangeCount = allAlerts.filter(a => a.severity === 'orange').length;

    // Translations
    const t = {
        fr: {
            activeAlerts: 'Alertes Actives',
            critical: 'critiques',
            noAlerts: 'Aucune alerte active',
            manageAlerts: 'Gérer les alertes',
            realTime: 'Temps réel',
            detected: 'Détecté',
            inhabitants: 'habitants'
        },
        ar: {
            activeAlerts: 'التنبيهات النشطة',
            critical: 'حرجة',
            noAlerts: 'لا توجد تنبيهات نشطة',
            manageAlerts: 'إدارة التنبيهات',
            realTime: 'وقت حقيقي',
            detected: 'مكتشف',
            inhabitants: 'ساكن'
        },
        en: {
            activeAlerts: 'Active Alerts',
            critical: 'critical',
            noAlerts: 'No active alerts',
            manageAlerts: 'Manage alerts',
            realTime: 'Real-time',
            detected: 'Detected',
            inhabitants: 'inhabitants'
        }
    };

    const labels = t[language] || t.fr;

    return (
        <div className="alerts-panel animate-slideInLeft" style={{ height: '100%' }}>
            <div className="alerts-header">
                <span className="alerts-title">
                    <Bell size={18} />
                    {labels.activeAlerts}
                </span>
                <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                    {criticalCount > 0 && (
                        <span className="alerts-count" style={{ background: 'var(--alert-red)' }}>
                            {criticalCount} {labels.critical}
                        </span>
                    )}
                    {orangeCount > 0 && (
                        <span className="alerts-count" style={{ background: 'var(--alert-orange)' }}>
                            {orangeCount}
                        </span>
                    )}
                </div>
            </div>

            <div className="alerts-list" style={{ maxHeight: '450px' }}>
                {allAlerts.length === 0 ? (
                    <div style={{
                        padding: 'var(--spacing-xl)',
                        textAlign: 'center',
                        color: 'var(--text-muted)'
                    }}>
                        <AlertTriangle size={40} style={{ opacity: 0.3, marginBottom: 'var(--spacing-md)' }} />
                        <div>{labels.noAlerts}</div>
                    </div>
                ) : (
                    allAlerts.slice(0, 10).map((alert, index) => {
                        const AlertIcon = getAlertIcon(alert.type);
                        const isRealTime = alert.isRealTime || alert.source;

                        return (
                            <div key={alert.id || index} className="alert-item">
                                <div className={`alert-icon ${alert.severity}`}>
                                    <AlertIcon size={20} />
                                </div>
                                <div className="alert-content">
                                    <div className="alert-header">
                                        <span className="alert-type">{alert.title}</span>
                                        <span className="alert-time">
                                            {alert.startTime || (alert.issued_at ? new Date(alert.issued_at).toLocaleTimeString(language === 'ar' ? 'ar-TN' : 'fr-TN', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : '')}
                                        </span>
                                    </div>
                                    <div className="alert-location">{alert.gouvernorat}</div>

                                    {/* Show measurement for real-time alerts */}
                                    {alert.measurement && (
                                        <div style={{
                                            fontSize: 'var(--font-size-sm)',
                                            color: 'var(--text-secondary)',
                                            fontWeight: 500
                                        }}>
                                            📊 {alert.measurement}
                                        </div>
                                    )}

                                    {/* Show description or affected areas */}
                                    <div className="alert-description">
                                        {alert.description || (alert.affected_areas && (
                                            <>
                                                {alert.affected_areas.slice(0, 3).join(', ')}
                                                {alert.affected_areas.length > 3 && ` +${alert.affected_areas.length - 3}`}
                                            </>
                                        ))}
                                    </div>

                                    <div style={{
                                        marginTop: 'var(--spacing-xs)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-sm)',
                                        flexWrap: 'wrap'
                                    }}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: 'var(--font-size-xs)',
                                            fontWeight: 500,
                                            background: alert.severity === 'rouge' ? 'rgba(239, 68, 68, 0.2)' :
                                                alert.severity === 'orange' ? 'rgba(249, 115, 22, 0.2)' :
                                                    alert.severity === 'jaune' ? 'rgba(245, 158, 11, 0.2)' :
                                                        'rgba(16, 185, 129, 0.2)',
                                            color: alert.severity === 'rouge' ? 'var(--alert-red)' :
                                                alert.severity === 'orange' ? 'var(--alert-orange)' :
                                                    alert.severity === 'jaune' ? 'var(--alert-yellow)' :
                                                        'var(--alert-green)'
                                        }}>
                                            {alert.severity.toUpperCase()}
                                        </span>

                                        {isRealTime && (
                                            <span style={{
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: 'var(--font-size-xs)',
                                                background: 'rgba(16, 185, 129, 0.15)',
                                                color: 'var(--alert-green)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <span style={{
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    background: 'var(--alert-green)',
                                                    animation: 'blink 1s infinite'
                                                }}></span>
                                                {labels.realTime}
                                            </span>
                                        )}

                                        {alert.affected_population && (
                                            <span style={{
                                                fontSize: 'var(--font-size-xs)',
                                                color: 'var(--text-muted)'
                                            }}>
                                                {alert.affected_population?.toLocaleString()} {labels.inhabitants}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                            </div>
                        );
                    })
                )}
            </div>

            <div style={{
                padding: 'var(--spacing-md)',
                borderTop: '1px solid var(--border)',
                textAlign: 'center'
            }}>
                <a href="/alerts" style={{
                    color: 'var(--primary)',
                    fontSize: 'var(--font-size-sm)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--spacing-xs)'
                }}>
                    {labels.manageAlerts}
                    <ChevronRight size={14} />
                </a>
            </div>
        </div>
    );
};

export default AlertsPanel;
