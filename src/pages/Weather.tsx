import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, Eye,
  CloudSun, CloudDrizzle, CloudLightning, Sunrise, Sunset, AlertTriangle,
} from 'lucide-react';

// Simulated weather data
const currentWeather = {
  temp: 28,
  feelsLike: 30,
  humidity: 65,
  windSpeed: 12,
  windDir: 'NE',
  visibility: 10,
  pressure: 1013,
  uvIndex: 7,
  condition: 'Partly Cloudy',
  sunrise: '06:12',
  sunset: '18:45',
};

const hourlyForecast = [
  { time: '6 AM', temp: 22, icon: Sun, condition: 'Clear', rain: 0 },
  { time: '9 AM', temp: 25, icon: CloudSun, condition: 'Partly Cloudy', rain: 0 },
  { time: '12 PM', temp: 30, icon: Sun, condition: 'Sunny', rain: 0 },
  { time: '3 PM', temp: 32, icon: CloudSun, condition: 'Partly Cloudy', rain: 10 },
  { time: '6 PM', temp: 28, icon: Cloud, condition: 'Cloudy', rain: 30 },
  { time: '9 PM', temp: 24, icon: CloudDrizzle, condition: 'Light Rain', rain: 60 },
];

const weeklyForecast = [
  { day: 'Today', high: 32, low: 20, icon: CloudSun, condition: 'Partly Cloudy', rain: 10 },
  { day: 'Tue', high: 30, low: 19, icon: CloudRain, condition: 'Rain', rain: 70 },
  { day: 'Wed', high: 27, low: 18, icon: CloudLightning, condition: 'Thunderstorm', rain: 85 },
  { day: 'Thu', high: 29, low: 17, icon: Cloud, condition: 'Overcast', rain: 40 },
  { day: 'Fri', high: 31, low: 20, icon: Sun, condition: 'Sunny', rain: 5 },
  { day: 'Sat', high: 33, low: 21, icon: Sun, condition: 'Clear', rain: 0 },
  { day: 'Sun', high: 30, low: 19, icon: CloudSun, condition: 'Partly Cloudy', rain: 15 },
];

const farmAlerts = [
  { type: 'warning', message: 'Heavy rain expected Wednesday — consider covering seedbeds', time: '2 days' },
  { type: 'info', message: 'Optimal conditions for planting on Friday–Saturday', time: '4 days' },
  { type: 'warning', message: 'High UV index today — ensure livestock have shade access', time: 'Now' },
];

const Weather = () => {
  const [selectedLocation] = useState('Main Farm — Harare');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Weather Forecast</h1>
            <p className="text-muted-foreground mt-1">{selectedLocation}</p>
          </div>
          <Badge variant="outline" className="w-fit text-warning border-warning">
            <AlertTriangle className="h-3 w-3 mr-1" /> Demo Data — Connect API for live updates
          </Badge>
        </div>

        {/* Current Weather */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-6xl font-bold text-foreground">{currentWeather.temp}°C</p>
                  <p className="text-lg text-muted-foreground mt-1">{currentWeather.condition}</p>
                  <p className="text-sm text-muted-foreground">Feels like {currentWeather.feelsLike}°C</p>
                </div>
                <CloudSun className="h-24 w-24 text-accent" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm">
                  <Droplets className="h-4 w-4 text-primary" />
                  <span>Humidity: {currentWeather.humidity}%</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Wind className="h-4 w-4 text-primary" />
                  <span>Wind: {currentWeather.windSpeed} km/h {currentWeather.windDir}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 text-primary" />
                  <span>Visibility: {currentWeather.visibility} km</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Thermometer className="h-4 w-4 text-primary" />
                  <span>Pressure: {currentWeather.pressure} hPa</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Sunrise className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Sunrise</p>
                  <p className="text-lg font-semibold">{currentWeather.sunrise}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Sunset className="h-8 w-8 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Sunset</p>
                  <p className="text-lg font-semibold">{currentWeather.sunset}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Sun className="h-8 w-8 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">UV Index</p>
                  <p className="text-lg font-semibold">{currentWeather.uvIndex} (High)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Farm Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Farm Weather Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {farmAlerts.map((alert, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${
                  alert.type === 'warning' ? 'bg-warning/10' : 'bg-primary/10'
                }`}>
                  <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${
                    alert.type === 'warning' ? 'text-warning' : 'text-primary'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">In {alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Forecasts */}
        <Tabs defaultValue="hourly">
          <TabsList>
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
            <TabsTrigger value="weekly">7-Day Forecast</TabsTrigger>
          </TabsList>
          <TabsContent value="hourly">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {hourlyForecast.map((h, i) => {
                const Icon = h.icon;
                return (
                  <Card key={i}>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">{h.time}</p>
                      <Icon className="h-8 w-8 mx-auto my-2 text-primary" />
                      <p className="text-xl font-bold">{h.temp}°</p>
                      <p className="text-xs text-muted-foreground">{h.condition}</p>
                      {h.rain > 0 && (
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Droplets className="h-3 w-3 text-primary" />
                          <span className="text-xs">{h.rain}%</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          <TabsContent value="weekly">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {weeklyForecast.map((d, i) => {
                    const Icon = d.icon;
                    return (
                      <div key={i} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 w-32">
                          <Icon className="h-6 w-6 text-primary" />
                          <span className="font-medium">{d.day}</span>
                        </div>
                        <span className="text-sm text-muted-foreground w-32">{d.condition}</span>
                        <div className="flex items-center gap-1 w-16">
                          <Droplets className="h-3 w-3 text-primary" />
                          <span className="text-sm">{d.rain}%</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{d.high}°</span>
                          <span className="text-muted-foreground ml-2">{d.low}°</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Weather;
