// Smart Weather Alerts Detection Service
// Automatically detects dangerous weather conditions from real data

export const ALERT_THRESHOLDS = {
    // Temperature thresholds
    heatwave: { min: 40, severity: 'rouge', type: 'canicule' },
    hot: { min: 35, severity: 'orange', type: 'chaleur' },
    cold: { max: 2, severity: 'orange', type: 'froid' },
    freezing: { max: 0, severity: 'rouge', type: 'gel' },

    // Precipitation thresholds (mm)
    heavyRain: { min: 30, severity: 'rouge', type: 'pluie_intense' },
    moderateRain: { min: 15, severity: 'orange', type: 'pluie_forte' },
    lightRain: { min: 5, severity: 'jaune', type: 'pluie' },

    // Wind thresholds (km/h)
    storm: { min: 90, severity: 'rouge', type: 'tempete' },
    strongWind: { min: 60, severity: 'orange', type: 'vent_violent' },
    moderateWind: { min: 40, severity: 'jaune', type: 'vent_fort' },

    // Visibility thresholds (km)
    denseFog: { max: 0.2, severity: 'rouge', type: 'brouillard_dense' },
    fog: { max: 1, severity: 'orange', type: 'brouillard' },
    mist: { max: 3, severity: 'jaune', type: 'brume' },

    // Humidity thresholds
    extremeHumidity: { min: 95, severity: 'jaune', type: 'humidite_extreme' }
};

// Alert translations
export const ALERT_TRANSLATIONS = {
    canicule: {
        fr: { title: 'Canicule', description: 'Vague de chaleur extrême' },
        ar: { title: 'موجة حر', description: 'موجة حر شديدة' },
        en: { title: 'Heatwave', description: 'Extreme heat wave' }
    },
    chaleur: {
        fr: { title: 'Forte Chaleur', description: 'Températures élevées' },
        ar: { title: 'حرارة شديدة', description: 'درجات حرارة مرتفعة' },
        en: { title: 'High Heat', description: 'High temperatures' }
    },
    froid: {
        fr: { title: 'Vague de Froid', description: 'Températures très basses' },
        ar: { title: 'موجة برد', description: 'درجات حرارة منخفضة جداً' },
        en: { title: 'Cold Wave', description: 'Very low temperatures' }
    },
    gel: {
        fr: { title: 'Gel', description: 'Risque de gel et verglas' },
        ar: { title: 'صقيع', description: 'خطر الصقيع والجليد' },
        en: { title: 'Frost', description: 'Risk of frost and ice' }
    },
    pluie_intense: {
        fr: { title: 'Pluies Intenses', description: 'Risque d\'inondation' },
        ar: { title: 'أمطار غزيرة', description: 'خطر الفيضانات' },
        en: { title: 'Heavy Rain', description: 'Flood risk' }
    },
    pluie_forte: {
        fr: { title: 'Fortes Pluies', description: 'Précipitations importantes' },
        ar: { title: 'أمطار قوية', description: 'هطول أمطار كثيفة' },
        en: { title: 'Strong Rain', description: 'Significant precipitation' }
    },
    pluie: {
        fr: { title: 'Pluie', description: 'Précipitations modérées' },
        ar: { title: 'أمطار', description: 'هطول أمطار معتدلة' },
        en: { title: 'Rain', description: 'Moderate precipitation' }
    },
    tempete: {
        fr: { title: 'Tempête', description: 'Vents très violents' },
        ar: { title: 'عاصفة', description: 'رياح عنيفة جداً' },
        en: { title: 'Storm', description: 'Very violent winds' }
    },
    vent_violent: {
        fr: { title: 'Vent Violent', description: 'Rafales dangereuses' },
        ar: { title: 'رياح عنيفة', description: 'هبات خطيرة' },
        en: { title: 'Violent Wind', description: 'Dangerous gusts' }
    },
    vent_fort: {
        fr: { title: 'Vent Fort', description: 'Rafales importantes' },
        ar: { title: 'رياح قوية', description: 'هبات كبيرة' },
        en: { title: 'Strong Wind', description: 'Significant gusts' }
    },
    brouillard_dense: {
        fr: { title: 'Brouillard Dense', description: 'Visibilité quasi nulle' },
        ar: { title: 'ضباب كثيف', description: 'رؤية شبه معدومة' },
        en: { title: 'Dense Fog', description: 'Near-zero visibility' }
    },
    brouillard: {
        fr: { title: 'Brouillard', description: 'Visibilité réduite' },
        ar: { title: 'ضباب', description: 'رؤية منخفضة' },
        en: { title: 'Fog', description: 'Reduced visibility' }
    },
    brume: {
        fr: { title: 'Brume', description: 'Légère réduction de visibilité' },
        ar: { title: 'ضباب خفيف', description: 'انخفاض طفيف في الرؤية' },
        en: { title: 'Mist', description: 'Slight visibility reduction' }
    },
    orage: {
        fr: { title: 'Orage', description: 'Activité orageuse' },
        ar: { title: 'عاصفة رعدية', description: 'نشاط رعدي' },
        en: { title: 'Thunderstorm', description: 'Storm activity' }
    },
    humidite_extreme: {
        fr: { title: 'Humidité Extrême', description: 'Conditions très humides' },
        ar: { title: 'رطوبة شديدة', description: 'ظروف رطبة جداً' },
        en: { title: 'Extreme Humidity', description: 'Very humid conditions' }
    }
};

// Recommendations for each alert type
export const ALERT_RECOMMENDATIONS = {
    canicule: {
        fr: ['Restez au frais', 'Hydratez-vous régulièrement', 'Évitez les activités extérieures'],
        ar: ['ابق في مكان بارد', 'اشرب الماء بانتظام', 'تجنب الأنشطة الخارجية'],
        en: ['Stay cool', 'Stay hydrated', 'Avoid outdoor activities']
    },
    pluie_intense: {
        fr: ['Évitez les déplacements', 'Ne traversez pas les zones inondées', 'Préparez les équipements d\'urgence'],
        ar: ['تجنب التنقل', 'لا تعبر المناطق المغمورة', 'جهز معدات الطوارئ'],
        en: ['Avoid travel', 'Do not cross flooded areas', 'Prepare emergency equipment']
    },
    tempete: {
        fr: ['Restez à l\'intérieur', 'Sécurisez les objets extérieurs', 'Éloignez-vous des arbres'],
        ar: ['ابق في الداخل', 'أمّن الأغراض الخارجية', 'ابتعد عن الأشجار'],
        en: ['Stay indoors', 'Secure outdoor objects', 'Stay away from trees']
    },
    brouillard_dense: {
        fr: ['Réduisez la vitesse', 'Utilisez les feux de brouillard', 'Augmentez les distances de sécurité'],
        ar: ['قلل السرعة', 'استخدم أضواء الضباب', 'زد مسافات الأمان'],
        en: ['Reduce speed', 'Use fog lights', 'Increase safety distances']
    }
};

class SmartAlertService {
    constructor() {
        this.detectedAlerts = [];
    }

    // Detect alerts from weather data
    detectAlerts(weatherData, gouvernoratId, gouvernoratName, lang = 'fr') {
        const alerts = [];
        const now = new Date();

        if (!weatherData) return alerts;

        // Check temperature
        if (weatherData.temperature >= ALERT_THRESHOLDS.heatwave.min) {
            alerts.push(this.createAlert('canicule', 'rouge', weatherData, gouvernoratId, gouvernoratName, lang, {
                value: weatherData.temperature,
                unit: '°C'
            }));
        } else if (weatherData.temperature >= ALERT_THRESHOLDS.hot.min) {
            alerts.push(this.createAlert('chaleur', 'orange', weatherData, gouvernoratId, gouvernoratName, lang, {
                value: weatherData.temperature,
                unit: '°C'
            }));
        } else if (weatherData.temperature <= ALERT_THRESHOLDS.freezing.max) {
            alerts.push(this.createAlert('gel', 'rouge', weatherData, gouvernoratId, gouvernoratName, lang, {
                value: weatherData.temperature,
                unit: '°C'
            }));
        } else if (weatherData.temperature <= ALERT_THRESHOLDS.cold.max) {
            alerts.push(this.createAlert('froid', 'orange', weatherData, gouvernoratId, gouvernoratName, lang, {
                value: weatherData.temperature,
                unit: '°C'
            }));
        }

        // Check precipitation
        if (weatherData.precipitation >= ALERT_THRESHOLDS.heavyRain.min) {
            alerts.push(this.createAlert('pluie_intense', 'rouge', weatherData, gouvernoratId, gouvernoratName, lang, {
                value: weatherData.precipitation,
                unit: 'mm'
            }));
        } else if (weatherData.precipitation >= ALERT_THRESHOLDS.moderateRain.min) {
            alerts.push(this.createAlert('pluie_forte', 'orange', weatherData, gouvernoratId, gouvernoratName, lang, {
                value: weatherData.precipitation,
                unit: 'mm'
            }));
        } else if (weatherData.precipitation >= ALERT_THRESHOLDS.lightRain.min) {
            alerts.push(this.createAlert('pluie', 'jaune', weatherData, gouvernoratId, gouvernoratName, lang, {
                value: weatherData.precipitation,
                unit: 'mm'
            }));
        }

        // Check wind
        const windSpeed = weatherData.wind_gusts || weatherData.wind_speed;
        if (windSpeed >= ALERT_THRESHOLDS.storm.min) {
            alerts.push(this.createAlert('tempete', 'rouge', weatherData, gouvernoratId, gouvernoratName, lang, {
                value: windSpeed,
                unit: 'km/h'
            }));
        } else if (windSpeed >= ALERT_THRESHOLDS.strongWind.min) {
            alerts.push(this.createAlert('vent_violent', 'orange', weatherData, gouvernoratId, gouvernoratName, lang, {
                value: windSpeed,
                unit: 'km/h'
            }));
        } else if (windSpeed >= ALERT_THRESHOLDS.moderateWind.min) {
            alerts.push(this.createAlert('vent_fort', 'jaune', weatherData, gouvernoratId, gouvernoratName, lang, {
                value: windSpeed,
                unit: 'km/h'
            }));
        }

        // Check visibility
        if (weatherData.visibility !== undefined) {
            if (weatherData.visibility <= ALERT_THRESHOLDS.denseFog.max) {
                alerts.push(this.createAlert('brouillard_dense', 'rouge', weatherData, gouvernoratId, gouvernoratName, lang, {
                    value: weatherData.visibility,
                    unit: 'km'
                }));
            } else if (weatherData.visibility <= ALERT_THRESHOLDS.fog.max) {
                alerts.push(this.createAlert('brouillard', 'orange', weatherData, gouvernoratId, gouvernoratName, lang, {
                    value: weatherData.visibility,
                    unit: 'km'
                }));
            } else if (weatherData.visibility <= ALERT_THRESHOLDS.mist.max) {
                alerts.push(this.createAlert('brume', 'jaune', weatherData, gouvernoratId, gouvernoratName, lang, {
                    value: weatherData.visibility,
                    unit: 'km'
                }));
            }
        }

        // Check weather codes for thunderstorms
        if ([95, 96, 99].includes(weatherData.weather_code)) {
            alerts.push(this.createAlert('orage', 'rouge', weatherData, gouvernoratId, gouvernoratName, lang, {
                value: weatherData.weather_description,
                unit: ''
            }));
        }

        return alerts;
    }

    // Create alert object
    createAlert(type, severity, weatherData, gouvernoratId, gouvernoratName, lang, measurement) {
        const translations = ALERT_TRANSLATIONS[type] || ALERT_TRANSLATIONS.pluie;
        const recommendations = ALERT_RECOMMENDATIONS[type] || ALERT_RECOMMENDATIONS.pluie_intense;
        const now = new Date();

        return {
            id: `${type}-${gouvernoratId}-${now.getTime()}`,
            type,
            severity,
            gouvernoratId,
            gouvernorat: gouvernoratName,
            title: translations[lang]?.title || translations.fr.title,
            description: translations[lang]?.description || translations.fr.description,
            measurement: `${measurement.value} ${measurement.unit}`,
            recommendations: recommendations[lang] || recommendations.fr,
            timestamp: now.toISOString(),
            startTime: now.toLocaleTimeString(lang === 'ar' ? 'ar-TN' : 'fr-TN', { hour: '2-digit', minute: '2-digit' }),
            isRealTime: weatherData.isRealData || false,
            source: weatherData.source || 'Simulation'
        };
    }

    // Detect alerts for all governorates
    detectAllAlerts(allWeatherData, gouvernoratsInfo, lang = 'fr') {
        const allAlerts = [];

        Object.entries(allWeatherData).forEach(([id, weather]) => {
            const govInfo = gouvernoratsInfo.find(g => g.id === id);
            const name = govInfo?.name || id;

            const govAlerts = this.detectAlerts(weather, id, name, lang);
            allAlerts.push(...govAlerts);
        });

        // Sort by severity (rouge > orange > jaune > vert)
        const severityOrder = { rouge: 0, orange: 1, jaune: 2, vert: 3 };
        allAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

        return allAlerts;
    }

    // Get alert statistics
    getAlertStats(alerts) {
        return {
            total: alerts.length,
            rouge: alerts.filter(a => a.severity === 'rouge').length,
            orange: alerts.filter(a => a.severity === 'orange').length,
            jaune: alerts.filter(a => a.severity === 'jaune').length,
            vert: alerts.filter(a => a.severity === 'vert').length,
            byType: alerts.reduce((acc, alert) => {
                acc[alert.type] = (acc[alert.type] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

export const smartAlertService = new SmartAlertService();
export default smartAlertService;
