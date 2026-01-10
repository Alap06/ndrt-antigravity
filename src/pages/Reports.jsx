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
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [adminCode, setAdminCode] = useState('');
    const [isDownloadingAll, setIsDownloadingAll] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);

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
        agentName: '',
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

    // Generate concise weather description
    const generateDescription = (weather) => {
        const temp = weather.temperatureActuelle || weather.temperature;
        const wind = weather.ventVitesse || weather.wind_speed;
        const precip = weather.precipitations === 'oui' || (weather.precipitation && weather.precipitation > 0);

        let desc = `Température ${temp}°C`;
        if (wind) desc += `, vent ${wind} km/h`;
        if (precip) desc += ', précipitations prévues';
        return desc;
    };

    // Admin: Download all reports for all gouvernorats
    const ADMIN_CODE = 'NDRT026a';

    const generateAllReports = async () => {
        if (adminCode !== ADMIN_CODE) {
            alert('Code administrateur incorrect');
            return;
        }

        setIsDownloadingAll(true);
        setDownloadProgress(0);

        const allGouvernorats = gouvernoratsData.gouvernorats;
        const totalReports = allGouvernorats.length;
        const allWeatherData = {};
        const allAlerts = [];
        const governorateReports = [];

        // Phase 1: Fetch all weather data
        for (let i = 0; i < allGouvernorats.length; i++) {
            const gouv = allGouvernorats[i];
            setDownloadProgress(Math.round(((i + 1) / totalReports) * 50));

            try {
                const weather = await weatherService.getWeather(gouv.id, language);
                const risks = weatherService.calculateRiskIndices(weather);
                allWeatherData[gouv.id] = { ...weather, risks };

                // Detect alerts for this governorate
                const govAlerts = smartAlertService.detectAlerts(weather, gouv.id, gouv.name, 'fr');
                allAlerts.push(...govAlerts);

                governorateReports.push({
                    gouv,
                    weather,
                    risks,
                    alerts: govAlerts,
                    hasData: true
                });
            } catch (error) {
                governorateReports.push({
                    gouv,
                    weather: null,
                    risks: null,
                    alerts: [],
                    hasData: false
                });
            }

            await new Promise(resolve => setTimeout(resolve, 150));
        }

        // Calculate statistics
        const alertStats = smartAlertService.getAlertStats(allAlerts);
        const criticalGovs = governorateReports.filter(r => r.risks?.overall_alert_level === 'rouge');
        const orangeGovs = governorateReports.filter(r => r.risks?.overall_alert_level === 'orange');
        const yellowGovs = governorateReports.filter(r => r.risks?.overall_alert_level === 'jaune');
        const greenGovs = governorateReports.filter(r => r.risks?.overall_alert_level === 'vert');

        // Phase 2: Generate PDF HTML
        setDownloadProgress(60);

        const getAlertColorHex = (level) => {
            const colors = { rouge: '#EF4444', orange: '#F97316', jaune: '#F59E0B', vert: '#10B981' };
            return colors[level] || '#10B981';
        };

        const getPhenomenesFromWeather = (weather) => {
            if (!weather) return 'Néant';
            const phenomenes = [];
            if (weather.precipitation > 0) phenomenes.push('Précipitations');
            if (weather.wind_gusts > 60) phenomenes.push('Vents violents');
            if (weather.wind_gusts > 40) phenomenes.push('Vents forts');
            if (weather.temperature > 35) phenomenes.push('Chaleur élevée');
            if (weather.temperature < 5) phenomenes.push('Froid');
            return phenomenes.length > 0 ? phenomenes.join(', ') : 'Néant';
        };

        let combinedHTML = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <!-- Page 1: Cover & Summary -->
                <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #E31B23; padding-bottom: 30px;">
                    <img src="/src/assets/NDRT.png" style="height: 80px; margin-bottom: 15px;" alt="NDRT" onerror="this.style.display='none'"/>
                    <h1 style="color: #E31B23; font-size: 24px; margin: 10px 0;">RAPPORT DE SITUATION MÉTÉOROLOGIQUE CONSOLIDÉ</h1>
                    <h2 style="color: #666; font-size: 16px; margin: 5px 0;">Croissant Rouge Tunisien - Direction Nationale NDRT</h2>
                    <p style="font-size: 14px; color: #888;">République Tunisienne</p>
                </div>

                <!-- Metadata Box -->
                <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                    <table style="width: 100%; color: white; font-size: 13px;">
                        <tr>
                            <td style="padding: 8px 0;"><strong>📅 Date du rapport:</strong></td>
                            <td>${formattedDate}</td>
                            <td style="padding-left: 30px;"><strong>⏰ Période de validité:</strong></td>
                            <td>00h00 - 24h00</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;"><strong>🌐 Source des données:</strong></td>
                            <td>Open-Meteo API + INM</td>
                            <td style="padding-left: 30px;"><strong>📊 Gouvernorats analysés:</strong></td>
                            <td>${totalReports}</td>
                        </tr>
                        ${formData.agentName ? `<tr><td style="padding: 8px 0;"><strong>👤 Agent:</strong></td><td colspan="3">${formData.agentName}</td></tr>` : ''}
                    </table>
                </div>

                <!-- Alert Summary -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #E31B23; border-bottom: 2px solid #E31B23; padding-bottom: 10px; font-size: 18px;">🚨 SYNTHÈSE DES ALERTES</h3>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-top: 15px;">
                        <div style="flex: 1; min-width: 120px; background: linear-gradient(135deg, #EF4444, #DC2626); color: white; padding: 15px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 28px; font-weight: bold;">${criticalGovs.length}</div>
                            <div style="font-size: 12px;">Niveau ROUGE</div>
                        </div>
                        <div style="flex: 1; min-width: 120px; background: linear-gradient(135deg, #F97316, #EA580C); color: white; padding: 15px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 28px; font-weight: bold;">${orangeGovs.length}</div>
                            <div style="font-size: 12px;">Niveau ORANGE</div>
                        </div>
                        <div style="flex: 1; min-width: 120px; background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 15px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 28px; font-weight: bold;">${yellowGovs.length}</div>
                            <div style="font-size: 12px;">Niveau JAUNE</div>
                        </div>
                        <div style="flex: 1; min-width: 120px; background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 15px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 28px; font-weight: bold;">${greenGovs.length}</div>
                            <div style="font-size: 12px;">Niveau VERT</div>
                        </div>
                    </div>
                </div>

                <!-- Active Alerts Details -->
                ${allAlerts.length > 0 ? `
                <div style="margin-bottom: 30px; page-break-inside: avoid;">
                    <h3 style="color: #E31B23; border-bottom: 2px solid #E31B23; padding-bottom: 10px; font-size: 18px;">⚠️ ALERTES ACTIVES (${allAlerts.length})</h3>
                    ${allAlerts.slice(0, 10).map(alert => `
                        <div style="background: ${alert.severity === 'rouge' ? 'rgba(239,68,68,0.1)' : alert.severity === 'orange' ? 'rgba(249,115,22,0.1)' : 'rgba(245,158,11,0.1)'}; border-left: 4px solid ${getAlertColorHex(alert.severity)}; padding: 12px; margin: 10px 0; border-radius: 0 8px 8px 0;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <strong style="color: ${getAlertColorHex(alert.severity)};">${alert.title}</strong>
                                <span style="background: ${getAlertColorHex(alert.severity)}; color: white; padding: 2px 10px; border-radius: 12px; font-size: 11px;">${alert.severity.toUpperCase()}</span>
                            </div>
                            <div style="font-size: 12px; color: #666; margin-top: 5px;">📍 ${alert.gouvernorat} | ${alert.description} | ${alert.measurement}</div>
                        </div>
                    `).join('')}
                    ${allAlerts.length > 10 ? `<p style="font-style: italic; color: #666; font-size: 12px;">Et ${allAlerts.length - 10} autres alertes...</p>` : ''}
                </div>
                ` : ''}

                <!-- Critical & Orange Governorates Quick View -->
                ${criticalGovs.length > 0 || orangeGovs.length > 0 ? `
                <div style="margin-bottom: 30px; page-break-inside: avoid;">
                    <h3 style="color: #E31B23; border-bottom: 2px solid #E31B23; padding-bottom: 10px; font-size: 18px;">🔴 GOUVERNORATS À VIGILANCE ÉLEVÉE</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 15px;">
                        <thead>
                            <tr style="background: #1e3a5f; color: white;">
                                <th style="padding: 10px; text-align: left;">Gouvernorat</th>
                                <th style="padding: 10px; text-align: left;">Région</th>
                                <th style="padding: 10px; text-align: center;">Niveau</th>
                                <th style="padding: 10px; text-align: center;">Temp.</th>
                                <th style="padding: 10px; text-align: center;">Précip.</th>
                                <th style="padding: 10px; text-align: center;">Vent</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${[...criticalGovs, ...orangeGovs].map(r => `
                                <tr style="border-bottom: 1px solid #ddd;">
                                    <td style="padding: 8px;"><strong>${r.gouv.name}</strong></td>
                                    <td style="padding: 8px;">${r.gouv.region}</td>
                                    <td style="padding: 8px; text-align: center;"><span style="background: ${getAlertColorHex(r.risks?.overall_alert_level)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px;">${(r.risks?.overall_alert_level || 'N/A').toUpperCase()}</span></td>
                                    <td style="padding: 8px; text-align: center;">${r.weather?.temperature || '-'}°C</td>
                                    <td style="padding: 8px; text-align: center;">${r.weather?.precipitation || 0} mm</td>
                                    <td style="padding: 8px; text-align: center;">${r.weather?.wind_speed || '-'} km/h</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}

                <!-- Page Break -->
                <div style="page-break-before: always;"></div>

                <!-- Detailed Reports for Each Governorate -->
                <h2 style="color: #E31B23; text-align: center; margin: 30px 0; font-size: 20px;">📋 RAPPORTS DÉTAILLÉS PAR GOUVERNORAT</h2>
        `;

        // Add each governorate report
        setDownloadProgress(70);
        governorateReports.forEach((report, i) => {
            const { gouv, weather, risks, alerts, hasData } = report;

            combinedHTML += `
                <div style="page-break-inside: avoid; border: 1px solid #ddd; padding: 20px; margin-bottom: 20px; border-radius: 10px; background: ${!hasData ? '#fff5f5' : 'white'};">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${getAlertColorHex(risks?.overall_alert_level || 'vert')}; padding-bottom: 10px; margin-bottom: 15px;">
                        <h3 style="color: #1e3a5f; margin: 0; font-size: 16px;">
                            <span style="color: #E31B23;">${String(i + 1).padStart(2, '0')}.</span> ${gouv.name}
                        </h3>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 12px; color: #666;">${gouv.region}</span>
                            <span style="background: ${getAlertColorHex(risks?.overall_alert_level || 'vert')}; color: white; padding: 4px 12px; border-radius: 15px; font-size: 11px; font-weight: bold;">${(risks?.overall_alert_level || 'VERT').toUpperCase()}</span>
                        </div>
                    </div>

                    ${hasData ? `
                    <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 6px; border: 1px solid #eee; width: 25%; background: #f9f9f9;"><strong>🌡️ Température</strong></td>
                            <td style="padding: 6px; border: 1px solid #eee; width: 25%;">${weather.temperature || '-'}°C</td>
                            <td style="padding: 6px; border: 1px solid #eee; width: 25%; background: #f9f9f9;"><strong>💧 Humidité</strong></td>
                            <td style="padding: 6px; border: 1px solid #eee; width: 25%;">${weather.humidity || '-'}%</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px; border: 1px solid #eee; background: #f9f9f9;"><strong>💨 Vent</strong></td>
                            <td style="padding: 6px; border: 1px solid #eee;">${weather.wind_speed || '-'} km/h (${weather.wind_direction || '-'})</td>
                            <td style="padding: 6px; border: 1px solid #eee; background: #f9f9f9;"><strong>💨 Rafales</strong></td>
                            <td style="padding: 6px; border: 1px solid #eee;">${weather.wind_gusts || '-'} km/h</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px; border: 1px solid #eee; background: #f9f9f9;"><strong>🌧️ Précipitations</strong></td>
                            <td style="padding: 6px; border: 1px solid #eee;">${weather.precipitation || 0} mm</td>
                            <td style="padding: 6px; border: 1px solid #eee; background: #f9f9f9;"><strong>☁️ Couverture</strong></td>
                            <td style="padding: 6px; border: 1px solid #eee;">${weather.cloud_cover || '-'}%</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px; border: 1px solid #eee; background: #f9f9f9;"><strong>🌤️ Conditions</strong></td>
                            <td style="padding: 6px; border: 1px solid #eee;" colspan="3">${weather.weather_description || 'Non disponible'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px; border: 1px solid #eee; background: #f9f9f9;"><strong>⚠️ Phénomènes</strong></td>
                            <td style="padding: 6px; border: 1px solid #eee;" colspan="3">${getPhenomenesFromWeather(weather)}</td>
                        </tr>
                    </table>

                    ${alerts.length > 0 ? `
                    <div style="margin-top: 10px; background: rgba(239,68,68,0.05); padding: 10px; border-radius: 5px;">
                        <strong style="color: #E31B23; font-size: 11px;">Alertes actives:</strong>
                        <ul style="margin: 5px 0; padding-left: 20px; font-size: 10px; color: #666;">
                            ${alerts.map(a => `<li>${a.title} - ${a.measurement}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}

                    <div style="margin-top: 10px; font-size: 10px; color: #888;">
                        <strong>Indices de risque:</strong> Inondation: ${risks?.flood_risk || 0}% | Vent: ${risks?.wind_risk || 0}% | Température: ${risks?.temperature_risk || 0}%
                    </div>
                    ` : `
                    <p style="color: #666; text-align: center; font-style: italic;">⚠️ Données météorologiques non disponibles pour ce gouvernorat</p>
                    `}
                </div>
            `;
        });

        setDownloadProgress(85);

        // Footer
        combinedHTML += `
                <!-- Footer -->
                <div style="margin-top: 40px; padding-top: 20px; border-top: 3px solid #E31B23; text-align: center;">
                    <img src="/src/assets/NDRT.png" style="height: 50px; margin-bottom: 10px; opacity: 0.8;" alt="NDRT" onerror="this.style.display='none'"/>
                    <p style="font-size: 13px; color: #E31B23; font-weight: bold;">Croissant Rouge Tunisien - NDRT</p>
                    <p style="font-size: 11px; color: #666;">Direction Nationale de la Réponse aux Catastrophes</p>
                    <p style="font-size: 10px; color: #888;">Document généré le ${new Date().toLocaleString('fr-TN')} | Source: Open-Meteo API</p>
                    <p style="font-size: 9px; color: #aaa; margin-top: 10px;">Ce rapport est généré automatiquement à des fins de surveillance et de préparation aux situations d'urgence.</p>
                </div>
            </div>
        `;

        // Create PDF
        setDownloadProgress(90);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = combinedHTML;
        document.body.appendChild(tempDiv);

        try {
            const opt = {
                margin: [10, 10, 15, 10],
                filename: `Rapport_Consolide_24_Gouvernorats_${formattedDate.replace(/\//g, '-')}.pdf`,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: { scale: 1.5, useCORS: true, letterRendering: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            await html2pdf().set(opt).from(tempDiv).save();
            setDownloadProgress(100);
        } finally {
            document.body.removeChild(tempDiv);
        }

        setIsDownloadingAll(false);
        setShowAdminModal(false);
        setAdminCode('');
    };

    const generatePDF = async () => {
        setIsGenerating(true);

        const element = reportRef.current;
        const filename = `Rapport_Meteo_${formData.gouvernorat || 'Tunisie'}_${formData.date.replace(/\//g, '-')}.pdf`;

        const opt = {
            margin: [10, 10, 10, 10],
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                logging: false
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            }
        };

        try {
            // Générer le PDF comme blob pour une meilleure compatibilité mobile
            const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');

            // Créer une URL pour le blob
            const blobUrl = URL.createObjectURL(pdfBlob);

            // Détecter si c'est un appareil mobile
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            // Méthode 1: Créer un lien de téléchargement
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;

            // Sur mobile, certains navigateurs ne supportent pas l'attribut download
            // On essaie quand même le téléchargement direct d'abord
            if (!isMobile) {
                // Desktop: téléchargement direct
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // Mobile: essayer plusieurs méthodes
                try {
                    // Essayer d'abord le téléchargement
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Si le téléchargement ne fonctionne pas bien, offrir l'option d'ouverture
                    setTimeout(() => {
                        // Afficher une notification pour informer l'utilisateur
                        if (window.confirm(
                            language === 'ar'
                                ? 'هل تم تحميل الـ PDF؟ إذا لم يكن كذلك، اضغط OK لفتحه في نافذة جديدة.'
                                : language === 'en'
                                    ? 'Did the PDF download? If not, click OK to open it in a new tab.'
                                    : 'Le PDF a-t-il été téléchargé ? Sinon, cliquez OK pour l\'ouvrir dans un nouvel onglet.'
                        )) {
                            // Ouvrir dans un nouvel onglet comme fallback
                            window.open(blobUrl, '_blank');
                        }
                    }, 1000);
                } catch (mobileError) {
                    console.log('Mobile download fallback:', mobileError);
                    // Fallback: ouvrir directement dans un nouvel onglet
                    window.open(blobUrl, '_blank');
                }
            }

            // Nettoyer l'URL après un délai
            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 10000);

        } catch (error) {
            console.error('Error generating PDF:', error);

            // Fallback final: essayer la méthode originale
            try {
                await html2pdf().set(opt).from(element).save();
            } catch (fallbackError) {
                console.error('Fallback PDF generation also failed:', fallbackError);
                alert(
                    language === 'ar'
                        ? 'خطأ في إنشاء PDF. يرجى المحاولة مرة أخرى.'
                        : language === 'en'
                            ? 'Error generating PDF. Please try again.'
                            : 'Erreur lors de la génération du PDF. Veuillez réessayer.'
                );
            }
        }

        setIsGenerating(false);
    };

    return (
        <div className="reports-page animate-fadeIn">
            {/* Header */}
            <div className="reports-header" style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-lg)'
            }}>
                <div style={{ flex: '1', minWidth: '250px' }}>
                    <h1 style={{
                        fontSize: 'clamp(1.2rem, 3vw, var(--font-size-2xl))',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)'
                    }}>
                        <FileText size={28} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span>Générateur de Rapport</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                        Créez et téléchargez votre rapport de situation météorologique
                    </p>
                </div>
                <div className="reports-actions" style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-primary"
                        onClick={generatePDF}
                        disabled={isGenerating}
                        style={{ minWidth: '140px' }}
                    >
                        {isGenerating ? (
                            <>
                                <Loader size={16} className="spin" />
                                Génération...
                            </>
                        ) : (
                            <>
                                <Download size={16} />
                                Télécharger PDF
                            </>
                        )}
                    </button>
                    <button
                        className="btn btn-ghost"
                        onClick={() => setShowAdminModal(true)}
                        style={{ minWidth: '130px' }}
                        title="Télécharger tous les rapports (Admin)"
                    >
                        <FileText size={16} />
                        Admin (24)
                    </button>
                </div>
            </div>

            <div className="reports-content" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-lg)' }}>
                {/* Form Section */}
                <div className="reports-form" style={{ flex: '1 1 350px', minWidth: '300px', maxWidth: '100%' }}>
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
                            <label className="form-label">Nom de l'Agent</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.agentName}
                                onChange={(e) => handleInputChange('agentName', e.target.value)}
                                placeholder="Nom de l'agent rédacteur du rapport"
                            />
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
                <div className="reports-preview" style={{ flex: '1 1 400px', minWidth: '320px' }}>
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
                            className="pdf-preview"
                            style={{
                                background: 'white',
                                color: '#1a1a1a',
                                padding: 'clamp(15px, 3vw, 40px)',
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: 'var(--shadow-xl)',
                                fontFamily: 'Arial, sans-serif',
                                fontSize: 'clamp(9px, 1.5vw, 11px)',
                                lineHeight: '1.5',
                                maxWidth: '100%',
                                overflow: 'auto'
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
                                    <img
                                        src="/src/assets/NDRT.png"
                                        alt="NDRT"
                                        style={{
                                            width: '70px',
                                            height: 'auto',
                                            objectFit: 'contain'
                                        }}
                                    />
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
                                        {formData.agentName && (
                                            <tr>
                                                <td style={{ padding: '5px', fontWeight: 'bold' }}>Rédigé par :</td>
                                                <td style={{ padding: '5px' }}>{formData.agentName}</td>
                                            </tr>
                                        )}
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
        
        /* Responsive Styles */
        @media (max-width: 1200px) {
          .reports-content {
            flex-direction: column !important;
          }
          .reports-form,
          .reports-preview {
            flex: 1 1 100% !important;
            max-width: 100% !important;
            min-width: unset !important;
          }
          .reports-preview > div {
            position: relative !important;
            top: 0 !important;
          }
        }
        
        @media (max-width: 768px) {
          .reports-header {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .reports-header > div:first-child {
            text-align: center;
          }
          .reports-actions {
            justify-content: center !important;
            width: 100%;
          }
          .reports-actions button {
            flex: 1;
            min-width: 120px !important;
          }
          .pdf-preview {
            padding: 15px !important;
            font-size: 10px !important;
          }
          .card {
            padding: var(--spacing-md) !important;
          }
        }
        
        @media (max-width: 480px) {
          .reports-page {
            padding: var(--spacing-sm) !important;
          }
          .reports-actions {
            flex-direction: column !important;
          }
          .reports-actions button {
            width: 100% !important;
          }
          .pdf-preview {
            padding: 10px !important;
            font-size: 9px !important;
          }
          .form-group {
            margin-bottom: var(--spacing-sm) !important;
          }
        }
      `}</style>

            {/* Admin Modal */}
            {showAdminModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'var(--surface)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--spacing-xl)',
                        maxWidth: '450px',
                        width: '90%',
                        boxShadow: 'var(--shadow-xl)'
                    }}>
                        <h3 style={{ color: 'var(--primary)', marginBottom: 'var(--spacing-md)' }}>
                            Téléchargement Admin - Tous les Gouvernorats
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>
                            Cette fonction génère un rapport consolidé pour les <strong>24 gouvernorats</strong> de Tunisie avec les données météo actuelles de l'API Open-Meteo.
                        </p>

                        {!isDownloadingAll ? (
                            <>
                                <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                                    <label className="form-label">Code Administrateur</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={adminCode}
                                        onChange={(e) => setAdminCode(e.target.value)}
                                        placeholder="Entrez le code admin"
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => { setShowAdminModal(false); setAdminCode(''); }}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={generateAllReports}
                                        disabled={!adminCode}
                                    >
                                        <Download size={16} />
                                        Télécharger (24 rapports)
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                                <Loader size={32} className="spin" style={{ color: 'var(--primary)', marginBottom: 'var(--spacing-md)' }} />
                                <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                    Génération en cours... {downloadProgress}%
                                </p>
                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    background: 'var(--surface-light)',
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    marginTop: 'var(--spacing-sm)'
                                }}>
                                    <div style={{
                                        width: `${downloadProgress}%`,
                                        height: '100%',
                                        background: 'var(--primary)',
                                        transition: 'width 0.3s ease'
                                    }} />
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-sm)' }}>
                                    Récupération des données météo pour tous les gouvernorats...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div >
    );
};

export default Reports;
