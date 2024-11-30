"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import config from "@/config"
import { PlaceSearch } from "./AutocompleteSearch"

const bikeSchema = z.object({
    serialNumber: z.string().min(3, "Serial number must be at least 3 characters long"),
    plateNumber: z.string().min(3, "Plate number must be at least 3 characters long"),
    generationType: z.enum(["gen1", "gen2"]),
})

const riderSchema = z.object({
    fname: z.string().min(2, "First name must be at least 2 characters long"),
    lname: z.string().min(2, "Last name must be at least 2 characters long"),
    national_id: z.string()
        .length(20, "National ID must be exactly 20 characters long"),
    phone: z.string()
        .length(10, "Phone number must be exactly 10 digits long")
        .regex(/^0\d{9}$/, "Phone number must start with 0 and contain only digits"),
    location: z.string().min(3, "Location must be at least 3 characters long"),
    email: z.string().email("Invalid email format").optional()
})

const orderSchema = z.object({
    orderName: z.string().min(3, "Order name must be at least 3 characters long"),
    deliveryAddress: z.string().min(5, "Address must be at least 5 characters long"),
})

const customerSchema = z.object({
    fname: z.string().min(2, "First name must be at least 2 characters long"),
    lname: z.string().min(2, "Last name must be at least 2 characters long"),
    businessName: z.string().min(2, "Business name must be at least 2 characters long"),
    businessLine: z.enum(["transportation", "logistic", "food", "warehouse", "retail_store", "beverage", "electronics", "agriculture"]),
    email: z.string().email("Invalid email format"),
    phone: z.string().length(10, "Phone number must be exactly 10 digits long").regex(/^0\d{9}$/, "Phone number must start with 0 and contain only digits"),
    location: z.object({
        name: z.string().min(2, "Location name must be at least 2 characters long"),
        longitude: z.number().min(-180).max(180),
        latitude: z.number().min(-90).max(90),
    }),
})

interface FormDialogContentProps {
    activeTab: string;
    setDialogOpen: (open: boolean) => void;
    attributionDiv: React.RefObject<HTMLDivElement>;
}

export function FormDialogContent({ activeTab, setDialogOpen, attributionDiv }: FormDialogContentProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [step, setStep] = React.useState(1)
    const { toast } = useToast()


    const bikeForm = useForm<z.infer<typeof bikeSchema>>({
        resolver: zodResolver(bikeSchema),
        defaultValues: {
            serialNumber: "",
            plateNumber: "",
            generationType: "gen1",
        },
    })

    const riderForm = useForm<z.infer<typeof riderSchema>>({
        resolver: zodResolver(riderSchema),
        defaultValues: {
            fname: "",
            lname: "",
            national_id: "",
            phone: "",
            location: "",
            email: ""
        },
    })

    const orderForm = useForm<z.infer<typeof orderSchema>>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            orderName: "",
            deliveryAddress: "",
        },
    })

    const customerForm = useForm<z.infer<typeof customerSchema>>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            fname: "",
            lname: "",
            businessName: "",
            businessLine: "transportation",
            email: "",
            phone: "",
            location: {
                name: "",
                longitude: 0,
                latitude: 0,
            },
        },
    })

    const onSubmitBike = async (data: z.infer<typeof bikeSchema>) => {
        setIsSubmitting(true)
        try {
            const response = await fetch(`${config.API_URL}/bikes/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    plate_no: data.plateNumber,
                    serial_no: data.serialNumber,
                    generation: data.generationType == "gen1" ? 1 : 2,
                }),
            })
            const result = await response.json()
            if (result.success) {
                toast({
                    title: "Success",
                    description: result.body || "Bike added successfully",
                })
                bikeForm.reset()
                setDialogOpen(false)
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result?.body,
                    duration: 3000
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred",
            })
        } finally {
            setIsSubmitting(false)
        }
    }



    const onSubmitRider = async (data: z.infer<typeof riderSchema>) => {
        setIsSubmitting(true)
        try {
            const response = await fetch(`${config.API_URL}/riders/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    email: data.email === '' ? null : data.email,
                }),
            })
            const result = await response.json()
            if (result.success) {
                toast({
                    title: "Success",
                    description: result.body || "Rider added successfully",
                    duration: 2000
                })
                riderForm.reset()
                setDialogOpen(false)
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error || "Failed to add rider",
                    duration: 3000
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred",
                duration: 3000
            })
        } finally {
            setIsSubmitting(false)
        }
    }


    const onSubmitCustomer = async (data: z.infer<typeof customerSchema>) => {
        setIsSubmitting(true)
        try {
            const response = await fetch(`${config.API_URL}/customers/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    business_line: data.businessLine,
                    business_name: data.businessName,
                    longitude: data.location.longitude,
                    latitude: data.location.latitude,
                    location: data.location.name,
                    fname: data.fname,
                    lname: data.lname,
                    email: data.email,
                    phone: data.phone
                }),
            })
            const result = await response.json()
            if (result.success) {
                toast({
                    title: "Success",
                    description: result.body || "Customer added successfully",
                })
                customerForm.reset()
                setDialogOpen(false)
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error || "Failed to add customer",
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const SelectPlace = (place: google.maps.places.PlaceResult | null): void => {
        if (!place) return
        if (place && place.geometry?.location && place.name) {
            customerForm.setValue("location", {
                name: place.name,
                latitude: place.geometry?.location?.lat(),
                longitude: place.geometry?.location?.lng()
            })
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No location passed.",
            })
        }

    }

    if (activeTab === "Riders") {
        return (
            <Form {...riderForm}>
                <form onSubmit={riderForm.handleSubmit(onSubmitRider)} className="space-y-8">
                    {step === 1 && (
                        <>
                            <FormField
                                control={riderForm.control}
                                name="fname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter first name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={riderForm.control}
                                name="lname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter last name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={riderForm.control}
                                name="national_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>National ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter national ID (20 characters)" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="button" onClick={() => setStep(2)}>Next</Button>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <FormField
                                control={riderForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={riderForm.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter phone number (10 digits)" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={riderForm.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter location" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-between">
                                <Button type="button" onClick={() => setStep(1)}>Previous</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Adding Rider...
                                        </>
                                    ) : (
                                        'Add Rider'
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </Form>
        )
    }

    if (activeTab === "Bikes") {
        return (
            <Form {...bikeForm}>
                <form onSubmit={bikeForm.handleSubmit(onSubmitBike)} className="space-y-8">
                    <FormField
                        control={bikeForm.control}
                        name="serialNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Serial Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter serial number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={bikeForm.control}
                        name="plateNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Plate  Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter plate number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={bikeForm.control}
                        name="generationType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Generation Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select generation type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="gen1">Gen 1</SelectItem>
                                        <SelectItem value="gen2">Gen 2</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding Bike...
                            </>
                        ) : (
                            'Add Bike'
                        )}
                    </Button>
                </form>
            </Form>
        )
    }

    if (activeTab === "Customers") {
        return (
            <Form {...customerForm}>
                <form onSubmit={customerForm.handleSubmit(onSubmitCustomer)} className="space-y-8">
                    {step === 1 && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={customerForm.control}
                                    name="fname"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Eric" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={customerForm.control}
                                    name="lname"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Kuley" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={customerForm.control}
                                name="businessName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Business Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Sunking Tz." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={customerForm.control}
                                name="businessLine"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Business Line</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a business line" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {["transportation", "logistic", "food", "warehouse", "retail_store", "beverage", "electronics", "agriculture"].map((line) => (
                                                    <SelectItem key={line} value={line}>
                                                        {line.charAt(0).toUpperCase() + line.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" onClick={() => setStep(2)}>Next</Button>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <FormField
                                control={customerForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="manager@sunking.co.tz" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={customerForm.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input type="tel" placeholder="+1234567890" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-between">
                                <Button type="button" onClick={() => setStep(1)}>Previous</Button>
                                <Button type="button" onClick={() => setStep(3)}>Next</Button>
                            </div>
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <div className="space-y-4">
                                <PlaceSearch attributionDiv={attributionDiv} mapId="2" mapInstanceReq={false} onPlaceSelect={(place) => SelectPlace(place)} />
                                <div className="grid grid-cols-2 gap-4">
                                </div>
                            </div>
                            <div className="flex justify-between mt-6">
                                <Button type="button" onClick={() => setStep(2)}>Previous</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Adding Customer...
                                        </>
                                    ) : (
                                        'Add Customer'
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </Form>
        )
    }

    if (activeTab === "Reports") {
        return (
            <Form {...orderForm}>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                    <FormField
                        control={orderForm.control}
                        name="orderName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Report Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select report type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily Report</SelectItem>
                                        <SelectItem value="monthly">Monthly Report</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Report...
                            </>
                        ) : (
                            'Generate Report'
                        )}
                    </Button>
                </form>
            </Form>
        )
    }

    return null
}



