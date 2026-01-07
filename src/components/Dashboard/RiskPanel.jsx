import { AlertTriangle, Droplets, Thermometer, Wheat, Shield } from 'lucide-react';

const RiskPanel = ({ riskIndices }) => {
    if (!riskIndices) return null;

    const getRiskLevel = (value) => {
        if (value >= 80) return 'critical';
        if (value >= 60) return 'high';
        if (value >= 40) return 'medium';
        return 'low';
    };

    const getAlertLevelInfo = (level) => {
        const levels = {
            'vert': { label: 'Normal', color: 'var(--alert-green)' },
            'jaune': { label: 'Vigilance', color: 'var(--alert-yellow)' },
            'orange': { label: 'Élevé', color: 'var(--alert-orange)' },
            'rouge': { label: 'Critique', color: 'var(--alert-red)' }
        };
        return levels[level] || levels.vert;
    };

    const alertInfo = getAlertLevelInfo(riskIndices.overall_alert_level);

    const risks = [
        {
            label: 'Risque Inondation',
            value: riskIndices.flood_risk,
            icon: Droplets
        },
        {
            label: 'Risque Tempête',
            value: riskIndices.storm_risk,
            icon: AlertTriangle
        },
        {
            label: 'Risque Canicule',
            value: riskIndices.heatwave_risk,
            icon: Thermometer
        },
        {
            label: 'Risque Agricole',
            value: riskIndices.agricultural_risk,
            icon: Wheat
        },
    ];

    return (
        <div className="risk-panel animate-scaleIn">
            <div className="risk-header">
                <div className="risk-title">
                    <Shield size={20} style={{ color: 'var(--primary)' }} />
                    Indices de Risque
                </div>
                <div
                    className={`risk-level ${riskIndices.overall_alert_level}`}
                    style={{ background: alertInfo.color }}
                >
                    {alertInfo.label}
                </div>
            </div>

            <div className="risk-meters">
                {risks.map((risk, index) => (
                    <div key={index} className="risk-meter">
                        <div className="risk-meter-header">
                            <span className="risk-meter-label" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)'
                            }}>
                                <risk.icon size={16} />
                                {risk.label}
                            </span>
                            <span className="risk-meter-value">{risk.value}/100</span>
                        </div>
                        <div className="risk-meter-bar">
                            <div
                                className={`risk-meter-fill ${getRiskLevel(risk.value)}`}
                                style={{ width: `${risk.value}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Warning Box for Critical Levels */}
            {riskIndices.overall_alert_level === 'rouge' && (
                <div style={{
                    marginTop: 'var(--spacing-lg)',
                    padding: 'var(--spacing-md)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--alert-red)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)'
                }}>
                    <AlertTriangle size={20} style={{ color: 'var(--alert-red)' }} />
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--alert-red)' }}>
                        Vigilance maximale requise - Actions préventives recommandées
                    </span>
                </div>
            )}
        </div>
    );
};

export default RiskPanel;
