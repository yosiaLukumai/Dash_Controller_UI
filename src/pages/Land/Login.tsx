import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useNavigate, Link } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useToast } from "@/hooks/use-toast"
import config from '@/config'
import { useUser } from '@/contexts/userContext'

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    machineId: z.string().nonempty('Please select a machine'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface Machine {
    _id: string
    name: string
}

export default function Login() {
    const [showPassword, setShowPassword] = useState(false)
    const {  setUser, user } = useUser()

    const [machines, setMachines] = useState<Machine[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const { toast } = useToast()

    const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            machineId: '',
        },
    })

    useEffect(() => {
        if (user) {
            navigate(`/auth/${user.user_id}`)
        }
    }, [user])

    useEffect(() => {
        const fetchMachines = async () => {
            try {
                const response = await fetch(`${config.API_URL}/machine/names/find`)
                if (!response.ok) {
                    throw new Error('Failed to fetch machines')
                }
                const data = await response.json()
                
                if (data.success) {
                    setMachines(data.body)
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to load machines. Please try again.",
                        variant: "destructive",
                    })
                }
            } catch (error) {
                console.error('Error fetching machines:', error)
                toast({
                    title: "Error",
                    description: "Failed to load machines. Please try again.",
                    variant: "destructive",
                })
            }
        }

        fetchMachines()
    }, [toast])

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true)
        try {
            const response = await fetch(`${config.API_URL}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    machineID: data.machineId,
                    email: data.email,
                    password: data.password
                }),
            })

            if (!response.ok) {
                throw new Error('Login failed')
            }

            const result = await response.json()
            if (result.success) {
                // await logLocal(result.body?.user.email, result.body.user._id, result.body.user.fullName, data.machineId)
                setUser({ ...result.body.user, user_id: result.body.user._id, machineId: data.machineId })
                // setTimeout(() => {
                navigate(`/auth/${result.body.user._id}`)
                // }, 2000);
            } else {
                toast({
                    title: "Login Error",
                    description: result?.body || "Login failed. Please check your credentials and try again.",
                    variant: "destructive",
                })
            }

        } catch (error) {
            console.error('Login error:', error)
            toast({
                title: "Error",
                description: "Login failed. Please check your credentials and try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-gray-800 text-white">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-blue-300">Login to IoT Dashboard</CardTitle>
                    <CardDescription className="text-center text-gray-400">Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        className="bg-gray-700 border-gray-600 text-white"
                                    />
                                )}
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            className="bg-gray-700 border-gray-600 text-white pr-10"
                                        />
                                    )}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOffIcon className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="machineId">Machine</Label>
                            <Controller
                                name="machineId"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                            <SelectValue placeholder="Select a machine" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {machines.map((machine) => (
                                                <SelectItem key={machine._id} value={machine._id}>
                                                    {machine.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.machineId && <p className="text-red-500 text-sm">{errors.machineId.message}</p>}
                        </div>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-300 hover:underline">
                            Register here
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}

