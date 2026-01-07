import { useState, useRef, useEffect } from 'react';
import {
    Bell,
    Search,
    ChevronDown,
    AlertTriangle,
    CloudRain,
    Wind,
    Menu,
    Moon,
    Sun,
    Globe
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import alertsData from '../../data/alertsMock.json';

const Header = ({ collapsed, currentTime, onMobileMenuClick }) => {
    const { theme, toggleTheme, language, cycleLanguage, t, translations } = useApp();
    const [showAlerts, setShowAlerts] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const alertsRef = useRef(null);
    const userRef = useRef(null);

    const criticalAlerts = alertsData.active_alerts.filter(a => a.severity === 'rouge');

    // Format time based on language
    const formatTime = (date) => {
        return date.toLocaleTimeString(language === 'ar' ? 'ar-TN' : 'fr-TN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-TN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (alertsRef.current && !alertsRef.current.contains(e.target)) {
                setShowAlerts(false);
            }
            if (userRef.current && !userRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getAlertIcon = (type) => {
        if (type === 'inondation' || type === 'pluie_forte') return CloudRain;
        if (type === 'vent_violent') return Wind;
        return AlertTriangle;
    };

    const getLangLabel = () => {
        const labels = { fr: 'FR', ar: 'عر', en: 'EN' };
        return labels[language] || 'FR';
    };

    return (
        <header className={`header ${collapsed ? 'collapsed' : ''}`}>
            <div className="header-left">
                {/* Mobile menu button */}
                <button
                    className="mobile-menu-btn"
                    onClick={onMobileMenuClick}
                    aria-label="Toggle menu"
                >
                    <Menu size={20} />
                </button>

                <div>
                    <h1 className="header-title">Système Gestion Météo et Rapport de Situation</h1>
                    <p className="header-subtitle">
                        {translations.surveillance?.realTimeSurveillance || 'Surveillance Météorologique - NDRT Tunisie'}
                    </p>
                </div>
            </div>

            <div className="header-right">
                {/* Data Status */}
                <div className="data-status simulated">
                    <span className="data-status-dot"></span>
                    <span>Simulation</span>
                </div>

                {/* Search - Hidden on mobile */}
                <div className="header-search" style={{ display: 'none' }}>
                    <Search size={18} />
                    <input type="text" placeholder={translations.common?.search || 'Rechercher'} />
                </div>

                {/* Time Display */}
                <div className="header-time">
                    <span className="time">{formatTime(currentTime)}</span>
                    <span className="date">{formatDate(currentTime)}</span>
                </div>

                {/* Language Toggle */}
                <button
                    className="lang-toggle"
                    onClick={cycleLanguage}
                    title="Change language"
                >
                    <Globe size={16} />
                    {getLangLabel()}
                </button>

                {/* Theme Toggle */}
                <button
                    className="theme-toggle"
                    onClick={toggleTheme}
                    title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Alerts */}
                <div className="header-alerts" ref={alertsRef}>
                    <button
                        className="header-alerts-btn"
                        onClick={() => setShowAlerts(!showAlerts)}
                    >
                        <Bell size={20} />
                        {criticalAlerts.length > 0 && (
                            <span className="header-alerts-badge">{criticalAlerts.length}</span>
                        )}
                    </button>

                    {showAlerts && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            width: '360px',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-xl)',
                            marginTop: 'var(--spacing-sm)',
                            overflow: 'hidden',
                            zIndex: 1000
                        }}>
                            <div style={{
                                padding: 'var(--spacing-md)',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {translations.alerts?.activeAlerts || 'Alertes Actives'}
                                </span>
                                <span style={{
                                    background: 'var(--alert-red)',
                                    color: 'white',
                                    fontSize: 'var(--font-size-xs)',
                                    padding: '2px 8px',
                                    borderRadius: '10px'
                                }}>
                                    {criticalAlerts.length} {translations.alerts?.critical || 'critiques'}
                                </span>
                            </div>

                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {criticalAlerts.slice(0, 5).map(alert => {
                                    const AlertIcon = getAlertIcon(alert.type);
                                    return (
                                        <div key={alert.id} style={{
                                            padding: 'var(--spacing-md)',
                                            borderBottom: '1px solid var(--border)',
                                            display: 'flex',
                                            gap: 'var(--spacing-sm)',
                                            cursor: 'pointer',
                                            transition: 'background var(--transition-fast)'
                                        }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                background: 'rgba(239, 68, 68, 0.2)',
                                                borderRadius: 'var(--radius-sm)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--alert-red)'
                                            }}>
                                                <AlertIcon size={18} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontWeight: 500,
                                                    color: 'var(--text-primary)',
                                                    fontSize: 'var(--font-size-sm)'
                                                }}>
                                                    {alert.title}
                                                </div>
                                                <div style={{
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--primary)'
                                                }}>
                                                    {alert.gouvernorat}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <a href="/alerts" style={{
                                display: 'block',
                                padding: 'var(--spacing-md)',
                                textAlign: 'center',
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontSize: 'var(--font-size-sm)',
                                borderTop: '1px solid var(--border)'
                            }}>
                                {translations.alerts?.manageAlerts || 'Gérer les alertes'}
                            </a>
                        </div>
                    )}
                </div>

                {/* User Menu */}
                <div className="header-user" ref={userRef} onClick={() => setShowUserMenu(!showUserMenu)}>
                    <div className="header-user-avatar">O</div>
                    <div className="header-user-info">
                        <span className="header-user-name">Opérateur NDRT</span>
                        <span className="header-user-role">Administrateur</span>
                    </div>
                    <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
            </div>
        </header>
    );
};

export default Header;
