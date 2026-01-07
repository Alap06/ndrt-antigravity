import {
    BarChart3,
    TrendingUp,
    Target,
    Activity,
    Clock,
    Zap,
    Brain,
    Shield
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
    // Mock data for charts
    const accuracyData = [
        { month: 'Jan', accuracy: 88 },
        { month: 'Fév', accuracy: 90 },
        { month: 'Mar', accuracy: 87 },
        { month: 'Avr', accuracy: 92 },
        { month: 'Mai', accuracy: 89 },
        { month: 'Jun', accuracy: 91 },
        { month: 'Jul', accuracy: 93 },
        { month: 'Aoû', accuracy: 90 },
        { month: 'Sep', accuracy: 94 },
        { month: 'Oct', accuracy: 92 },
        { month: 'Nov', accuracy: 91 },
        { month: 'Déc', accuracy: 93 }
    ];

    const alertsData = [
        { month: 'Jan', rouge: 2, orange: 5, jaune: 8 },
        { month: 'Fév', rouge: 3, orange: 4, jaune: 6 },
        { month: 'Mar', rouge: 1, orange: 6, jaune: 10 },
        { month: 'Avr', rouge: 4, orange: 8, jaune: 12 },
        { month: 'Mai', rouge: 2, orange: 5, jaune: 7 },
        { month: 'Jun', rouge: 1, orange: 3, jaune: 5 }
    ];

    const riskDistribution = [
        { name: 'Faible', value: 11, color: '#10B981' },
        { name: 'Modéré', value: 7, color: '#F59E0B' },
        { name: 'Élevé', value: 4, color: '#F97316' },
        { name: 'Critique', value: 2, color: '#EF4444' }
    ];

    const metrics = [
        {
            label: 'Précision Prédiction 24h',
            value: '92%',
            change: '+3%',
            icon: Target,
            color: 'green'
        },
        {
            label: 'Temps Réponse Moyen',
            value: '45s',
            change: '-12s',
            icon: Clock,
            color: 'green'
        },
        {
            label: 'Rapports Générés/Jour',
            value: '24',
            change: '+8',
            icon: Activity,
            color: 'yellow'
        },
        {
            label: 'Modèles IA Actifs',
            value: '12',
            change: '+2',
            icon: Brain,
            color: 'green'
        }
    ];

    const operationalImpact = [
        { label: 'Vies Potentiellement Sauvées', value: '312', description: 'Estimation basée sur les alertes précoces' },
        { label: 'Heures de Coordination Économisées', value: '15,840', description: 'Automatisation des processus' },
        { label: 'Réduction Temps de Réponse', value: '41%', description: 'Amélioration de la mobilisation' },
        { label: 'Économies Estimées', value: '2.1M TND', description: 'Réduction des pertes économiques' }
    ];

    return (
        <div className="analytics animate-fadeIn">
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
                        <BarChart3 size={28} style={{ color: 'var(--primary)' }} />
                        Tableau de Bord Analytique
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                        Métriques de performance et intelligence quantique
                    </p>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="dashboard-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
                {metrics.map((metric, index) => (
                    <div key={index} className={`stat-card ${metric.color} col-span-3`}>
                        <div className="stat-card-header">
                            <div className="stat-card-icon">
                                <metric.icon size={24} />
                            </div>
                        </div>
                        <div className="stat-card-value">{metric.value}</div>
                        <div className="stat-card-label">{metric.label}</div>
                        <div className="stat-card-trend up">
                            <TrendingUp size={14} />
                            <span>{metric.change} ce mois</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="dashboard-grid" style={{ marginBottom: 'var(--spacing-lg)' }}>
                {/* Accuracy Chart */}
                <div className="chart-container col-span-8">
                    <div className="chart-header">
                        <h3 style={{
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 600,
                            color: 'var(--text-primary)'
                        }}>
                            Précision des Prédictions
                        </h3>
                    </div>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={accuracyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="month" stroke="var(--text-muted)" />
                                <YAxis domain={[80, 100]} stroke="var(--text-muted)" />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-md)'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="accuracy"
                                    stroke="var(--primary)"
                                    strokeWidth={3}
                                    dot={{ fill: 'var(--primary)', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Risk Distribution */}
                <div className="chart-container col-span-4">
                    <div className="chart-header">
                        <h3 style={{
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 600,
                            color: 'var(--text-primary)'
                        }}>
                            Distribution des Risques
                        </h3>
                    </div>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={riskDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {riskDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 'var(--spacing-md)',
                            marginTop: 'var(--spacing-md)'
                        }}>
                            {riskDistribution.map((item, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-xs)',
                                    fontSize: 'var(--font-size-xs)'
                                }}>
                                    <div style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '2px',
                                        background: item.color
                                    }} />
                                    <span style={{ color: 'var(--text-muted)' }}>{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts History Chart */}
            <div className="chart-container" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="chart-header">
                    <h3 style={{
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: 600,
                        color: 'var(--text-primary)'
                    }}>
                        Historique des Alertes par Niveau
                    </h3>
                </div>
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={alertsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" stroke="var(--text-muted)" />
                            <YAxis stroke="var(--text-muted)" />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)'
                                }}
                            />
                            <Bar dataKey="rouge" fill="#EF4444" stackId="a" />
                            <Bar dataKey="orange" fill="#F97316" stackId="a" />
                            <Bar dataKey="jaune" fill="#F59E0B" stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Operational Impact */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <Shield size={20} />
                        Impact Opérationnel
                    </h3>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 'var(--spacing-lg)'
                }}>
                    {operationalImpact.map((item, index) => (
                        <div key={index} style={{
                            padding: 'var(--spacing-lg)',
                            background: 'var(--surface-light)',
                            borderRadius: 'var(--radius-md)',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: 'var(--font-size-3xl)',
                                fontWeight: 700,
                                color: 'var(--primary)',
                                marginBottom: 'var(--spacing-sm)'
                            }}>
                                {item.value}
                            </div>
                            <div style={{
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                marginBottom: 'var(--spacing-xs)'
                            }}>
                                {item.label}
                            </div>
                            <div style={{
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--text-muted)'
                            }}>
                                {item.description}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
