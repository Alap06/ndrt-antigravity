import { Droplets, AlertTriangle, Radio } from 'lucide-react';

const GouvernoratCard = ({ gouvernorat, weather, isSelected, onClick, style }) => {
    const getRiskClass = (risk) => {
        const classes = {
            'faible': 'risk-faible',
            'modéré': 'risk-modere',
            'élevé': 'risk-eleve',
            'critique': 'risk-critique'
        };
        return classes[risk] || 'risk-faible';
    };

    const getRiskLabel = (risk) => {
        const labels = {
            'faible': 'Faible',
            'modéré': 'Modéré',
            'élevé': 'Élevé',
            'critique': 'CRITIQUE'
        };
        return labels[risk] || 'N/A';
    };

    return (
        <div
            className={`gouvernorat-card ${getRiskClass(gouvernorat.risk)} ${isSelected ? 'selected' : ''} animate-slideInUp`}
            onClick={onClick}
            style={{
                ...style,
                borderColor: isSelected ? 'var(--primary)' : undefined,
                boxShadow: isSelected ? 'var(--shadow-glow)' : undefined
            }}
        >
            <div className="gouvernorat-header">
                <span className="gouvernorat-name">{gouvernorat.name}</span>
                <span className={`gouvernorat-risk ${getRiskClass(gouvernorat.risk)}`}>
                    {getRiskLabel(gouvernorat.risk)}
                </span>
            </div>

            <div className="gouvernorat-stats">
                <div className="gouvernorat-stat">
                    <AlertTriangle size={12} style={{ marginRight: '4px' }} />
                    <strong>{gouvernorat.alerts}</strong> alertes
                </div>
                <div className="gouvernorat-stat">
                    <Radio size={12} style={{ marginRight: '4px' }} />
                    <strong>{gouvernorat.stations}</strong> stations
                </div>
            </div>

            {weather && (
                <div style={{
                    marginTop: 'var(--spacing-sm)',
                    paddingTop: 'var(--spacing-sm)',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-muted)'
                }}>
                    <span>{weather.temperature}°C</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Droplets size={12} />
                        {weather.precipitation} mm
                    </span>
                </div>
            )}
        </div>
    );
};

export default GouvernoratCard;
