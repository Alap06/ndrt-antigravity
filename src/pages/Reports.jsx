import { useState, useRef, useEffect } from 'react';
import {
    FileText,
    Download,
    Image,
    MapPin,
    Calendar,
    Clock,
    Thermometer,
    Wind,
    Droplets,
    Eye,
    AlertTriangle,
    Cloud,
    Sun,
    CloudRain,
    Loader,
    Check,
    X,
    Wifi,
    WifiOff
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { useApp } from '../context/AppContext';
import gouvernoratsData from '../data/gouvernorats.json';
import weatherMockData from '../data/weatherMock.json';
import { weatherService, GOVERNORATES } from '../services/weatherApi';
import { smartAlertService } from '../services/alertService';

const Reports = () => {
    const { language, translations } = useApp();
    const reportRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]); // Support multiple images
    const [isLoadingWeather, setIsLoadingWeather] = useState(false);
    const [dataSource, setDataSource] = useState('');
    const [detectedAlerts, setDetectedAlerts] = useState([]);

    // Get current date
    const today = new Date();
    const formattedDate = today.toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-TN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Form state with pre-filled data where available
    const [formData, setFormData] = useState({
        // 1. Informations générales
        region: '',
        gouvernorat: '',
        gouvernoratId: '',
        date: formattedDate,
        periodeValidite: '00h00 - 24h00',
        sourceDonnees: 'Open-Meteo API + INM',

        // 2. Situation météorologique actuelle
        etatCiel: 'nuageux',
        temperatureActuelle: '',
        temperatureMin: '',
        temperatureMax: '',
        humidite: '',
        pression: '',
        ventDirection: 'N',
        ventVitesse: '',
        ventRafales: '',
        precipitations: 'non',
        precipitationsQuantite: '',
        visibilite: 'normale',
        visibiliteKm: '',

        // 3. Phénomènes remarquables
        pluiesIntenses: false,
        orages: false,
        brouillard: false,
        sablePoussiere: false,
        vagueChaleur: false,
        vagueFroid: false,
        phenomenesDetails: '',

        // 4. Prévisions 24h
        previsionCiel: '',
        previsionTempMin: '',
        previsionTempMax: '',
        previsionVentDirection: '',
        previsionVentIntensite: '',
        previsionPrecipProbabilite: '',
        previsionPrecipIntensite: '',

        // 5. Niveau de vigilance
        niveauAlerte: 'vert',
        phenomeneConcerne: '',
        periodeVigilance: '',

        // 6. Impacts potentiels
        impactCirculation: '',
        impactAgricole: '',
        impactMaritime: '',
        risquesPopulation: ''
    });

    // Update form when gouvernorat changes - fetch real weather data
    useEffect(() => {
        const fetchWeatherForGouvernorat = async () => {
            if (!formData.gouvernorat) return;

            setIsLoadingWeather(true);

            // Find governorate ID
            const gouv = gouvernoratsData.gouvernorats.find(g => g.name === formData.gouvernorat);
            const govId = gouv?.id || formData.gouvernorat.toLowerCase().replace(/ /g, '-');

            try {
                // Fetch real weather data
                const weather = await weatherService.getWeather(govId, language);
                setDataSource(weather.source || 'API');

                // Calculate risk indices
                const risks = weatherService.calculateRiskIndices(weather);

                // Detect alerts for this governorate
                const alerts = smartAlertService.detectAlerts(weather, govId, formData.gouvernorat, language);
                setDetectedAlerts(alerts);

                // Get weather description for sky state
                const getSkyState = (code) => {
                    if ([0, 1].includes(code)) return 'clair';
                    if ([2, 3].includes(code)) return 'nuageux';
                    if ([45, 48].includes(code)) return 'brumeux';
                    if ([95, 96, 99].includes(code)) return 'orageux';
                    return 'couvert';
                };

                // Auto-fill form with real data
                setFormData(prev => ({
                    ...prev,
                    gouvernoratId: govId,
                    region: gouv?.region || '',

                    // Current weather
                    temperatureActuelle: String(weather.temperature || ''),
                    temperatureMin: String((weather.temperature || 0) - 3),
                    temperatureMax: String((weather.temperature || 0) + 4),
                    humidite: String(weather.humidity || ''),
                    pression: String(weather.pressure || ''),
                    ventDirection: weather.wind_direction || 'N',
                    ventVitesse: String(weather.wind_speed || ''),
                    ventRafales: String(weather.wind_gusts || ''),
                    precipitations: (weather.precipitation || 0) > 0 ? 'oui' : 'non',
                    precipitationsQuantite: (weather.precipitation || 0) > 0 ? String(weather.precipitation) : '',
                    visibilite: (weather.visibility || 10) < 5 ? 'reduite' : 'normale',
                    visibiliteKm: String(weather.visibility || 10),
                    etatCiel: getSkyState(weather.weather_code),

                    // Update alert level from risk
                    niveauAlerte: risks.overall_alert_level,

                    // Auto-detect phenomena based on weather
                    pluiesIntenses: (weather.precipitation || 0) > 30,
                    orages: [95, 96, 99].includes(weather.weather_code),
                    brouillard: [45, 48].includes(weather.weather_code) || (weather.visibility || 10) < 1,
                    vagueChaleur: (weather.temperature || 0) > 38,
                    vagueFroid: (weather.temperature || 0) < 5,

                    // Set phenomenon concerned based on alerts
                    phenomeneConcerne: alerts.length > 0 ? alerts.map(a => a.title).join(', ') : '',

                    // Source
                    sourceDonnees: `${weather.source} + INM (${new Date().toLocaleTimeString(language === 'ar' ? 'ar-TN' : 'fr-TN', { hour: '2-digit', minute: '2-digit' })})`
                }));

            } catch (error) {
                console.error('Error fetching weather:', error);
                // Fallback to mock data
                const mockWeather = weatherMockData.current_conditions[govId];
                const mockRisk = weatherMockData.risk_indices[govId];

                if (mockWeather) {
                    setFormData(prev => ({
                        ...prev,
                        gouvernoratId: govId,
                        region: gouv?.region || '',
                        temperatureMin: String((mockWeather.temperature || 20) - 4),
                        temperatureMax: String((mockWeather.temperature || 20) + 2),
                        ventDirection: mockWeather.wind_direction || 'N',
                        ventVitesse: String(mockWeather.wind_speed || ''),
                        ventRafales: String(mockWeather.wind_gusts || ''),
                        precipitations: (mockWeather.precipitation || 0) > 0 ? 'oui' : 'non',
                        precipitationsQuantite: (mockWeather.precipitation || 0) > 0 ? String(mockWeather.precipitation) : '',
                        niveauAlerte: mockRisk?.overall_alert_level || 'vert'
                    }));
                }
                setDataSource('Simulation');
            }

            setIsLoadingWeather(false);
        };

        fetchWeatherForGouvernorat();
    }, [formData.gouvernorat, language]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (field) => {
        setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // Handle multiple image uploads
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Limit to 5 images total
        const remainingSlots = 5 - uploadedImages.length;
        const filesToProcess = files.slice(0, remainingSlots);

        filesToProcess.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImages(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    data: reader.result,
                    name: file.name
                }]);
            };
            reader.readAsDataURL(file);
        });

        // Reset input
        e.target.value = '';
    };

    const removeImage = (imageId) => {
        setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    };

    const removeAllImages = () => {
        setUploadedImages([]);
    };

    const getAlertColor = (level) => {
        const colors = {
            'vert': '#10B981',
            'jaune': '#F59E0B',
            'orange': '#F97316',
            'rouge': '#EF4444'
        };
        return colors[level] || '#10B981';
    };

    const getPhenomenesText = () => {
        const phenomenes = [];
        if (formData.pluiesIntenses) phenomenes.push('Pluies intenses');
        if (formData.orages) phenomenes.push('Orages');
        if (formData.brouillard) phenomenes.push('Brouillard');
        if (formData.sablePoussiere) phenomenes.push('Sable ou poussière');
        if (formData.vagueChaleur) phenomenes.push('Vague de chaleur');
        if (formData.vagueFroid) phenomenes.push('Vague de froid');

        if (phenomenes.length === 0) return 'Néant';
        return phenomenes.join(', ') + (formData.phenomenesDetails ? ` - ${formData.phenomenesDetails}` : '');
    };

    const generatePDF = async () => {
        setIsGenerating(true);

        const element = reportRef.current;
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `Rapport_Meteo_${formData.gouvernorat || 'Tunisie'}_${formData.date.replace(/\//g, '-')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            }
        };

        try {
            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error('Error generating PDF:', error);
        }

        setIsGenerating(false);
    };

    return (
        <div className="reports-page animate-fadeIn">
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
                        <FileText size={28} style={{ color: 'var(--primary)' }} />
                        Générateur de Rapport Météorologique
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)' }}>
                        Créez et téléchargez votre rapport de situation météorologique
                    </p>
                </div>
                <button
                    className="btn btn-primary btn-lg"
                    onClick={generatePDF}
                    disabled={isGenerating}
                    style={{ minWidth: '180px' }}
                >
                    {isGenerating ? (
                        <>
                            <Loader size={18} className="spin" />
                            Génération...
                        </>
                    ) : (
                        <>
                            <Download size={18} />
                            Télécharger PDF
                        </>
                    )}
                </button>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
                {/* Form Section */}
                <div style={{ flex: '1', maxWidth: '500px' }}>
                    {/* Section 1: Informations générales */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <h3 style={{
                            color: 'var(--primary)',
                            marginBottom: 'var(--spacing-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)'
                        }}>
                            <MapPin size={18} />
                            1. Informations Générales
                        </h3>

                        <div className="form-group">
                            <label className="form-label">Gouvernorat *</label>
                            <select
                                className="form-select"
                                value={formData.gouvernorat}
                                onChange={(e) => handleInputChange('gouvernorat', e.target.value)}
                            >
                                <option value="">Sélectionner un gouvernorat</option>
                                {gouvernoratsData.gouvernorats.map(g => (
                                    <option key={g.id} value={g.name}>{g.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Région</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.region}
                                onChange={(e) => handleInputChange('region', e.target.value)}
                                placeholder="Auto-rempli selon le gouvernorat"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div className="form-group">
                                <label className="form-label">Date</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Période de validité</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.periodeValidite}
                                    onChange={(e) => handleInputChange('periodeValidite', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Source des données</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.sourceDonnees}
                                onChange={(e) => handleInputChange('sourceDonnees', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Section 2: Situation météorologique actuelle */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <h3 style={{
                            color: 'var(--primary)',
                            marginBottom: 'var(--spacing-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)'
                        }}>
                            <Cloud size={18} />
                            2. Situation Météorologique Actuelle
                        </h3>

                        <div className="form-group">
                            <label className="form-label">État du ciel</label>
                            <select
                                className="form-select"
                                value={formData.etatCiel}
                                onChange={(e) => handleInputChange('etatCiel', e.target.value)}
                            >
                                <option value="clair">Clair</option>
                                <option value="nuageux">Nuageux</option>
                                <option value="couvert">Couvert</option>
                                <option value="brumeux">Brumeux</option>
                                <option value="orageux">Orageux</option>
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div className="form-group">
                                <label className="form-label">Temp. Min (°C)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.temperatureMin}
                                    onChange={(e) => handleInputChange('temperatureMin', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Temp. Max (°C)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.temperatureMax}
                                    onChange={(e) => handleInputChange('temperatureMax', e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div className="form-group">
                                <label className="form-label">Vent Direction</label>
                                <select
                                    className="form-select"
                                    value={formData.ventDirection}
                                    onChange={(e) => handleInputChange('ventDirection', e.target.value)}
                                >
                                    {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Vitesse (km/h)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.ventVitesse}
                                    onChange={(e) => handleInputChange('ventVitesse', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Rafales (km/h)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.ventRafales}
                                    onChange={(e) => handleInputChange('ventRafales', e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div className="form-group">
                                <label className="form-label">Précipitations</label>
                                <select
                                    className="form-select"
                                    value={formData.precipitations}
                                    onChange={(e) => handleInputChange('precipitations', e.target.value)}
                                >
                                    <option value="non">Non</option>
                                    <option value="oui">Oui</option>
                                </select>
                            </div>
                            {formData.precipitations === 'oui' && (
                                <div className="form-group">
                                    <label className="form-label">Quantité (mm)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.precipitationsQuantite}
                                        onChange={(e) => handleInputChange('precipitationsQuantite', e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Visibilité</label>
                            <select
                                className="form-select"
                                value={formData.visibilite}
                                onChange={(e) => handleInputChange('visibilite', e.target.value)}
                            >
                                <option value="normale">Normale</option>
                                <option value="reduite">Réduite</option>
                            </select>
                        </div>
                    </div>

                    {/* Section 3: Phénomènes remarquables */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <h3 style={{
                            color: 'var(--primary)',
                            marginBottom: 'var(--spacing-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)'
                        }}>
                            <AlertTriangle size={18} />
                            3. Phénomènes Météorologiques Remarquables
                        </h3>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 'var(--spacing-sm)',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            {[
                                { key: 'pluiesIntenses', label: 'Pluies intenses' },
                                { key: 'orages', label: 'Orages' },
                                { key: 'brouillard', label: 'Brouillard' },
                                { key: 'sablePoussiere', label: 'Sable ou poussière' },
                                { key: 'vagueChaleur', label: 'Vague de chaleur' },
                                { key: 'vagueFroid', label: 'Vague de froid' }
                            ].map(item => (
                                <label key={item.key} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-sm)',
                                    padding: 'var(--spacing-sm)',
                                    background: formData[item.key] ? 'rgba(227, 27, 35, 0.1)' : 'var(--surface-light)',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    border: formData[item.key] ? '1px solid var(--primary)' : '1px solid transparent'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={formData[item.key]}
                                        onChange={() => handleCheckboxChange(item.key)}
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                                        {item.label}
                                    </span>
                                </label>
                            ))}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Détails supplémentaires</label>
                            <textarea
                                className="form-textarea"
                                value={formData.phenomenesDetails}
                                onChange={(e) => handleInputChange('phenomenesDetails', e.target.value)}
                                placeholder="Détails sur les phénomènes observés..."
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Section 4: Prévisions 24h */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <h3 style={{
                            color: 'var(--primary)',
                            marginBottom: 'var(--spacing-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)'
                        }}>
                            <Clock size={18} />
                            4. Prévisions Météorologiques (24h)
                        </h3>

                        <div className="form-group">
                            <label className="form-label">Évolution de l'état du ciel</label>
                            <textarea
                                className="form-textarea"
                                value={formData.previsionCiel}
                                onChange={(e) => handleInputChange('previsionCiel', e.target.value)}
                                placeholder="Ex: Passage de nuageux à partiellement couvert..."
                                rows={2}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div className="form-group">
                                <label className="form-label">Temp. Min prévue (°C)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.previsionTempMin}
                                    onChange={(e) => handleInputChange('previsionTempMin', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Temp. Max prévue (°C)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.previsionTempMax}
                                    onChange={(e) => handleInputChange('previsionTempMax', e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div className="form-group">
                                <label className="form-label">Vent prévu (direction)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.previsionVentDirection}
                                    onChange={(e) => handleInputChange('previsionVentDirection', e.target.value)}
                                    placeholder="Ex: NW à N"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Vent prévu (intensité)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.previsionVentIntensite}
                                    onChange={(e) => handleInputChange('previsionVentIntensite', e.target.value)}
                                    placeholder="Ex: Modéré à fort"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div className="form-group">
                                <label className="form-label">Précip. probabilité</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.previsionPrecipProbabilite}
                                    onChange={(e) => handleInputChange('previsionPrecipProbabilite', e.target.value)}
                                    placeholder="Ex: 70%"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Précip. intensité</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.previsionPrecipIntensite}
                                    onChange={(e) => handleInputChange('previsionPrecipIntensite', e.target.value)}
                                    placeholder="Ex: Modérée"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Niveau de vigilance */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <h3 style={{
                            color: 'var(--primary)',
                            marginBottom: 'var(--spacing-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)'
                        }}>
                            <AlertTriangle size={18} />
                            5. Niveau de Vigilance
                        </h3>

                        <div className="form-group">
                            <label className="form-label">Niveau d'alerte</label>
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                {['vert', 'jaune', 'orange', 'rouge'].map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => handleInputChange('niveauAlerte', level)}
                                        style={{
                                            flex: 1,
                                            padding: 'var(--spacing-md)',
                                            border: formData.niveauAlerte === level ? `2px solid ${getAlertColor(level)}` : '1px solid var(--border)',
                                            borderRadius: 'var(--radius-md)',
                                            background: formData.niveauAlerte === level ? `${getAlertColor(level)}20` : 'var(--surface)',
                                            color: getAlertColor(level),
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            textTransform: 'uppercase',
                                            fontSize: 'var(--font-size-sm)'
                                        }}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phénomène concerné</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.phenomeneConcerne}
                                onChange={(e) => handleInputChange('phenomeneConcerne', e.target.value)}
                                placeholder="Ex: Inondation, Vent violent..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Période de vigilance</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.periodeVigilance}
                                onChange={(e) => handleInputChange('periodeVigilance', e.target.value)}
                                placeholder="Ex: 06/01/2025 18h00 - 07/01/2025 06h00"
                            />
                        </div>
                    </div>

                    {/* Section 6: Impacts potentiels */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <h3 style={{
                            color: 'var(--primary)',
                            marginBottom: 'var(--spacing-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)'
                        }}>
                            <AlertTriangle size={18} />
                            6. Impacts Potentiels
                        </h3>

                        <div className="form-group">
                            <label className="form-label">Circulation et transport</label>
                            <textarea
                                className="form-textarea"
                                value={formData.impactCirculation}
                                onChange={(e) => handleInputChange('impactCirculation', e.target.value)}
                                placeholder="Impacts sur les routes, transports..."
                                rows={2}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Activités agricoles</label>
                            <textarea
                                className="form-textarea"
                                value={formData.impactAgricole}
                                onChange={(e) => handleInputChange('impactAgricole', e.target.value)}
                                placeholder="Impacts sur l'agriculture..."
                                rows={2}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Activités maritimes (si zone côtière)</label>
                            <textarea
                                className="form-textarea"
                                value={formData.impactMaritime}
                                onChange={(e) => handleInputChange('impactMaritime', e.target.value)}
                                placeholder="Impacts sur les activités maritimes..."
                                rows={2}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Risques pour la population</label>
                            <textarea
                                className="form-textarea"
                                value={formData.risquesPopulation}
                                onChange={(e) => handleInputChange('risquesPopulation', e.target.value)}
                                placeholder="Risques identifiés pour la population..."
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Image Upload Section - Multiple Photos */}
                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <h3 style={{
                            color: 'var(--primary)',
                            marginBottom: 'var(--spacing-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <Image size={18} />
                                Photos / Images ({uploadedImages.length}/5)
                            </span>
                            {uploadedImages.length > 0 && (
                                <button
                                    onClick={removeAllImages}
                                    className="btn btn-ghost"
                                    style={{ fontSize: 'var(--font-size-xs)', color: 'var(--alert-red)' }}
                                >
                                    Tout supprimer
                                </button>
                            )}
                        </h3>

                        {/* Upload area */}
                        {uploadedImages.length < 5 && (
                            <label style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 'var(--spacing-lg)',
                                border: '2px dashed var(--border)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)',
                                marginBottom: uploadedImages.length > 0 ? 'var(--spacing-md)' : 0
                            }}>
                                <Image size={32} style={{ color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }} />
                                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                    Cliquez pour ajouter des images
                                </span>
                                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                                    PNG, JPG • Max 5 photos • Sélection multiple possible
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        )}

                        {/* Images grid */}
                        {uploadedImages.length > 0 && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                gap: 'var(--spacing-sm)'
                            }}>
                                {uploadedImages.map((img) => (
                                    <div
                                        key={img.id}
                                        style={{
                                            position: 'relative',
                                            borderRadius: 'var(--radius-md)',
                                            overflow: 'hidden',
                                            aspectRatio: '1',
                                            border: '1px solid var(--border)'
                                        }}
                                    >
                                        <img
                                            src={img.data}
                                            alt={img.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <button
                                            onClick={() => removeImage(img.id)}
                                            style={{
                                                position: 'absolute',
                                                top: '4px',
                                                right: '4px',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: 'var(--alert-red)',
                                                border: 'none',
                                                color: 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                opacity: 0.9
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: '4px',
                                            background: 'rgba(0,0,0,0.6)',
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'white',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {img.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Section */}
                <div style={{ flex: '1.2' }}>
                    <div style={{
                        position: 'sticky',
                        top: 'calc(var(--header-height) + var(--spacing-lg))'
                    }}>
                        <h3 style={{
                            color: 'var(--text-primary)',
                            marginBottom: 'var(--spacing-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)'
                        }}>
                            <Eye size={18} />
                            Aperçu du Rapport
                        </h3>

                        {/* PDF Preview */}
                        <div
                            ref={reportRef}
                            style={{
                                background: 'white',
                                color: '#1a1a1a',
                                padding: '40px',
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: 'var(--shadow-xl)',
                                fontFamily: 'Arial, sans-serif',
                                fontSize: '11px',
                                lineHeight: '1.5'
                            }}
                        >
                            {/* Header with Logo */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '3px solid #E31B23',
                                paddingBottom: '15px',
                                marginBottom: '20px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        background: '#E31B23',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '24px',
                                        fontWeight: 'bold'
                                    }}>
                                        ☪
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#E31B23' }}>
                                            CROISSANT ROUGE TUNISIEN
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>
                                            Équipe Nationale de Réponse aux Catastrophes (NDRT)
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '10px', color: '#666' }}>Date du rapport</div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{formData.date}</div>
                                </div>
                            </div>

                            {/* Title */}
                            <div style={{
                                textAlign: 'center',
                                padding: '15px',
                                background: '#f5f5f5',
                                marginBottom: '20px',
                                borderLeft: '4px solid #E31B23'
                            }}>
                                <h1 style={{
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    color: '#E31B23',
                                    margin: 0
                                }}>
                                    RAPPORT DE SITUATION MÉTÉOROLOGIQUE QUOTIDIEN
                                </h1>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '5px' }}>
                                    Région : {formData.region || '___________'} - {formData.gouvernorat || '___________'}
                                </div>
                            </div>

                            {/* Section 1 */}
                            <div style={{ marginBottom: '15px' }}>
                                <h2 style={{
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    color: '#E31B23',
                                    borderBottom: '1px solid #E31B23',
                                    paddingBottom: '5px',
                                    marginBottom: '10px'
                                }}>
                                    1. INFORMATIONS GÉNÉRALES
                                </h2>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '5px', width: '40%', fontWeight: 'bold' }}>Région / Gouvernorats concernés :</td>
                                            <td style={{ padding: '5px' }}>{formData.region} / {formData.gouvernorat}</td>
                                        </tr>
                                        <tr style={{ background: '#f9f9f9' }}>
                                            <td style={{ padding: '5px', fontWeight: 'bold' }}>Date :</td>
                                            <td style={{ padding: '5px' }}>{formData.date}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '5px', fontWeight: 'bold' }}>Période de validité :</td>
                                            <td style={{ padding: '5px' }}>{formData.periodeValidite}</td>
                                        </tr>
                                        <tr style={{ background: '#f9f9f9' }}>
                                            <td style={{ padding: '5px', fontWeight: 'bold' }}>Source des données :</td>
                                            <td style={{ padding: '5px' }}>{formData.sourceDonnees}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Section 2 */}
                            <div style={{ marginBottom: '15px' }}>
                                <h2 style={{
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    color: '#E31B23',
                                    borderBottom: '1px solid #E31B23',
                                    paddingBottom: '5px',
                                    marginBottom: '10px'
                                }}>
                                    2. SITUATION MÉTÉOROLOGIQUE ACTUELLE
                                </h2>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '5px', width: '40%', fontWeight: 'bold' }}>État du ciel :</td>
                                            <td style={{ padding: '5px', textTransform: 'capitalize' }}>{formData.etatCiel}</td>
                                        </tr>
                                        <tr style={{ background: '#f9f9f9' }}>
                                            <td style={{ padding: '5px', fontWeight: 'bold' }}>Températures observées :</td>
                                            <td style={{ padding: '5px' }}>Min: {formData.temperatureMin}°C / Max: {formData.temperatureMax}°C</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '5px', fontWeight: 'bold' }}>Vent :</td>
                                            <td style={{ padding: '5px' }}>
                                                Direction {formData.ventDirection}, {formData.ventVitesse} km/h
                                                {formData.ventRafales && `, rafales jusqu'à ${formData.ventRafales} km/h`}
                                            </td>
                                        </tr>
                                        <tr style={{ background: '#f9f9f9' }}>
                                            <td style={{ padding: '5px', fontWeight: 'bold' }}>Précipitations observées :</td>
                                            <td style={{ padding: '5px' }}>
                                                {formData.precipitations === 'oui'
                                                    ? `Oui - ${formData.precipitationsQuantite} mm`
                                                    : 'Non'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '5px', fontWeight: 'bold' }}>Visibilité :</td>
                                            <td style={{ padding: '5px', textTransform: 'capitalize' }}>{formData.visibilite}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Section 3 */}
                            <div style={{ marginBottom: '15px' }}>
                                <h2 style={{
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    color: '#E31B23',
                                    borderBottom: '1px solid #E31B23',
                                    paddingBottom: '5px',
                                    marginBottom: '10px'
                                }}>
                                    3. PHÉNOMÈNES MÉTÉOROLOGIQUES REMARQUABLES
                                </h2>
                                <p style={{ padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                                    {getPhenomenesText()}
                                </p>
                            </div>

                            {/* Section 4 */}
                            <div style={{ marginBottom: '15px' }}>
                                <h2 style={{
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    color: '#E31B23',
                                    borderBottom: '1px solid #E31B23',
                                    paddingBottom: '5px',
                                    marginBottom: '10px'
                                }}>
                                    4. PRÉVISIONS MÉTÉOROLOGIQUES (24 HEURES)
                                </h2>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '5px', width: '40%', fontWeight: 'bold' }}>Évolution de l'état du ciel :</td>
                                            <td style={{ padding: '5px' }}>{formData.previsionCiel || '-'}</td>
                                        </tr>
                                        <tr style={{ background: '#f9f9f9' }}>
                                            <td style={{ padding: '5px', fontWeight: 'bold' }}>Températures prévues :</td>
                                            <td style={{ padding: '5px' }}>Min: {formData.previsionTempMin || '-'}°C / Max: {formData.previsionTempMax || '-'}°C</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '5px', fontWeight: 'bold' }}>Vent prévu :</td>
                                            <td style={{ padding: '5px' }}>{formData.previsionVentDirection || '-'}, {formData.previsionVentIntensite || '-'}</td>
                                        </tr>
                                        <tr style={{ background: '#f9f9f9' }}>
                                            <td style={{ padding: '5px', fontWeight: 'bold' }}>Précipitations attendues :</td>
                                            <td style={{ padding: '5px' }}>
                                                Probabilité: {formData.previsionPrecipProbabilite || '-'},
                                                Intensité: {formData.previsionPrecipIntensite || '-'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Section 5 - Alert Level */}
                            <div style={{ marginBottom: '15px' }}>
                                <h2 style={{
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    color: '#E31B23',
                                    borderBottom: '1px solid #E31B23',
                                    paddingBottom: '5px',
                                    marginBottom: '10px'
                                }}>
                                    5. NIVEAU DE VIGILANCE
                                </h2>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    padding: '15px',
                                    background: `${getAlertColor(formData.niveauAlerte)}20`,
                                    border: `2px solid ${getAlertColor(formData.niveauAlerte)}`,
                                    borderRadius: '8px'
                                }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        background: getAlertColor(formData.niveauAlerte),
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        textTransform: 'uppercase'
                                    }}>
                                        {formData.niveauAlerte}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>Phénomène concerné : {formData.phenomeneConcerne || '-'}</div>
                                        <div>Période de vigilance : {formData.periodeVigilance || '-'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 6 */}
                            <div style={{ marginBottom: '15px' }}>
                                <h2 style={{
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    color: '#E31B23',
                                    borderBottom: '1px solid #E31B23',
                                    paddingBottom: '5px',
                                    marginBottom: '10px'
                                }}>
                                    6. IMPACTS POTENTIELS
                                </h2>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '8px', width: '30%', fontWeight: 'bold', verticalAlign: 'top' }}>Circulation et transport :</td>
                                            <td style={{ padding: '8px' }}>{formData.impactCirculation || '-'}</td>
                                        </tr>
                                        <tr style={{ background: '#f9f9f9' }}>
                                            <td style={{ padding: '8px', fontWeight: 'bold', verticalAlign: 'top' }}>Activités agricoles :</td>
                                            <td style={{ padding: '8px' }}>{formData.impactAgricole || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '8px', fontWeight: 'bold', verticalAlign: 'top' }}>Activités maritimes :</td>
                                            <td style={{ padding: '8px' }}>{formData.impactMaritime || '-'}</td>
                                        </tr>
                                        <tr style={{ background: '#f9f9f9' }}>
                                            <td style={{ padding: '8px', fontWeight: 'bold', verticalAlign: 'top' }}>Risques pour la population :</td>
                                            <td style={{ padding: '8px' }}>{formData.risquesPopulation || '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Images if uploaded */}
                            {uploadedImages.length > 0 && (
                                <div style={{ marginBottom: '15px' }}>
                                    <h2 style={{
                                        fontSize: '13px',
                                        fontWeight: 'bold',
                                        color: '#E31B23',
                                        borderBottom: '1px solid #E31B23',
                                        paddingBottom: '5px',
                                        marginBottom: '10px'
                                    }}>
                                        DOCUMENTATION PHOTO ({uploadedImages.length} photo{uploadedImages.length > 1 ? 's' : ''})
                                    </h2>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: uploadedImages.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                                        gap: '10px'
                                    }}>
                                        {uploadedImages.map((img, index) => (
                                            <div key={img.id} style={{ position: 'relative' }}>
                                                <img
                                                    src={img.data}
                                                    alt={`Documentation ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        maxHeight: uploadedImages.length === 1 ? '200px' : '120px',
                                                        objectFit: 'cover',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '4px',
                                                    left: '4px',
                                                    background: 'rgba(0,0,0,0.6)',
                                                    color: 'white',
                                                    padding: '2px 6px',
                                                    borderRadius: '3px',
                                                    fontSize: '8px'
                                                }}>
                                                    Photo {index + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div style={{
                                marginTop: '20px',
                                paddingTop: '15px',
                                borderTop: '2px solid #E31B23',
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '9px',
                                color: '#666'
                            }}>
                                <div>
                                    <strong>Croissant Rouge Tunisien - NDRT</strong><br />
                                    Système Gestion Météo et Rapport de Situation
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    Document généré le {new Date().toLocaleString('fr-TN')}<br />
                                    <span style={{ color: '#E31B23' }}>www.croissant-rouge.tn</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default Reports;
