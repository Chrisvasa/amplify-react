import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';
import moment from "moment";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

  const filteredTelemetry = telemetries.filter(t => t.device_id === selectedDevice);

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: selectedDevice ? `Device: ${selectedDevice}` : "No device selected",
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Temperature (°C)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Humidity (%)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const chartData = {
    labels: filteredTelemetry.map((data) => moment(data?.timestamp).format("HH:mm:ss")),
    datasets: [
      {
        label: 'Temperature',
        data: filteredTelemetry.map((data) => data?.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y',
      },
      {
        label: 'Humidity',
        data: filteredTelemetry.map((data) => data?.humidity),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y1',
      },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sensor Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>User: {user?.signInDetails?.loginId}</div>
            <div>Temperature: {filteredTelemetry[filteredTelemetry.length - 1]?.temperature?.toFixed(2)}°C</div>
            <div>Humidity: {filteredTelemetry[filteredTelemetry.length - 1]?.humidity?.toFixed(2)}%</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={createDevice} className="mb-4">Add Device</Button>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
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
                        Last Seen: {filteredTelemetry[filteredTelemetry.length - 1]?.timestamp ? moment(filteredTelemetry[filteredTelemetry.length - 1].timestamp).fromNow() : "N/A"}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant={device?.status === "connected" ? "default" : "destructive"}>
                          {device?.status ? device?.status.charAt(0).toUpperCase() + String(device?.status).slice(1) : "Unknown"}
                        </Badge>
                        <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); deleteDevice(device.device_id); }}>
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
            <Button onClick={createTelemetry} className="mb-4" disabled={!selectedDevice}>Create new Telemetry record</Button>
            <div className="w-full h-[400px]">
              <Line options={chartOptions} data={chartData} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-4" />
      <Button variant="outline" onClick={signOut}>Sign out</Button>
    </div>
  );
}

export default App;

