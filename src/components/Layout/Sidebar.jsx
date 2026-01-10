import { useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Radar,
    Bell,
    FileText,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
    const location = useLocation();
    const { translations, isRtl } = useApp();
    const t = translations.nav || {};

    const navItems = [
        {
            section: t.main || 'Principal',
            items: [
                { path: '/', icon: LayoutDashboard, label: t.dashboard || 'Tableau de Bord' },
                { path: '/surveillance', icon: Radar, label: t.surveillance || 'Surveillance' },
                { path: '/alerts', icon: Bell, label: t.alerts || 'Alertes' },
                { path: '/reports', icon: FileText, label: t.reports || 'Rapports' },
            ]
        },
        {
            section: t.analysis || 'Analyse',
            items: [
                { path: '/analytics', icon: BarChart3, label: t.analytics || 'Analytiques' },
            ]
        },
        {
            section: t.configuration || 'Configuration',
            items: [
                { path: '/settings', icon: Settings, label: t.settings || 'Paramètres' },
            ]
        }
    ];

    const handleNavClick = () => {
        // Close mobile sidebar when navigating
        if (mobileOpen && onMobileClose) {
            onMobileClose();
        }
    };

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`}>
            {/* Header */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src="/src/assets/NDRT.png" alt="NDRT" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                {!collapsed && (
                    <div className="sidebar-title">
                        <h1>NDRT</h1>
                        <span>{translations.appSubtitle || 'Gestion Météo & Rapports'}</span>
                    </div>
                )}

                {/* Mobile close button */}
                {mobileOpen && (
                    <button
                        onClick={onMobileClose}
                        style={{
                            marginLeft: 'auto',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: 'var(--spacing-sm)'
                        }}
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="nav-section">
                        <div className="nav-section-title">{section.section}</div>
                        {section.items.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={handleNavClick}
                                title={collapsed ? item.label : undefined}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Footer - Toggle button (desktop only) */}
            <div className="sidebar-footer">
                <button className="sidebar-toggle" onClick={onToggle}>
                    {collapsed ? (
                        isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />
                    ) : (
                        <>
                            {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                            <span>{t.collapse || 'Réduire'}</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
