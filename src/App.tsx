import { useEffect, useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
import moment from "moment";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Clock, Cpu } from 'lucide-react';
import type { Schema } from "../amplify/data/resource";

const client = generateClient<Schema>();

function App() {
  const [telemetries, setTelemetry] = useState<Array<Schema["telemetry"]["type"]>>([]);
  const [devices, setDevices] = useState<Array<Schema["devices"]["type"]>>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    client.models.telemetry.observeQuery().subscribe({
      next: (data) => { setTelemetry([...data.items]) },
    });

    client.models.devices.observeQuery().subscribe({
      next: (data) => { 
        setDevices([...data.items]);
        if (!selectedDevice && data.items.length > 0) {
          setSelectedDevice(data.items[0].device_id);
        }
      },
    });
  }, []);

  function createDevice() {
    const device = String(window.prompt("Device ID"));
    if (device) {
      client.models.devices.create({ device_id: device, owner: user.userId });
    }
  }

  function deleteDevice(device_id: string) {
    client.models.devices.delete({ device_id });
    if (selectedDevice === device_id) {
      setSelectedDevice(devices.find(d => d.device_id !== device_id)?.device_id || null);
    }
  }

  function createTelemetry() {
    if (selectedDevice) {
      const temperature = Math.random() * (30 - 20) + 20;
      const humidity = Math.random() * (90 - 40) + 40;

      client.models.telemetry.create({
        device_id: selectedDevice,
        timestamp: new Date().getTime(),
        temperature: temperature,
        humidity: humidity,
        owner: user.userId,
      });
    }
  }

  const getDeviceWithNewestReading = () => {
    if (telemetries.length === 0) return null;

    const sortedTelemetries = [...telemetries].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    const newestTelemetry = sortedTelemetries[0];
    const newestDevice = devices.find(d => d.device_id === newestTelemetry.device_id);

    return {
      device: newestDevice,
      telemetry: newestTelemetry,
    };
  };

  const newestReading = getDeviceWithNewestReading();

  const filteredTelemetry = telemetries
    .filter(t => t.device_id === selectedDevice)
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 10)
    .reverse();

  const getLastSeenTime = (deviceId: string) => {
    const deviceTelemetry = telemetries.filter(t => t.device_id === deviceId);
    if (deviceTelemetry.length > 0) {
      const lastTimestamp = Math.max(...deviceTelemetry.map(t => t.timestamp || 0));
      return moment(lastTimestamp).fromNow();
    }
    return "N/A";
  };

  const normalizeTemperature = (temp: number) => (temp / 50) * 100;

  const chartData = filteredTelemetry.map(t => ({
    ...t,
    normalizedTemperature: normalizeTemperature(t.temperature || 0),
  }));

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {user?.signInDetails?.loginId}'s Sensor Dashboard
            </CardTitle>
            <CardDescription>
              Real-time monitoring of temperature and humidity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Latest Active Device</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {newestReading ? (
                    <>
                      <div className="text-2xl font-bold mb-2">{newestReading.device?.device_id || 'Unknown Device'}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Temperature</p>
                          <p className="text-lg font-semibold">{newestReading.telemetry.temperature?.toFixed(2)}°C</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Humidity</p>
                          <p className="text-lg font-semibold">{newestReading.telemetry.humidity?.toFixed(2)}%</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Last updated: {moment(newestReading.telemetry.timestamp).format("YYYY-MM-DD HH:mm:ss")}
                      </p>
                    </>
                  ) : (
                    <p className="text-lg">No readings available</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{devices.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Total Devices
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Readings</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{telemetries.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Total Readings
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={createDevice} 
                className="mb-4 bg-accent hover:bg-accent-foreground text-accent-foreground hover:text-accent transition-colors"
              >
                Add Device
              </Button>
              <ScrollArea className="h-[400px]">
                <div className="pr-4 space-y-4">
                  {devices.map((device) => (
                    <Card 
                      key={device.device_id} 
                      className={`cursor-pointer transition-colors ${selectedDevice === device.device_id ? 'bg-primary/10' : ''}`}
                      onClick={() => setSelectedDevice(device.device_id)}
                    >
                      <CardHeader>
                        <CardTitle className="text-sm">ID: {device.device_id}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs mb-2">
                          Last Seen: {getLastSeenTime(device.device_id)}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={device?.status === "connected" ? "default" : "destructive"}
                            className={device?.status === "connected" ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {device?.status ? device?.status.charAt(0).toUpperCase() + String(device?.status).slice(1) : "Unknown"}
                          </Badge>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={(e) => { e.stopPropagation(); deleteDevice(device.device_id); }}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Telemetry</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={createTelemetry} 
                className="mb-4 bg-secondary hover:bg-secondary-foreground text-secondary-foreground hover:text-secondary transition-colors" 
                disabled={!selectedDevice}
              >
                Create new Telemetry record
              </Button>
              <div className="flex justify-center mb-4 text-sm">
                <span className="mr-6 flex items-center">
                  <span className="inline-block w-4 h-4 mr-2 border border-gray-300" style={{ backgroundColor: 'hsl(var(--chart-1))' }}></span>
                  <span className="text-foreground font-medium">Temperature (°C)</span>
                </span>
                <span className="flex items-center">
                  <span className="inline-block w-4 h-4 mr-2 border border-gray-300" style={{ backgroundColor: 'hsl(var(--chart-2))' }}></span>
                  <span className="text-foreground font-medium">Humidity (%)</span>
                </span>
              </div>
              <div className="h-[450px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(timestamp) => moment(timestamp).format("HH:mm:ss")}
                      label={{ value: 'Time', position: 'insideBottom', offset: -15 }}
                      stroke="hsl(var(--foreground))"
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      label={{ value: 'Value', angle: -90, position: 'insideLeft', offset: -5 }} 
                      stroke="hsl(var(--foreground))"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background p-2 border border-border rounded-md shadow-md">
                              <p className="text-sm font-medium">
                                {moment(payload[0].payload.timestamp).format("YYYY-MM-DD HH:mm:ss")}
                              </p>
                              <p className="text-sm" style={{ color: 'hsl(var(--chart-1))' }}>
                                Temperature: {payload[0].payload.temperature?.toFixed(2)}°C
                              </p>
                              <p className="text-sm" style={{ color: 'hsl(var(--chart-2))' }}>
                                Humidity: {payload[0].payload.humidity?.toFixed(2)}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="normalizedTemperature"
                      fill="hsl(var(--chart-1))"
                      name="Temperature"
                    />
                    <Bar
                      dataKey="humidity"
                      fill="hsl(var(--chart-2))"
                      name="Humidity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-4" />
        <Button 
          onClick={signOut}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 ease-in-out flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
          </svg>
          Sign out
        </Button>
      </div>
    </div>
  );
}

export default App;

