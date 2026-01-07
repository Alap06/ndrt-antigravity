import { useState } from 'react';
import {
    Settings as SettingsIcon,
    User,
    Bell,
    Shield,
    Database,
    Palette,
    Globe,
    Save,
    RefreshCw
} from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'Général', icon: SettingsIcon },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'user', label: 'Utilisateur', icon: User },
        { id: 'api', label: 'API & Intégrations', icon: Database },
        { id: 'appearance', label: 'Apparence', icon: Palette }
    ];

    return (
        <div className="settings animate-fadeIn">
            {/* Header */}
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)'
                }}>
                    <SettingsIcon size={28} style={{ color: 'var(--primary)' }} />
                    Paramètres
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                    Configuration du système NDRT Antigravity
                </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                {/* Sidebar Tabs */}
                <div style={{ width: '250px', flexShrink: 0 }}>
                    <div className="card" style={{ padding: 'var(--spacing-sm)' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-md)',
                                    padding: 'var(--spacing-md)',
                                    background: activeTab === tab.id ? 'rgba(227, 27, 35, 0.1)' : 'transparent',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: activeTab === tab.id ? 600 : 400,
                                    textAlign: 'left',
                                    transition: 'all var(--transition-fast)'
                                }}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                    {activeTab === 'general' && (
                        <div className="card">
                            <h2 style={{
                                fontSize: 'var(--font-size-xl)',
                                fontWeight: 600,
                                marginBottom: 'var(--spacing-lg)',
                                color: 'var(--text-primary)'
                            }}>
                                Paramètres Généraux
                            </h2>

                            <div className="form-group">
                                <label className="form-label">Nom du Système</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    defaultValue="NDRT Antigravity Weather Intelligence"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Organisation</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    defaultValue="Croissant Rouge Tunisien - NDRT"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Fuseau Horaire</label>
                                <select className="form-select" defaultValue="africa-tunis">
                                    <option value="africa-tunis">Africa/Tunis (UTC+1)</option>
                                    <option value="europe-paris">Europe/Paris (UTC+1)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Langue</label>
                                <select className="form-select" defaultValue="fr">
                                    <option value="fr">Français</option>
                                    <option value="ar">العربية</option>
                                    <option value="en">English</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Intervalle de Rafraîchissement (minutes)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    defaultValue="5"
                                    min="1"
                                    max="60"
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: 'var(--spacing-md)',
                                marginTop: 'var(--spacing-lg)'
                            }}>
                                <button className="btn btn-primary">
                                    <Save size={16} />
                                    Enregistrer
                                </button>
                                <button className="btn btn-secondary">
                                    <RefreshCw size={16} />
                                    Réinitialiser
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="card">
                            <h2 style={{
                                fontSize: 'var(--font-size-xl)',
                                fontWeight: 600,
                                marginBottom: 'var(--spacing-lg)',
                                color: 'var(--text-primary)'
                            }}>
                                Configuration des Notifications
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                                {[
                                    { label: 'Alertes Niveau Rouge', description: 'Notifications immédiates pour les situations critiques' },
                                    { label: 'Alertes Niveau Orange', description: 'Notifications pour les risques élevés' },
                                    { label: 'Alertes Niveau Jaune', description: 'Notifications pour les risques modérés' },
                                    { label: 'Rapports Automatiques', description: 'Notification à la génération des rapports' },
                                    { label: 'Mises à jour Stations', description: 'Alertes de statut des stations météo' }
                                ].map((item, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 'var(--spacing-md)',
                                        background: 'var(--surface-light)',
                                        borderRadius: 'var(--radius-md)'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                                {item.label}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                                {item.description}
                                            </div>
                                        </div>
                                        <label style={{
                                            position: 'relative',
                                            display: 'inline-block',
                                            width: '50px',
                                            height: '26px'
                                        }}>
                                            <input
                                                type="checkbox"
                                                defaultChecked={index < 3}
                                                style={{ opacity: 0, width: 0, height: 0 }}
                                            />
                                            <span style={{
                                                position: 'absolute',
                                                cursor: 'pointer',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background: index < 3 ? 'var(--primary)' : 'var(--surface-lighter)',
                                                borderRadius: '13px',
                                                transition: 'var(--transition-fast)'
                                            }}>
                                                <span style={{
                                                    position: 'absolute',
                                                    left: index < 3 ? '26px' : '4px',
                                                    top: '3px',
                                                    width: '20px',
                                                    height: '20px',
                                                    background: 'white',
                                                    borderRadius: '50%',
                                                    transition: 'var(--transition-fast)'
                                                }} />
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: 'var(--spacing-md)',
                                marginTop: 'var(--spacing-lg)'
                            }}>
                                <button className="btn btn-primary">
                                    <Save size={16} />
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'api' && (
                        <div className="card">
                            <h2 style={{
                                fontSize: 'var(--font-size-xl)',
                                fontWeight: 600,
                                marginBottom: 'var(--spacing-lg)',
                                color: 'var(--text-primary)'
                            }}>
                                API & Intégrations
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                                {[
                                    { name: 'INM Tunisie', status: 'connected', endpoint: 'api.meteo.tn' },
                                    { name: 'Protection Civile', status: 'connected', endpoint: 'api.protection-civile.tn' },
                                    { name: 'Ministère Agriculture', status: 'pending', endpoint: 'api.agriculture.tn' },
                                    { name: 'IFRC GO', status: 'connected', endpoint: 'api.ifrc.org' },
                                    { name: 'Copernicus EMS', status: 'disconnected', endpoint: 'emergency.copernicus.eu' }
                                ].map((api, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 'var(--spacing-md)',
                                        background: 'var(--surface-light)',
                                        borderRadius: 'var(--radius-md)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                            <Database size={20} style={{ color: 'var(--text-muted)' }} />
                                            <div>
                                                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                                    {api.name}
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                                    {api.endpoint}
                                                </div>
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: 'var(--font-size-xs)',
                                            fontWeight: 500,
                                            background: api.status === 'connected' ? 'rgba(16, 185, 129, 0.2)' :
                                                api.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' :
                                                    'rgba(239, 68, 68, 0.2)',
                                            color: api.status === 'connected' ? 'var(--alert-green)' :
                                                api.status === 'pending' ? 'var(--alert-yellow)' :
                                                    'var(--alert-red)'
                                        }}>
                                            {api.status === 'connected' ? 'Connecté' :
                                                api.status === 'pending' ? 'En attente' : 'Déconnecté'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                marginTop: 'var(--spacing-lg)',
                                padding: 'var(--spacing-md)',
                                background: 'rgba(227, 27, 35, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--primary)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-sm)',
                                    marginBottom: 'var(--spacing-sm)'
                                }}>
                                    <Shield size={16} style={{ color: 'var(--primary)' }} />
                                    <span style={{ fontWeight: 500, color: 'var(--primary)' }}>
                                        Mode Simulation Actif
                                    </span>
                                </div>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                    Les données affichées proviennent de sources simulées. Contactez l'administrateur pour activer les connexions API réelles.
                                </p>
                            </div>
                        </div>
                    )}

                    {(activeTab === 'user' || activeTab === 'appearance') && (
                        <div className="card">
                            <h2 style={{
                                fontSize: 'var(--font-size-xl)',
                                fontWeight: 600,
                                marginBottom: 'var(--spacing-lg)',
                                color: 'var(--text-primary)'
                            }}>
                                {activeTab === 'user' ? 'Profil Utilisateur' : 'Apparence'}
                            </h2>
                            <p style={{ color: 'var(--text-muted)' }}>
                                Cette section est en cours de développement.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
