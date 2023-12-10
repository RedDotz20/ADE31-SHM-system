import { useEffect, useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { Button } from '@chakra-ui/react';

import { MdPower, MdPowerOff } from 'react-icons/md';
import { GrPowerReset } from 'react-icons/gr';
import { MdEnergySavingsLeaf } from 'react-icons/md';
import { SlEnergy } from 'react-icons/sl';
import { GiAmplitude } from 'react-icons/gi';

type valuedString = string | null;

export default function App() {
	const [ws, setWs] = useState<W3CWebSocket | null>(null);
	const [isPowerOn, setIsPowerOn] = useState<boolean>(false);
	const [voltageValue, setVoltageValue] = useState<valuedString>(null);
	const [currentValue, setCurrentValue] = useState<valuedString>(null);
	const [energyValue, setEnergyValue] = useState<valuedString>(null);

	console.log('WebSocket readyState:', ws?.readyState);

	useEffect(() => {
		const newWebSocket = new W3CWebSocket('ws://192.168.1.3:81');

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

	const handleReset = () => {
		if (isPowerOn) {
			handleToggle();
			if (ws && ws.readyState === WebSocket.OPEN) {
				ws.send('reset'); // Reset Wattage state (esp32)
			}
		}
	};

	return (
		<div className="flex flex-col gap-2  bg-[#242424] min-h-screen text-white items-center justify-center">
			<h2
				className={`text-xl p-2 rounded-xl px-4 transition-all flex items-center justify-center gap-2 ${
					isPowerOn
						? 'bg-green-500 animate-pulse transition-all'
						: 'bg-blue-700'
				}`}
			>
				{isPowerOn ? <MdPower size={25} /> : <MdPowerOff size={25} />} POWER
				STATUS: {isPowerOn ? 'ON' : 'OFF'}
			</h2>
			<div className="min-h-[150px] min-w-[300px] flex flex-col items-center justify-center border-white border-2 rounded-lg">
				<div className="flex gap-7 min-w-[240px] text-lg">
					<div>
						<h1 className="text-lg flex gap-2 items-center">
							<GiAmplitude />
							Current:{' '}
						</h1>
						<h1 className="text-lg flex gap-2 items-center">
							<SlEnergy />
							Voltage:{' '}
						</h1>
						<h1 className="text-lg flex gap-2 items-center">
							<MdEnergySavingsLeaf />
							Total Energy:{' '}
						</h1>
					</div>
					{isPowerOn && (
						<div className="flex flex-col">
							{currentValue && <p>{currentValue.substring(9)} amps</p>}
							{voltageValue && <p>{voltageValue.substring(9)} v</p>}
							{energyValue && <p>{energyValue.substring(8)}</p>}
						</div>
					)}
				</div>
			</div>
			<div className="flex gap-4 min-w-[300px]">
				<Button
					className="w-full"
					colorScheme={isPowerOn ? 'red' : 'green'}
					onClick={handleToggle}
				>
					{isPowerOn ? 'Switch OFF' : 'Switch ON'}
				</Button>
				<Button
					className="w-full flex items-center justify-center gap-2"
					colorScheme="purple"
					onClick={handleReset}
				>
					<GrPowerReset size={15} /> Reset
				</Button>
			</div>
		</div>
	);
}
