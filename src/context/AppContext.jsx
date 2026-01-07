import { createContext, useContext, useState, useEffect } from 'react';
import { translations, getTranslation } from '../services/translations';

// Create context
const AppContext = createContext();

// Hook for using context
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

// Provider component
export const AppProvider = ({ children }) => {
    // Language state - default French
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('ndrt-language');
        return saved || 'fr';
    });

    // Theme state - default dark
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('ndrt-theme');
        return saved || 'dark';
    });

    // API Key state
    const [apiKey, setApiKey] = useState(() => {
        return localStorage.getItem('ndrt-api-key') || '';
    });

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('ndrt-language', language);
        // Update document direction for Arabic
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    useEffect(() => {
        localStorage.setItem('ndrt-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('ndrt-api-key', apiKey);
    }, [apiKey]);

    // Translation function
    const t = (path) => {
        return getTranslation(language, path);
    };

    // Get translations object for current language
    const translations_current = translations[language] || translations.fr;

    // Toggle theme
    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Cycle language
    const cycleLanguage = () => {
        const langs = ['fr', 'ar', 'en'];
        const currentIndex = langs.indexOf(language);
        const nextIndex = (currentIndex + 1) % langs.length;
        setLanguage(langs[nextIndex]);
    };

    const value = {
        // Language
        language,
        setLanguage,
        cycleLanguage,
        t,
        translations: translations_current,
        isRtl: language === 'ar',

        // Theme
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',

        // API
        apiKey,
        setApiKey
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;
