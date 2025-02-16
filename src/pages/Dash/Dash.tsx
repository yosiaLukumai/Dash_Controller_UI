
import { useEffect, useState } from 'react'
import { io, Socket } from "socket.io-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Home, LineChart, LogOut, Thermometer, Droplet, Droplets, FlaskRound, Zap, Download, Flame, ShowerHeadIcon as Shower, Cog } from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useUser } from '@/contexts/userContext'
import { useNavigate } from 'react-router-dom'
import config from '@/config'
import { useToast } from '@/hooks/use-toast'
import LoaderApp from '../Loader'
import { Switch } from "@/components/ui/switch"
// import { set } from 'date-fns'

interface SensorCardProps {
    icon: React.ElementType;
    title: string;
    value: number;
    unit: string;
    color: string;
    showSlider?: boolean;
    min?: number;
    max?: number;
    onChange?: (value: number) => void;
    setedTemperature?: number;
    setedHumidity?: number;
}

// const SensorCard = ({ icon: Icon, title, value, unit, color, showSlider = false, min = 0, max = 100,  onChange, setedTemperature, setedHumidity }: SensorCardProps) => (
//     <Card className={`bg-gradient-to-br ${color} hover:shadow-lg transition-all duration-300`}>
//         <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
//             <Icon className="h-4 w-4 text-white" />
//         </CardHeader>
//         <CardContent>
//             <div className="text-2xl font-bold text-white mb-2">
//                 {value.toFixed(2)}
//                 {(title=="Temperature" || title == "Humidity") && <span className="ml-1  text-2xl font-bold">  / {setedHumidity || setedHumidity} </span>}
//                 <span className="ml-1 text-sm font-normal">{unit}</span>
//             </div>
//             {showSlider && onChange && (
//                 <Slider
//                     min={min}
//                     max={max}
//                     step={0.01}
//                     value={[title === "Temperature" ? (setedTemperature ? setedTemperature: 0)  : (setedHumidity ? setedHumidity : 0)]}
//                     // value={[ title=="Temperature" ?  (setedTemperature ? setedTemperature: 0 ) :  (setedHumidity ? setedHumidity : 0)]}
//                     // onValueChange={([newValue]) => onChange(newValue)}
//                     onValueChange={([newValue]) => onChange(newValue)}

//                     className="w-full"
//                 />
//             )}
//         </CardContent>
//     </Card>
// )

const SensorCard = ({ 
    icon: Icon, 
    title, 
    value, 
    unit, 
    color, 
    showSlider = false, 
    min = 0, 
    max = 100,  
    onChange, 
    setedTemperature, 
    setedHumidity 
}: SensorCardProps) => (
    <Card className={`bg-gradient-to-br ${color} hover:shadow-lg transition-all duration-300`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
            <Icon className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-white mb-2">
                {value.toFixed(2)}
                {(title === "Temperature" || title === "Humidity") && (
                    <span className="ml-1 text-2xl font-bold">
                        / {title === "Temperature" ? setedTemperature : setedHumidity}
                    </span>
                )}
                <span className="ml-1 text-sm font-normal">{unit}</span>
            </div>
            {showSlider && onChange && (
                <Slider
                    min={min}
                    max={max}
                    step={0.01}
                    // value={[title === "Temperature" ? setedTemperature : setedHumidity]}
                    value={[title === "Temperature" ? (setedTemperature ? setedTemperature: 0)  : (setedHumidity ? setedHumidity : 0)]}
                    onValueChange={([newValue]) => onChange(newValue)}
                    className="w-full"
                />
            )}
        </CardContent>
    </Card>
);


interface Data {
    K: number;
    P: number;
    N: number;
    EC: number;
    pH: number;
    humidity: number;
    temperature: number;
    setedHumidity?: number;
    setedTemperature?: number;
}

interface DataObject {
    machine: string;
    data: Data;
}

interface StatusMachine {
    sprinkler: boolean;
    motor: boolean;
    pump: boolean;
    machine: string;
}


interface LogData {
    time: string;
    humidity: number;
    temperature: number;
}



export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("overview")
    const [temperature, setTemperature] = useState(84)
    const [setedHumidity, setSetedHumidity] = useState(37)
    const [setedTemperature, setSetedTemperature] = useState(84)
    const [humidity, setHumidity] = useState(37)
    const { setUser, user } = useUser()
    const { toast } = useToast()
    const navigator = useNavigate()
    const [workingGraphData, setworkingGraphData] = useState<LogData[] | null>(null)
    const [machineData, setMachineData] = useState<DataObject | null>(null)
    const [thereChanges, setThereChanges] = useState<LogData | null>(null)
    const [socket, setSocket] = useState<Socket | null>(null);
    const [motorOn, setmotorOn] = useState(false)
    const [pumpOn, setpumpOn] = useState(false)
    const [sprinklerOn, setsprinklerOn] = useState(false)
    // const [machineStatusOb, setMachineStatusOj] = useState<StatusMachine | null>(null)


    const handleExport = async () => {
        console.log("Exporting data...");
        const downloadLogs = async () => {
            try {
                const response = await fetch(`${config.API_URL}/logs/machines/${user?.machineId}/export-all`);

                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }

                const blob = await response.blob(); // Get file data as a blob

                // Create a URL for the blob
                const url = window.URL.createObjectURL(blob);

                // Create a link element to trigger the download
                const link = document.createElement("a");
                link.href = url;

                // Set the download attribute with a filename
                link.download = `machineData-${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "numeric" })}.pdf`; // Replace with appropriate filename

                // Append the link to the document, click it, and remove it
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up the blob URL
                window.URL.revokeObjectURL(url);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to export data. Please try again.",
                    variant: "destructive",
                });
            }
        };

        await downloadLogs();
    };


    useEffect(() => {
        const fetchMachineData = async () => {
            try {
                const response = await fetch(`${config.API_URL}/machine/${user?.machineId}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch data')
                }
                const data = await response.json()
                if (data.success) {

                    if (data.body) {
                        
                        setMachineData(data.body)
                    }
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to load data. Please try again.",
                        variant: "destructive",
                    })
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load data. Please try again.",
                    variant: "destructive",
                })
            }
        }
        fetchMachineData()
    }, [])

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch(`${config.API_URL}/logs/machines/${user?.machineId}/lastsix`)
                if (!response.ok) {
                    throw new Error('Failed to fetch data')
                }
                const data = await response.json()
                if (data.success) {
                    if (data.body) {
                        setworkingGraphData(data.body.logs)
                    }
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to load data. Please try again.",
                        variant: "destructive",
                    })
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load data. Please try again.",
                    variant: "destructive",
                })
            }
        }
        fetchLogs()
    }, [])

    useEffect(() => {
        const socketInstance = io(config.API_URL);
        setSocket(socketInstance);

        const handleCriticalNotification = (data: any) => {
            const NewData: DataObject = JSON.parse(data)
            if (NewData.machine == user?.machineId) {
                setTemperature(NewData.data.temperature)
                setHumidity(NewData.data.humidity)
                setMachineData(NewData)
                let NewLogData: LogData = {
                    humidity: NewData.data.humidity,
                    temperature: NewData.data.temperature,
                    time: new Date(data.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                }
                setThereChanges(NewLogData)

            }

        };

        const handleMachineStatus = (data: any) => {
            const NewData: StatusMachine = JSON.parse(data)
            if (NewData.machine == user?.machineId) {
                //    setMachineStatusOj(NewData)
                setpumpOn(NewData.pump)
                setsprinklerOn(NewData.sprinkler)
                setmotorOn(NewData.motor)
            }
        };

        socketInstance.on("newdata", handleCriticalNotification);
        socketInstance.on("new/config/machine", handleMachineStatus)
        socketInstance.on("connect", () => {
            console.log("connected....", socketInstance.id);

        })


        return () => {
            socketInstance.off("newdata", handleCriticalNotification);
            socketInstance.off("new/config/machine", handleMachineStatus)
            socketInstance.disconnect();
        };
    }, []);


    useEffect(() => {

        if (thereChanges && workingGraphData) {
            let PreviousData = workingGraphData ? [...workingGraphData, thereChanges] : [thereChanges];
            if (PreviousData.length > 6) {
                PreviousData.shift();
                setworkingGraphData(PreviousData)
            }
        }
    }, [thereChanges])


    const logoutUser = (): void => {
        setUser(null)
        navigator("/")
    }

    useEffect(() => {
        const socketInstance = socket;

        if (!socketInstance) return

        const debounceTimer = setTimeout(() => {
            
            socketInstance.emit(
                "new/config",
                JSON.stringify({  temperature: setedTemperature, humidity: setedHumidity, machineId: user?.machineId })
            );
        }, 4000);

        return () => clearTimeout(debounceTimer);

    }, [setedTemperature, setedHumidity])


    useEffect(() => {
        const socketInstance = socket;
        if (!socketInstance) return
        if (!user?.machineId) return


        let NewSettingsMachine: StatusMachine = {
            motor: motorOn,
            pump: pumpOn,
            sprinkler: sprinklerOn,
            machine: user?.machineId
        }

        socketInstance.emit("new/config/machine", JSON.stringify(NewSettingsMachine));

    }, [pumpOn, motorOn, sprinklerOn])





    const renderContent = () => {
        switch (activeTab) {
            case "overview":
                return (
                    <div className="space-y-4 mb-5">
                        {
                            (machineData && workingGraphData) ? (<div>
                                <div className="grid grid-cols-2 gap-4 mb-4">

                                    <SensorCard
                                        icon={Thermometer}
                                        title="Temperature"
                                        value={temperature}
                                        unit="°C"
                                        min={0}
                                        max={100}
                                        color="from-red-500 to-orange-500"

                                        
                                        // onChange={(v) => setSetedTemperature(v)}
                                        setedTemperature={machineData.data.setedTemperature}
                                        onChange={(v) => {
                                            setMachineData((prev) =>
                                                prev ? { ...prev, data: { ...prev.data, setedTemperature: v } } : null
                                            )
                                            setSetedTemperature(v)
                                        }}
                                        // setedTemperature={setedTemperature}
                                        
                                        showSlider
                                    />
                                    <SensorCard
                                        icon={Droplets}
                                        title="Humidity"
                                        value={humidity}
                                        unit="%"
                                        min={0}
                                        max={100}
                                        color="from-blue-500 to-cyan-500"
                                        onChange={(v) => {
                                            setMachineData((prev) =>
                                                prev ? { ...prev, data: { ...prev.data, setedHumidity: v } } : null
                                            )
                                            setSetedHumidity(v)
                                        }
                                        }
                                        // onChange={(v) => setSetedHumidity(v)}
                                        setedHumidity={setedHumidity}
                                        showSlider
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <SensorCard
                                        icon={FlaskRound}
                                        title="pH"
                                        value={machineData.data.pH}
                                        unit=""
                                        color="from-green-500 to-emerald-500"
                                    />
                                    <SensorCard
                                        icon={Zap}
                                        title="EC"
                                        value={machineData.data.EC}
                                        unit="us/cm"
                                        color="from-yellow-500 to-amber-500"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">

                                    <SensorCard icon={FlaskRound} title="N" value={machineData.data.N} unit="mg/kg" color="from-purple-500 to-pink-500" />
                                    <SensorCard icon={FlaskRound} title="P" value={machineData.data.P} unit="mg/kg" color="from-indigo-500 to-violet-500" />
                                    <SensorCard icon={FlaskRound} title="K" value={machineData.data.K} unit="mg/kg" color="from-teal-500 to-cyan-500" />
                                </div>
                            </div>) : <div className='text-2xl mx-auto w-full flex justify-center justify-items-center font-bold text-center'>
                                <LoaderApp />
                            </div>
                        }

                    </div>
                );

            case "sensors":
                return (
                    <Card className="bg-gray-800">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-blue-300">Machine Controls</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-10 gap-6">
                                <div className="col-span-7 space-y-6">
                                    <div className="bg-gray-700 p-3 rounded-lg flex flex-col items-center justify-between">
                                        <div className="bg-blue-500 p-4 rounded-full mb-4">
                                            <Droplet className="h-12 w-12 text-white" />
                                        </div>
                                        <Switch
                                            id="motor-switch"
                                            checked={motorOn}
                                            onCheckedChange={setmotorOn}
                                            className="data-[state=checked]:bg-blue-500 switch-large"
                                        />
                                        <div className="text-sm text-gray-400 mt-2">
                                            Motor
                                        </div>
                                    </div>
                                    <div className="bg-gray-700 p-6 rounded-lg flex flex-col items-center justify-between">
                                        <div className="bg-red-500 p-4 rounded-full mb-4">
                                            <Flame className="h-12 w-12 text-white" />
                                        </div>
                                        <Switch
                                            id="pump-switch"
                                            checked={pumpOn}
                                            onCheckedChange={setpumpOn}
                                            className="data-[state=checked]:bg-red-500 switch-large"
                                        />
                                        <div className="text-sm text-gray-400 mt-2">
                                            motor
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-3 bg-gray-700 p-6 rounded-lg flex flex-col items-center justify-center">
                                    <div className="bg-green-500 p-4 rounded-full mb-4">
                                        <Shower className="h-12 w-12 text-white" />
                                    </div>
                                    <Switch
                                        id="sprinkler-switch"
                                        checked={sprinklerOn}
                                        onCheckedChange={setsprinklerOn}
                                        className="data-[state=checked]:bg-green-500"
                                    />
                                    <div className="text-sm text-gray-400 mt-2">
                                        Sprinkler
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            case "analytics":
                return (
                    <div>
                        <div className='py-2 flex justify-end items-end'>
                            <button
                                onClick={handleExport}
                                className="p-2 hover:bg-blue-600 flex bg-gray-800 rounded-lg transition-colors"
                            >
                                Export
                                <Download className="pl-2 w-6 h-6 text-blue-300" />
                            </button>
                        </div>

                        <Card className="bg-gray-800">
                            <CardHeader className="flex justify-between items-center">
                                <CardTitle className="text-blue-300">Analytics</CardTitle>

                            </CardHeader>
                            <CardContent>
                                {
                                    workingGraphData && <div className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RechartsLineChart data={workingGraphData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="time" />
                                                <YAxis yAxisId="left" />
                                                <YAxis yAxisId="right" orientation="right" />
                                                <Tooltip />
                                                <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#ff7300" activeDot={{ r: 8 }} />
                                                <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#387908" />
                                            </RechartsLineChart>
                                        </ResponsiveContainer>
                                    </div>
                                }

                            </CardContent>
                        </Card>
                    </div>

                );
            default:
                return null;
        }
    }

    return (
        <div className="min-h-screen justify-center   bg-gray-900 text-white p-6">
            {renderContent()}
            <Card className="mt-6  bg-gray-800 left-0 right-0">
                <CardContent className="p-0">
                    <div className="flex justify-between items-center p-4">
                        <button
                            className={`p-2 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-blue-600' : 'hover:bg-blue-600'}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            <Home color='white' className="w-6 h-6" />
                        </button>
                        <button
                            className={`p-2 rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-blue-600' : 'hover:bg-blue-600'}`}
                            onClick={() => setActiveTab('analytics')}
                        >
                            <LineChart color='white' className="w-6 h-6" />
                        </button>
                        <button
                            className={`p-2 rounded-lg transition-colors ${activeTab === 'sensors' ? 'bg-blue-600' : 'hover:bg-blue-600'}`}
                            onClick={() => setActiveTab('sensors')}
                        >
                            <Cog color='white' className="w-6 h-6" />
                        </button>
                        <button
                            className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
                            onClick={() => logoutUser()}
                        >
                            <LogOut color='white' className="w-6 h-6" />
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

