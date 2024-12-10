import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

const App = () => {
  const [region, setRegion] = useState(null);
  const [city, setCity] = useState(null);
  const [textFormat, setTextFormat] = useState('YYYY-MM-DD HH:mm:ss z');
  const [unixtime, setUnixtime] = useState(Math.floor(Date.now() / 1000));
  const [textTime, setTextTime] = useState('');

  const regions = Intl.supportedValuesOf('timeZone').reduce((acc, tz) => {
    const [r, c] = tz.split('/');
    if (!acc[r]) acc[r] = [];
    if (c) acc[r].push(c);
    return acc;
  }, {});

  regions['UTC'] = [];

  const regionOptions = [
    { value: 'UTC', label: 'UTC' },
    ...Object.keys(regions).filter(r => r !== 'UTC').map(r => ({ value: r, label: r }))
  ];

  const cityOptions = region && region.value !== 'UTC'
    ? Array.from(new Set(regions[region.value])).map(c => ({ value: c, label: c }))
    : [];

  const timezoneShortcuts = [
    { label: 'UTC', region: 'UTC', city: null },
    { label: 'PST', region: 'America', city: 'Los_Angeles' },
    { label: 'MST', region: 'America', city: 'Denver' },
    { label: 'CST', region: 'America', city: 'Chicago' },
    { label: 'EST', region: 'America', city: 'New_York' },
  ];

  const handleRegionChange = (selectedRegion) => {
    setRegion(selectedRegion);
    if (selectedRegion.value === 'UTC') {
      setCity(null);
    } else if (selectedRegion && regions[selectedRegion.value].length > 0) {
      const uniqueCities = Array.from(new Set(regions[selectedRegion.value]));
      const firstCity = uniqueCities[0];
      setCity({ value: firstCity, label: firstCity });
    } else {
      setCity(null);
    }
  };

  const handleShortcutClick = (shortcut) => {
    setRegion({ value: shortcut.region, label: shortcut.region });
    if (shortcut.city) {
      setCity({ value: shortcut.city, label: shortcut.city });
    } else {
      setCity(null);
    }
  };

  const handleUnixtimeShortcut = (type) => {
    const now = dayjs();
    if (type === 'midnight') {
      setUnixtime(now.startOf('day').unix());
    } else if (type === 'now') {
      setUnixtime(now.unix());
    }
  };

  const handleConvertToUnixtime = () => {
    const tz = region.value === 'UTC' ? 'UTC' : `${region.value}/${city.value}`;
    const unix = dayjs.tz(textTime, textFormat, tz).unix();
    setUnixtime(unix);
  };

  const handleConvertToTextTime = () => {
    const tz = region.value === 'UTC' ? 'UTC' : `${region.value}/${city.value}`;
    const formattedTime = dayjs.unix(unixtime).tz(tz).format(textFormat);
    setTextTime(formattedTime);
  };

  useEffect(() => {
    const userTimezone = dayjs.tz.guess();
    const [userRegion, userCity] = userTimezone.split('/');

    const defaultRegion = regionOptions.find(r => r.value === userRegion);
    setRegion(defaultRegion);

    if (defaultRegion && defaultRegion.value !== 'UTC') {
      const defaultCity = { value: userCity, label: userCity };
      setCity(defaultCity);
    }

    const formattedTime = dayjs.unix(unixtime).tz(userTimezone).format(textFormat);
    setTextTime(formattedTime);
  }, []);

    return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Unixtime</h1>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-semibold mb-4">Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Region
            </label>
            <Select
              options={regionOptions}
              value={region}
              onChange={handleRegionChange}
              className="w-full"
            />
            <div className="mt-2 flex space-x-2">
              {timezoneShortcuts.map((shortcut) => (
                <button
                  key={shortcut.label}
                  onClick={() => handleShortcutClick(shortcut)}
                  className="px-2 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  {shortcut.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              City
            </label>
            <Select
              options={cityOptions}
              value={city}
              onChange={setCity}
              isDisabled={!region || region.value === 'UTC'}
              className="w-full"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Text Format
          </label>
          <input
            type="text"
            value={textFormat}
            onChange={(e) => setTextFormat(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-semibold mb-4">Convert</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Unixtime
            </label>
            <input
              type="text"
              value={unixtime}
              onChange={(e) => setUnixtime(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => handleUnixtimeShortcut('midnight')}
                className="text-sm text-blue-500 hover:text-blue-700 focus:outline-none"
              >
                Midnight
              </button>
              <button
                onClick={() => handleUnixtimeShortcut('now')}
                className="text-sm text-blue-500 hover:text-blue-700 focus:outline-none"
              >
                Now
              </button>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Text Time
            </label>
            <input
              type="text"
              value={textTime}
              onChange={(e) => setTextTime(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>
        <div className="flex gap-x-4 justify-end">
          <button
            onClick={handleConvertToUnixtime}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Convert to Unixtime
          </button>
          <button
            onClick={handleConvertToTextTime}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Convert to Text Time
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;