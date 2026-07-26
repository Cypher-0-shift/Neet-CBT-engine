import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Monitor, Clock, User, Volume2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSettingsStore } from '../../stores/settingsStore';

export function SettingsScreen() {
  const { settings, updateSettings, isLoaded, loadSettings } = useSettingsStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!isLoaded) {
      loadSettings();
    }
  }, [isLoaded, loadSettings]);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = parseInt(value, 10);
    }

    setLocalSettings(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      await updateSettings(localSettings);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-4">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Application Settings</h1>
            <p className="text-gray-500">Configure your default practice experience</p>
          </div>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          <Save size={18} className="mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {saveMessage && (
        <div className={`mb-6 p-4 rounded text-sm ${saveMessage.includes('Failed') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Candidate Profile Defaults */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center text-lg font-bold text-gray-900 mb-4">
              <User size={20} className="mr-2 text-blue-500" />
              Candidate Profile Defaults
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Candidate Name</label>
                <input
                  type="text"
                  name="defaultCandidateName"
                  value={localSettings.defaultCandidateName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Registration Number</label>
                <input
                  type="text"
                  name="defaultRegistrationNumber"
                  value={localSettings.defaultRegistrationNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 12345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
                <select
                  name="defaultLanguage"
                  value={localSettings.defaultLanguage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Timers & Saves */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center text-lg font-bold text-gray-900 mb-4">
              <Clock size={20} className="mr-2 text-orange-500" />
              Timers & Autosave
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Autosave Interval (seconds)</label>
                <input
                  type="number"
                  name="autoSaveIntervalSeconds"
                  min={10}
                  max={300}
                  value={localSettings.autoSaveIntervalSeconds}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Mode Time Limit (minutes)</label>
                <p className="text-xs text-gray-500 mb-2">Set to 0 to use the test's default duration.</p>
                <input
                  type="number"
                  name="examTimeLimitMinutes"
                  min={0}
                  value={localSettings.examTimeLimitMinutes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Standard Timer Warning (minutes left)</label>
                <input
                  type="number"
                  name="timerWarningMinutes"
                  min={1}
                  max={60}
                  value={localSettings.timerWarningMinutes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Critical Timer Warning (minutes left)</label>
                <input
                  type="number"
                  name="timerCriticalMinutes"
                  min={1}
                  max={30}
                  value={localSettings.timerCriticalMinutes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
