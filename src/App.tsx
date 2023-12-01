import { useEffect, useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import './App.css';

type valuedString = string | null;

function App() {
  const [ws, setWs] = useState<W3CWebSocket | null>(null);
  const [isPowerOn, setIsPowerOn] = useState<boolean>(false);

  const [voltageValue, setVoltageValue] = useState<valuedString>(null);
  const [currentValue, setCurrentValue] = useState<valuedString>(null);
  const [energyValue, setEnergyValue] = useState<valuedString>(null);
  const [totalEnergyValue, setTotalEnergyValue] = useState<valuedString>(null);

  useEffect(() => {
    const newWebSocket = new W3CWebSocket('ws://192.168.1.4:81');
    setWs(newWebSocket);
    setIsPowerOn(false);

    newWebSocket.onopen = () => {
      console.log('WebSocket connected');
    };

    newWebSocket.onmessage = (messageEvent) => {
      const message = messageEvent.data as string;
      console.log('Received message:', message);

      if (message.startsWith('Voltage: ')) {
        setVoltageValue(message);
      } else if (message.startsWith('Current: ')) {
        setCurrentValue(message);
      } else if (message.startsWith('Energy: ')) {
        setEnergyValue(message);
      } else if (message.startsWith('Energy (kWh): ')) {
        setTotalEnergyValue(message);
      }
    };

    newWebSocket.onclose = () => {
      console.log('WebSocket closed');
    };

    return () => {
      newWebSocket.close();
    };
  }, []);

  const handleToggle = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const newState = !isPowerOn; // Toggle the state
      setIsPowerOn(newState); // Update the state
      ws.send(newState ? 'on' : 'off'); // Send the message based on the new state
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h2>POWER STATUS: {isPowerOn ? 'ON' : 'OFF'}</h2>
      {currentValue && <p>{currentValue} amps</p>}
      {voltageValue && <p>{voltageValue} v</p>}
      {energyValue && <p>{energyValue}</p>}
      {totalEnergyValue && <p>{totalEnergyValue}</p>}
      <button onClick={handleToggle}>Toggle Power</button>
    </div>
  );
}

export default App;
