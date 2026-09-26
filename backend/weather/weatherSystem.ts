export interface WeatherState {
  type: 'clear' | 'cloudy' | 'rain' | 'heavy_rain' | 'fog';
  intensity: number;
  particles: Phaser.GameObjects.Particles.ParticleEmitter[] | null;
}

let currentWeather: WeatherState = {
  type: 'clear',
  intensity: 0,
  particles: null,
};

const weatherCallbacks: ((weather: WeatherState) => void)[] = [];
let weatherInterval: NodeJS.Timeout | null = null;

export function startWeatherSystem(onChange?: (weather: WeatherState) => void) {
  if (onChange) {
    weatherCallbacks.push(onChange);
  }

  if (weatherInterval) return;

  weatherInterval = setInterval(() => {
    const weatherTypes: WeatherState['type'][] = ['clear', 'clear', 'clear', 'cloudy', 'cloudy', 'rain', 'fog'];
    const newType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    
    if (newType !== currentWeather.type) {
      setWeather(newType);
    }
  }, 5 * 60 * 1000);
}

export function setWeather(type: WeatherState['type'], intensity: number = 1) {
  currentWeather = {
    ...currentWeather,
    type,
    intensity: Math.min(Math.max(intensity, 0), 1),
  };

  weatherCallbacks.forEach(cb => cb(currentWeather));
}

export function getCurrentWeather(): WeatherState {
  return { ...currentWeather };
}

export function notifyWeatherChange(scene: Phaser.Scene) {
  weatherCallbacks.forEach(cb => cb(currentWeather));
}