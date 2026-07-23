'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Loader2, Calendar, Clock, Video, Heart, AlertCircle, FileText, Plus, BookOpen, 
  Smile, Droplet, Coffee, Activity, Cloud, Sun, CloudRain, Wind, ShieldCheck, 
  Search, RefreshCw, CheckCircle2, ChevronRight, Sparkles, CheckSquare, Square, 
  Flame, ListTodo, MapPin, Award
} from 'lucide-react';

interface DinacharyaTask {
  id: string;
  name: string;
  sanskrit: string;
  desc: string;
  benefit: string;
  period: 'morning' | 'afternoon' | 'evening';
}

const DINACHARYA_TASKS: DinacharyaTask[] = [
  // Morning
  {
    id: 'ushapana',
    name: 'Ushapana (Warm Water)',
    sanskrit: 'उषःपान',
    desc: 'Drink 1-2 glasses of warm water on an empty stomach.',
    benefit: 'Ignites Agni (digestive fire) and flushes out metabolic waste (Ama).',
    period: 'morning'
  },
  {
    id: 'jihva',
    name: 'Jihva Nirlekhan (Tongue Scraping)',
    sanskrit: 'जिह्वा निर्लेखन',
    desc: 'Scrape tongue from back to front 7-10 times using copper or steel.',
    benefit: 'Clears toxic coating, stimulates salivary glands, and alerts internal organs.',
    period: 'morning'
  },
  {
    id: 'gandusha',
    name: 'Gandusha (Oil Pulling)',
    sanskrit: 'गण्डूष',
    desc: 'Swish 1 tbsp of cold-pressed sesame or coconut oil for 5-10 minutes.',
    benefit: 'Strengthens teeth/gums, brightens skin, and extracts fat-soluble toxins.',
    period: 'morning'
  },
  {
    id: 'pranayama',
    name: 'Pranayama & Dhyana',
    sanskrit: 'प्राणायाम',
    desc: 'Perform Nadi Shodhana (Alternate Nostril) & 5 mins meditation.',
    benefit: 'Balances left/right brain hemispheres and calms the nervous system.',
    period: 'morning'
  },
  {
    id: 'abhyanga',
    name: 'Abhyanga (Warm Oil Massage)',
    sanskrit: 'अभ्यङ्ग',
    desc: 'Perform gentle self-massage with warm sesame/coconut oil before bath.',
    benefit: 'Stimulates circulation, delays aging, and releases muscle fatigue.',
    period: 'morning'
  },
  // Afternoon
  {
    id: 'shatapadi',
    name: 'Shatapadi (Post-Meal Walk)',
    sanskrit: 'शतपदी',
    desc: 'Take exactly 100 paces gently after having a mindful lunch.',
    benefit: 'Aids peristalsis, prevents blood sugar spikes, and aligns heavy lunch.',
    period: 'afternoon'
  },
  {
    id: 'afternoon_hydrate',
    name: 'CCF Tea (Warm Hydration)',
    sanskrit: 'उष्ण जल',
    desc: 'Sip warm Cumin-Coriander-Fennel tea to aid mid-day heat.',
    benefit: 'Balances Pitta metabolic energy and prevents afternoon bloating.',
    period: 'afternoon'
  },
  // Evening/Night
  {
    id: 'light_dinner',
    name: 'Laghu Ahar (Light Dinner)',
    sanskrit: 'लघु आहार',
    desc: 'Consume a freshly cooked warm light dinner before 8:00 PM.',
    benefit: 'Allows the liver and intestines to detoxify properly overnight.',
    period: 'evening'
  },
  {
    id: 'triphala',
    name: 'Triphala / Turmeric Milk',
    sanskrit: 'त्रिफला / हरिद्रा क्षीर',
    desc: 'Take 1/2 tsp Triphala churna with warm water or drink warm golden milk.',
    benefit: 'Regulates bowel movements and serves as a powerful antioxidant.',
    period: 'evening'
  },
  {
    id: 'digital_detox',
    name: 'Digital Detox',
    sanskrit: 'निद्रा पूर्व ध्यान',
    desc: 'Shut down all screens (phone, laptop) 1 hour before sleep.',
    benefit: 'Increases natural melatonin production and calms active brain state.',
    period: 'evening'
  }
];

const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  'new delhi': { lat: 28.6139, lon: 77.2090 },
  'delhi': { lat: 28.6139, lon: 77.2090 },
  'mumbai': { lat: 19.0760, lon: 72.8777 },
  'bengaluru': { lat: 12.9716, lon: 77.5946 },
  'bangalore': { lat: 12.9716, lon: 77.5946 },
  'kolkata': { lat: 22.5726, lon: 88.3639 },
  'chennai': { lat: 13.0827, lon: 80.2707 },
  'hyderabad': { lat: 17.3850, lon: 78.4867 },
  'pune': { lat: 18.5204, lon: 73.8567 },
  'london': { lat: 51.5074, lon: -0.1278 },
  'new york': { lat: 40.7128, lon: -74.0060 },
  'san francisco': { lat: 37.7749, lon: -122.4194 }
};

export default function PatientDashboard() {
  const { user } = useAuth();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [records, setRecords] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Wellness Tracker log states
  const [sleepHours, setSleepHours] = useState('7');
  const [waterIntake, setWaterIntake] = useState('2.5');
  const [mood, setMood] = useState('Good');
  const [digestion, setDigestion] = useState('Normal');
  const [trackerLogs, setTrackerLogs] = useState<any[]>([]);
  const [trackerSuccess, setTrackerSuccess] = useState('');
  const [trackerLoading, setTrackerLoading] = useState(false);

  // Redesign tabs: 'wellness' | 'prescriptions' | 'records'
  const [activeTab, setActiveTab] = useState<'wellness' | 'prescriptions' | 'records'>('wellness');

  // Weather States
  const [city, setCity] = useState('New Delhi');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherAiAdvice, setWeatherAiAdvice] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [citySearchInput, setCitySearchInput] = useState('');

  // Checklist Tasks & Streak state
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [selectedTaskPeriod, setSelectedTaskPeriod] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  
  const todayStr = new Date().toISOString().split('T')[0];

  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const fetchData = async () => {
    try {
      // 1. Fetch appointments
      const apptRes = await fetch('/api/patient/appointments');
      if (apptRes.ok) {
        const json = await apptRes.json();
        setAppointments(json.appointments);
      }

      // 2. Fetch medical records (prescriptions + reports)
      const recordsRes = await fetch('/api/patient/records');
      if (recordsRes.ok) {
        const json = await recordsRes.json();
        setRecords(json);
      }

      // 3. Fetch wellness logs
      const logsRes = await fetch('/api/patient/wellness');
      if (logsRes.ok) {
        const json = await logsRes.json();
        setTrackerLogs(json.logs);
      }
    } catch (e) {
      console.error('Failed to sync patient dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Precise Geolocation-Based Weather Fetching
  const detectLocationAndWeather = () => {
    if (!navigator.geolocation) {
      fetchWeatherAndAiAdvice(city);
      return;
    }
    
    setWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // 1. Reverse Geocode City via Nominatim (OSM)
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'User-Agent': 'VedaSync-AI-App' } }
          );
          
          let detectedCity = 'My Location';
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            detectedCity = geoData.address.city || geoData.address.town || geoData.address.suburb || geoData.address.state || 'My Location';
          }
          
          setCity(detectedCity);
          setCitySearchInput(detectedCity);
          localStorage.setItem('vedasync_city', detectedCity);
          
          // 2. Fetch current weather from Open-Meteo
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
          );
          
          let temp = 25;
          let humidity = 60;
          let wCode = 0;
          let windSpeed = 10;

          if (weatherRes.ok) {
            const data = await weatherRes.json();
            temp = Math.round(data.current?.temperature_2m ?? 25);
            humidity = Math.round(data.current?.relative_humidity_2m ?? 60);
            wCode = data.current?.weather_code ?? 0;
            windSpeed = Math.round(data.current?.wind_speed_10m ?? 10);
            
            setWeatherData({ temp, humidity, wCode, windSpeed, city: detectedCity });
          }

          // Weather condition string
          let condition = 'Clear Sky';
          if (wCode >= 1 && wCode <= 3) condition = 'Partly Cloudy';
          else if (wCode >= 45 && wCode <= 48) condition = 'Foggy';
          else if (wCode >= 51 && wCode <= 67) condition = 'Rainy';
          else if (wCode >= 80 && wCode <= 82) condition = 'Rain Showers';
          else if (wCode >= 95) condition = 'Thunderstorm';

          // Call weather AI
          const aiRes = await fetch('/api/patient/weather-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ temp, humidity, condition, city: detectedCity })
          });

          if (aiRes.ok) {
            const json = await aiRes.json();
            if (json.success && json.data) {
              setWeatherAiAdvice(json.data);
            }
          }
        } catch (err) {
          console.error('Error Reverse Geocoding / Weather AI fetch:', err);
        } finally {
          setWeatherLoading(false);
        }
      },
      (err) => {
        console.warn('Geolocation access failed. Falling back to default:', err);
        fetchWeatherAndAiAdvice(city);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchWeatherAndAiAdvice = async (targetCity: string) => {
    setWeatherLoading(true);
    try {
      const cityKey = targetCity.toLowerCase().trim();
      const coords = CITY_COORDINATES[cityKey] || { lat: 28.6139, lon: 77.2090 }; // default Delhi
      
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
      );
      
      let temp = 25;
      let humidity = 60;
      let wCode = 0;
      let windSpeed = 10;

      if (weatherRes.ok) {
        const data = await weatherRes.json();
        temp = Math.round(data.current?.temperature_2m ?? 25);
        humidity = Math.round(data.current?.relative_humidity_2m ?? 60);
        wCode = data.current?.weather_code ?? 0;
        windSpeed = Math.round(data.current?.wind_speed_10m ?? 10);
        
        setWeatherData({ temp, humidity, wCode, windSpeed, city: targetCity });
      } else {
        setWeatherData({ temp, humidity, wCode, windSpeed, city: targetCity });
      }

      let condition = 'Clear Sky';
      if (wCode >= 1 && wCode <= 3) condition = 'Partly Cloudy';
      else if (wCode >= 45 && wCode <= 48) condition = 'Foggy';
      else if (wCode >= 51 && wCode <= 67) condition = 'Rainy';
      else if (wCode >= 80 && wCode <= 82) condition = 'Rain Showers';
      else if (wCode >= 95) condition = 'Thunderstorm';

      const aiRes = await fetch('/api/patient/weather-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temp, humidity, condition, city: targetCity })
      });

      if (aiRes.ok) {
        const json = await aiRes.json();
        if (json.success && json.data) {
          setWeatherAiAdvice(json.data);
        }
      }
    } catch (err) {
      console.error('Error fetching weather data / Weather AI:', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Check local storage for city
    const storedCity = localStorage.getItem('vedasync_city') || 'New Delhi';
    setCity(storedCity);
    setCitySearchInput(storedCity);

    // Initial weather loads (Attempts browser geolocation first)
    detectLocationAndWeather();

    // Load completed tasks
    const storedTasksKey = `vedasync_tasks_${todayStr}`;
    const storedTasks = localStorage.getItem(storedTasksKey);
    if (storedTasks) {
      setCompletedTasks(JSON.parse(storedTasks));
    }

    // Streak Check on Load
    const streakCountVal = parseInt(localStorage.getItem('vedasync_streak_count') || '0', 10);
    const lastDate = localStorage.getItem('vedasync_streak_last_date') || '';
    const yesterdayStr = getYesterdayStr();

    if (lastDate && lastDate !== todayStr && lastDate !== yesterdayStr) {
      // Streak broken!
      setStreakCount(0);
      localStorage.setItem('vedasync_streak_count', '0');
    } else {
      setStreakCount(streakCountVal);
    }
  }, []);

  const handleCitySearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearchInput.trim()) return;
    setCity(citySearchInput);
    localStorage.setItem('vedasync_city', citySearchInput);
    fetchWeatherAndAiAdvice(citySearchInput);
  };

  const toggleTask = (taskId: string) => {
    const isCompleted = completedTasks.includes(taskId);
    let newCompleted: string[];
    
    if (isCompleted) {
      newCompleted = completedTasks.filter(id => id !== taskId);
    } else {
      newCompleted = [...completedTasks, taskId];
    }
    
    setCompletedTasks(newCompleted);
    localStorage.setItem(`vedasync_tasks_${todayStr}`, JSON.stringify(newCompleted));

    // Handle Streak Progress: if they complete all 10 tasks, increase streak!
    const allCompletedNow = DINACHARYA_TASKS.every(task => newCompleted.includes(task.id));
    if (allCompletedNow) {
      const lastDate = localStorage.getItem('vedasync_streak_last_date') || '';
      const yesterdayStr = getYesterdayStr();

      if (lastDate !== todayStr) {
        let newStreak = 1;
        if (lastDate === yesterdayStr) {
          newStreak = streakCount + 1;
        }
        setStreakCount(newStreak);
        localStorage.setItem('vedasync_streak_count', newStreak.toString());
        localStorage.setItem('vedasync_streak_last_date', todayStr);
      }
    }
  };

  const handleWellnessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackerSuccess('');
    setTrackerLoading(true);

    try {
      const res = await fetch('/api/patient/wellness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sleepHours, waterIntake, mood, digestion }),
      });

      if (res.ok) {
        setTrackerSuccess('Wellness log saved!');
        fetchData();
        setTimeout(() => setTrackerSuccess(''), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTrackerLoading(false);
    }
  };

  // Find next upcoming confirmed active appointment
  const nextAppt = appointments.find((appt) => {
    if (appt.status !== 'CONFIRMED') return false;
    const scheduledTime = new Date(appt.scheduledAt).getTime();
    const expiryTime = scheduledTime + (90 * 60 * 1000); // 90 min window
    return Date.now() < expiryTime;
  });

  const activePrescriptions = records?.prescriptions?.filter((p: any) => p.status === 'ACTIVE') || [];
  const reports = records?.labReports || [];

  // Weather Icon Helper
  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="w-8 h-8 text-amber-500 animate-spin" style={{ animationDuration: '10s' }} />;
    if (code >= 1 && code <= 3) return <Cloud className="w-8 h-8 text-sky-400" />;
    if (code >= 51 && code <= 82) return <CloudRain className="w-8 h-8 text-primary-500 animate-bounce" />;
    return <Sun className="w-8 h-8 text-amber-500" />;
  };

  // Tasks display filters
  const filteredTasks = DINACHARYA_TASKS.filter(task => {
    if (selectedTaskPeriod === 'all') return true;
    return task.period === selectedTaskPeriod;
  });

  const completionPercentage = Math.round((completedTasks.length / DINACHARYA_TASKS.length) * 100);

  return (
    <div className="space-y-8 animate-fadeIn font-sans text-slate-800" id="vedasync-patient-dashboard">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-wide text-slate-800">My Health Space</h1>
          <p className="text-slate-500 text-sm mt-1">Hello, {user?.name}. Your dynamic weather-aware Ayurvedic routine.</p>
        </div>
        <Link
          href="/patient/doctors"
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg transition duration-200 flex items-center shadow-md cursor-pointer glow-green btn-premium"
        >
          <Plus className="w-4 h-4 mr-2" /> Book Ayurvedic Consult
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span>Syncing health dashboard...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Primary workspace (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Upcoming Consult Link Banner */}
            {nextAppt && (
              <div className="bg-gradient-to-r from-primary-800 to-primary-700 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden glow-green">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 rounded-full opacity-20 filter blur-3xl"></div>
                <div className="space-y-2 z-10">
                  <span className="text-[10px] font-bold bg-gold-600 text-primary-850 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Confirmed consultation
                  </span>
                  <h3 className="font-display text-xl font-bold">Upcoming: {nextAppt.doctor?.user?.name}</h3>
                  <div className="flex items-center space-x-4 text-xs font-semibold text-primary-100">
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-gold-600" /> {new Date(nextAppt.scheduledAt).toLocaleDateString()}</span>
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1 text-gold-600" /> {new Date(nextAppt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <Link
                  href={`/patient/consultations/${nextAppt.id}`}
                  className="px-5 py-3 bg-gold-600 hover:bg-gold-700 text-primary-850 font-bold rounded-lg transition duration-200 shadow-md text-xs flex items-center justify-center z-10 cursor-pointer text-slate-900 glow-gold"
                >
                  <Video className="w-4 h-4 mr-2" /> Join Video Consultation Room
                </Link>
              </div>
            )}

            {/* AI Assistant Banner */}
            <div className="bg-gradient-to-br from-gold-50/50 to-gold-100/50 border border-gold-200/50 rounded-2xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
              <div className="sm:col-span-3 space-y-2">
                <h3 className="font-display text-lg font-bold text-slate-800 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-gold-700" /> Consult PrakritiAI Wellness Bot
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Have symptoms or need dietary Pathya-Apathya guidance? Chat with our AI wellness assistant for preliminary recommendations, symptom triaging, and safety checks.
                </p>
              </div>
              <Link
                href="/patient/ai-chat"
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs text-center block shadow cursor-pointer transition"
              >
                Launch Bot Chat
              </Link>
            </div>

            {/* Premium Tabbed Navigation Panel */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-slate-50 p-2.5 border-b border-slate-100 flex items-center space-x-1 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('wellness')}
                  className={`px-5 py-2.5 text-xs font-extrabold rounded-xl transition duration-200 flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'wellness'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Flame className="w-4 h-4 text-gold-600" />
                  <span>Daily Dinacharya Space</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('prescriptions')}
                  className={`px-5 py-2.5 text-xs font-extrabold rounded-xl transition duration-200 flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'prescriptions'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>My Prescriptions ({activePrescriptions.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('records')}
                  className={`px-5 py-2.5 text-xs font-extrabold rounded-xl transition duration-200 flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                    activeTab === 'records'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-primary-600" />
                  <span>Lab Analysis & Reports ({reports.length})</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6">
                
                {/* TAB 1: Daily Dinacharya Space (Weather AI + Dinacharya Tracker) */}
                {activeTab === 'wellness' && (
                  <div className="space-y-8">
                    
                    {/* Weather AI Advisor Widget */}
                    <div className="bg-gradient-to-br from-primary-50/50 to-primary-100/50 border border-primary-200/50 rounded-2xl p-6 relative overflow-hidden">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-4 border-b border-primary-200/30">
                        {/* Weather readings */}
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-white rounded-2xl shadow-md border border-primary-100 flex items-center justify-center">
                            {weatherData ? getWeatherIcon(weatherData.wCode) : <Sun className="w-8 h-8 text-amber-500 animate-spin" />}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2.5">
                              <span className="text-2xl font-black text-slate-800">{weatherData ? `${weatherData.temp}°C` : '...'}</span>
                              <span className="text-xs text-slate-450 font-bold uppercase tracking-widest bg-white/80 px-2.5 py-0.5 rounded border border-slate-200 flex items-center">
                                <MapPin className="w-3.5 h-3.5 mr-1 text-primary-600" /> {city}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-slate-505 mt-0.5 font-semibold">
                              <span className="flex items-center"><Droplet className="w-3.5 h-3.5 mr-1 text-primary-600" /> Hum: {weatherData ? `${weatherData.humidity}%` : '...'}</span>
                              <span className="flex items-center"><Wind className="w-3.5 h-3.5 mr-1 text-sky-500" /> Wind: {weatherData ? `${weatherData.windSpeed} km/h` : '...'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Location controls */}
                        <div className="flex items-center space-x-1.5 w-full md:w-auto">
                          <form onSubmit={handleCitySearchSubmit} className="flex items-center space-x-1.5 flex-grow md:flex-grow-0">
                            <div className="relative flex-grow">
                              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={citySearchInput}
                                onChange={(e) => setCitySearchInput(e.target.value)}
                                placeholder="Search city..."
                                className="pl-9 pr-3 py-1.5 w-full md:w-36 rounded-lg border border-slate-200 bg-white text-xs text-slate-805 focus:outline-none focus:ring-2 focus:ring-primary-600"
                              />
                            </div>
                            <button
                              type="submit"
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Search
                            </button>
                          </form>
                          
                          <button
                            type="button"
                            onClick={detectLocationAndWeather}
                            disabled={weatherLoading}
                            className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs cursor-pointer shadow flex items-center justify-center glow-green"
                            title="Detect Live GPS Location"
                          >
                            {weatherLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* AI weather analysis */}
                      <div className="pt-4 space-y-3">
                        <div className="flex items-center space-x-2 text-xs font-bold text-primary-855 uppercase tracking-widest">
                          <Sparkles className="w-4 h-4 text-gold-600 animate-pulse" />
                          <span>PrakritiAI Dynamic Weather Guideline</span>
                        </div>
                        
                        {weatherLoading ? (
                          <div className="flex items-center space-x-2.5 py-3 text-xs text-slate-500">
                            <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                            <span>Consulting GPS location sensor and weather engine...</span>
                          </div>
                        ) : weatherAiAdvice ? (
                          <div className="space-y-3.5 animate-fadeIn">
                            <div className="bg-white/80 rounded-xl p-3.5 border border-primary-200/40 text-xs font-semibold text-slate-700 leading-relaxed shadow-sm">
                              {weatherAiAdvice.summary}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white/50 border border-primary-200/30 rounded-xl p-3 shadow-inner">
                                <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">AGGRAVATION WARNING</span>
                                <span className="text-xs font-extrabold text-red-700 flex items-center">
                                  <AlertCircle className="w-3.5 h-3.5 mr-1" /> {weatherAiAdvice.imbalanceRisk}
                                </span>
                              </div>
                              <div className="bg-white/50 border border-primary-200/30 rounded-xl p-3 shadow-inner">
                                <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">WEATHER-ADAPTED MORNING TASK</span>
                                <span className="text-xs font-bold text-primary-850 flex items-center">
                                  <Flame className="w-3.5 h-3.5 mr-1 text-gold-600" /> {weatherAiAdvice.suggestedMorningTask}
                                </span>
                              </div>
                            </div>
                            <div className="bg-primary-800 text-white rounded-xl p-4 text-xs leading-relaxed font-semibold shadow-md">
                              <span className="block font-bold text-[10px] text-gold-400 uppercase tracking-widest mb-1.5">AYURVEDIC RITUCHARYA RECIPE</span>
                              {weatherAiAdvice.aiAdvice}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 italic">No advice loaded. Check location access or connectivity.</div>
                        )}
                      </div>
                    </div>

                    {/* Dinacharya Checklist with tabs for morning/afternoon/evening and Streak count */}
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <ListTodo className="w-5 h-5 text-primary-600" />
                          <h3 className="font-display font-extrabold text-lg text-slate-805">Vedic Dinacharya (Complete Checklist)</h3>
                        </div>
                        
                        {/* Streak Tracker Display */}
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-amber-500 text-white px-4 py-1.5 rounded-full shadow-md animate-pulse">
                          <Flame className="w-4 h-4 fill-white text-white" />
                          <span className="text-xs font-black uppercase tracking-wider">STREAK: {streakCount} DAYS</span>
                        </div>
                      </div>

                      {/* Global Progress Bar */}
                      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="w-full sm:w-2/3 space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-slate-600">
                            <span>Today's Total Vedic Goals Completed</span>
                            <span className="text-primary-700">{completionPercentage}%</span>
                          </div>
                          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-500 rounded-full transition-all duration-500 shadow-md"
                              style={{ width: `${completionPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="text-center sm:text-right">
                          {completionPercentage === 100 ? (
                            <span className="inline-flex items-center space-x-1 bg-green-100 text-green-700 text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow border border-green-200 glow-green">
                              <Award className="w-4 h-4 animate-bounce" />
                              <span>Streak Advanced! (+1 Day)</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-405 font-bold">
                              {completedTasks.length} of {DINACHARYA_TASKS.length} done
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Period Filter Tabs */}
                      <div className="flex items-center space-x-1.5 bg-slate-105 p-1 rounded-xl w-fit">
                        <button
                          onClick={() => setSelectedTaskPeriod('all')}
                          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                            selectedTaskPeriod === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          All ({DINACHARYA_TASKS.length})
                        </button>
                        <button
                          onClick={() => setSelectedTaskPeriod('morning')}
                          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                            selectedTaskPeriod === 'morning' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Morning (Pratah)
                        </button>
                        <button
                          onClick={() => setSelectedTaskPeriod('afternoon')}
                          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                            selectedTaskPeriod === 'afternoon' ? 'bg-white text-slate-805 shadow-sm' : 'text-slate-505 hover:text-slate-800'
                          }`}
                        >
                          Afternoon (Madhyahna)
                        </button>
                        <button
                          onClick={() => setSelectedTaskPeriod('evening')}
                          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                            selectedTaskPeriod === 'evening' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-550 hover:text-slate-800'
                          }`}
                        >
                          Evening (Sayam)
                        </button>
                      </div>

                      {/* Task items list */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredTasks.map((task) => {
                          const isDone = completedTasks.includes(task.id);
                          return (
                            <div 
                              key={task.id}
                              onClick={() => toggleTask(task.id)}
                              className={`p-4 border rounded-2xl cursor-pointer transition duration-200 flex items-start space-x-3.5 hover:shadow-md select-none ${
                                isDone 
                                  ? 'bg-primary-50/40 border-primary-200/80 shadow-inner' 
                                  : 'bg-white border-slate-100 hover:border-primary-100'
                              }`}
                            >
                              <div className="mt-0.5">
                                {isDone ? (
                                  <CheckSquare className="w-5 h-5 text-primary-600 fill-primary-50" />
                                ) : (
                                  <Square className="w-5 h-5 text-slate-300" />
                                )}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-center">
                                  <h4 className={`text-sm font-bold transition ${isDone ? 'text-primary-850 line-through' : 'text-slate-805'}`}>{task.name}</h4>
                                  <span className="text-[10px] text-gold-650 bg-gold-50 border border-gold-200/40 px-2 py-0.5 rounded font-bold">{task.sanskrit}</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">{task.desc}</p>
                                <div className="text-[10px] text-slate-400 italic mt-1 block">
                                  <strong className="text-slate-500 font-bold">Benefit:</strong> {task.benefit}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 2: My Prescriptions */}
                {activeTab === 'prescriptions' && (
                  <div className="space-y-4">
                    {activePrescriptions.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-xs">
                        <FileText className="w-12 h-12 mx-auto text-slate-205 mb-2" />
                        <span>No active e-prescriptions assigned. Book an appointment to get custom herbal formulas.</span>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-105">
                        {activePrescriptions.map((pres: any) => {
                          const medicines = JSON.parse(pres.medicines || '[]');
                          return (
                            <div key={pres.id} className="py-5 flex flex-col sm:flex-row justify-between items-start gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className="p-1 bg-primary-100 text-primary-800 rounded-lg"><FileText className="w-4 h-4" /></span>
                                  <h4 className="font-bold text-slate-800 text-sm">Formulated by Dr. {pres.doctor?.user?.name}</h4>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Assigned: {new Date(pres.assignedAt).toLocaleDateString()}</span>
                                <div className="mt-4 space-y-2 pl-6 border-l-2 border-primary-100">
                                  {medicines.map((med: any, idx: number) => (
                                    <div key={idx} className="text-xs font-semibold text-slate-600">
                                      • <strong className="text-primary-850">{med.name}</strong> - {med.dosage} ({med.frequency}, Anupana: {med.anupana})
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <button
                                onClick={() => alert(`Downloading PDF copy: ${pres.pdfUrl}`)}
                                className="px-4 py-2 border border-slate-200 hover:bg-slate-55 text-xs font-semibold text-slate-700 rounded-lg cursor-pointer bg-white"
                              >
                                Download PDF
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: Lab Analysis & Reports */}
                {activeTab === 'records' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="font-display font-bold text-sm text-slate-800 uppercase tracking-wider">Analyzed Lab Reports</h4>
                      <Link 
                        href="/patient/analyzer"
                        className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center shadow-md glow-green"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> New Analysis
                      </Link>
                    </div>

                    {reports.length === 0 ? (
                      <div className="text-center py-12 text-slate-450 text-xs">
                        <FileText className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                        <span>No uploaded clinical reports. Upload PDFs to extract Ayurvedic indices.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reports.map((rep: any) => (
                          <div key={rep.id} className="p-4 border border-slate-100 hover:border-primary-100 hover:shadow-md transition rounded-2xl bg-white flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-3">
                                <span className="text-xs font-bold text-slate-800 truncate pr-2">{rep.fileName}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  rep.overallHealthStatus === 'Optimal' 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>{rep.overallHealthStatus || 'Analyzed'}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                                {rep.summary || 'Clinical details processed.'}
                              </p>
                              <span className="text-[9px] text-slate-400 font-semibold mt-3 block">Uploaded: {new Date(rep.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-end space-x-2">
                              <Link 
                                href={`/patient/analyzer?reportId=${rep.id}`}
                                className="px-3 py-1 bg-slate-55 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* Right Column: Sidebar modules (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Compact Dosha Profile Status Card */}
            <div className="bg-gradient-to-tr from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 rounded-full filter blur-xl"></div>
              
              <div className="flex items-center space-x-3.5 mb-4">
                <div className="p-2.5 bg-primary-950/60 border border-primary-800/40 text-primary-400 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Prakriti Status</span>
                  <span className="text-sm font-bold text-slate-100">Ayurvedic Constitution</span>
                </div>
              </div>

              {records?.profile?.doshaType || (records?.pastConsultations && records.pastConsultations[0]?.patient?.doshaType) ? (
                <div className="space-y-4">
                  <div className="bg-primary-950/50 border border-primary-900/60 rounded-2xl p-4 text-center">
                    <span className="text-[10px] text-gold-400 font-extrabold uppercase tracking-wider block mb-1">Dominant Energy</span>
                    <h4 className="font-display font-extrabold text-xl text-primary-400 tracking-wide">
                      {records?.profile?.doshaType || records.pastConsultations[0].patient.doshaType}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <Link
                      href={`/patient/remedies?dosha=${(records?.profile?.doshaType || '').split('_')[0]}`}
                      className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl text-center block transition cursor-pointer glow-green"
                    >
                      Browse Remedies
                    </Link>
                    <Link
                      href="/patient/quiz"
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-200 text-center block cursor-pointer"
                    >
                      Retake Prakriti Quiz
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-center pt-2">
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    You haven't assessed your Prakriti balance yet. Map your constitutional Doshas to customize consultations.
                  </p>
                  <Link
                    href="/patient/quiz"
                    className="w-full py-2.5 bg-gold-600 hover:bg-gold-700 text-primary-950 text-xs font-extrabold rounded-xl text-center block transition cursor-pointer shadow-md glow-gold"
                  >
                    Assess My Dosha
                  </Link>
                </div>
              )}
            </div>

            {/* Wellness Log Tracker Widget */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <h3 className="font-display font-bold text-xs text-slate-600 uppercase tracking-widest">Daily Wellness Log</h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              {trackerSuccess && (
                <div className="bg-green-50 text-green-700 border border-green-200 p-2.5 rounded-lg text-xs font-bold text-center mb-4">
                  {trackerSuccess}
                </div>
              )}

              <form onSubmit={handleWellnessSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="sleep-inp" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sleep (Hrs)</label>
                    <input
                      id="sleep-inp"
                      type="number"
                      step="0.5"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-primary-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="water-inp" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Water (Litres)</label>
                    <input
                      id="water-inp"
                      type="number"
                      step="0.1"
                      value={waterIntake}
                      onChange={(e) => setWaterIntake(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-primary-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="mood-inp" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mood Today</label>
                    <select
                      id="mood-inp"
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs bg-white focus:ring-2 focus:ring-primary-600 focus:outline-none"
                    >
                      <option value="Joyful">Joyful</option>
                      <option value="Good">Good</option>
                      <option value="Anxious">Anxious</option>
                      <option value="Sluggish">Sluggish</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="digestion-inp" className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider">Digestion</label>
                    <select
                      id="digestion-inp"
                      value={digestion}
                      onChange={(e) => setDigestion(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs bg-white focus:ring-2 focus:ring-primary-600 focus:outline-none"
                    >
                      <option value="Strong">Strong</option>
                      <option value="Normal">Normal</option>
                      <option value="Bloated">Bloated / Gas</option>
                      <option value="Weak">Weak</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={trackerLoading}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center disabled:opacity-50"
                >
                  {trackerLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  Submit Daily Log
                </button>
              </form>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
