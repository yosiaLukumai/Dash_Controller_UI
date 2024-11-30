"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { PlaceSearch } from "./AutocompleteSearch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from 'lucide-react'
import { format, addWeeks } from "date-fns"
import { cn } from "@/lib/utils"
import { useButtonContext } from "@/contexts/useTabActives"
import config from "@/config"

const orderSchema = z.object({
    businessId: z.string().min(1, "Please select a business"),
    pickupPlace: z.object({
        name: z.string().min(2, "Pickup place must be at least 2 characters long"),
        longitude: z.number().min(-180).max(180),
        latitude: z.number().min(-90).max(90),
    }),
    dropPoint: z.object({
        name: z.string().min(2, "Drop point must be at least 2 characters long"),
        longitude: z.number().min(-180).max(180),
        latitude: z.number().min(-90).max(90),
    }),
    deliveryType: z.enum(["asap", "scheduled"]),
    scheduledDateTime: z.date().refine(
        (date) => date <= addWeeks(new Date(), 3),
        "Scheduled date must be within the next 3 weeks"
    ).optional().nullable(),
})

type OrderFormValues = z.infer<typeof orderSchema>

type Business = {
    customer_id: string;
    business_name: string;
}



export default function NewOrderFormDialog() {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const {activeButtonName, deactivateButton} = useButtonContext()

    const [currentStep, setCurrentStep] = React.useState(1)
    const [businesses, setBusinesses] = React.useState<Business[]>([])
    const attributionDiv = React.useRef<HTMLDivElement>(null)

    const form = useForm<OrderFormValues>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            businessId: "",
            pickupPlace: { name: "", longitude: 0, latitude: 0 },
            dropPoint: { name: "", longitude: 0, latitude: 0 },
            deliveryType: "asap",
            scheduledDateTime: null,
        },
    })

    const deliveryType = form.watch("deliveryType")

    React.useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const response = await fetch(`${config.API_URL}/customers/businessnames`)
                const data = await response.json()
                setBusinesses(data?.body)
            } catch (error) {
                console.error('Failed to fetch businesses:', error)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load businesses. Please try again.",
                })
            }
        }

        fetchBusinesses()
    }, [toast])

    const onSubmit = async (data: OrderFormValues) => {
        setIsSubmitting(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))
            console.log("Order submitted:", data)
            toast({
                title: "Success",
                description: "Order created successfully",
            })
            form.reset()
            setCurrentStep(1)
            deactivateButton()
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

    const handlePlaceSelect = (place: google.maps.places.PlaceResult | null, fieldName: "pickupPlace" | "dropPoint") => {
        if (place && place.geometry?.location && place.name) {
            form.setValue(fieldName, {
                name: place.name,
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
            })
        }
    }

    const handleNext = async () => {
        const fields = currentStep === 1 ? ["businessId"] : ["pickupPlace", "dropPoint"]
        const isStepValid = await form.trigger(fields as any)
        if (isStepValid) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1)
    }


    return (
        <Dialog open={activeButtonName === "order"} onOpenChange={deactivateButton}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Order</DialogTitle>
                    <DialogDescription>
                        Fill in the details to create a new order. Click next to proceed through the steps.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {currentStep === 1 && (
                            <FormField
                                control={form.control}
                                name="businessId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select Business</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a business" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {businesses.map((business) => (
                                                    <SelectItem key={business.customer_id} value={String(business.customer_id)}>
                                                        {business.business_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {currentStep === 2 && (
                            <>
                                <FormItem>
                                    <FormLabel>Pickup Place</FormLabel>
                                    <PlaceSearch
                                        attributionDiv={attributionDiv}
                                        mapId="pickup-map"
                                        mapInstanceReq={false}
                                        onPlaceSelect={(place) => handlePlaceSelect(place, "pickupPlace")}
                                    />
                                    <FormMessage>{form.formState.errors.pickupPlace?.name?.message}</FormMessage>
                                </FormItem>

                                <FormItem>
                                    <FormLabel>Drop Point</FormLabel>
                                    <PlaceSearch
                                        attributionDiv={attributionDiv}
                                        mapId="dropoff-map"
                                        mapInstanceReq={false}
                                        onPlaceSelect={(place) => handlePlaceSelect(place, "dropPoint")}
                                    />
                                    <FormMessage>{form.formState.errors.dropPoint?.name?.message}</FormMessage>
                                </FormItem>
                            </>
                        )}

                        {currentStep === 3 && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="deliveryType"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Delivery Type</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    className="flex flex-col space-y-1"
                                                >
                                                    <div className="flex items-center space-x-3 space-y-0">
                                                        <RadioGroupItem value="asap" id="asap" />
                                                        <Label htmlFor="asap">ASAP</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-3 space-y-0">
                                                        <RadioGroupItem value="scheduled" id="scheduled" />
                                                        <Label htmlFor="scheduled">Scheduled</Label>
                                                    </div>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {deliveryType === "scheduled" && (
                                    <FormField
                                        control={form.control}
                                        name="scheduledDateTime"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Scheduled Date and Time</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-[240px] pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP HH:mm")
                                                                ) : (
                                                                    <span>Pick a date and time</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value || undefined}
                                                            onSelect={(date) => {
                                                                if (date) {
                                                                    const now = new Date()
                                                                    date.setHours(now.getHours(), now.getMinutes())
                                                                }
                                                                field.onChange(date)
                                                            }}
                                                            disabled={(date) => date > addWeeks(new Date(), 3) || date < new Date()}
                                                            initialFocus
                                                        />
                                                        {field.value && (
                                                            <div className="p-3 border-t">
                                                                <Input
                                                                    type="time"
                                                                    onChange={(e) => {
                                                                        const [hours, minutes] = e.target.value.split(':')
                                                                        const newDate = new Date(field.value as Date)
                                                                        newDate.setHours(parseInt(hours), parseInt(minutes))
                                                                        field.onChange(newDate)
                                                                    }}
                                                                    defaultValue={format(field.value, "HH:mm")}
                                                                />
                                                            </div>
                                                        )}
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </>
                        )}

                        <div className="flex justify-between">
                            {currentStep > 1 && (
                                <Button type="button" onClick={handlePrevious}>
                                    Previous
                                </Button>
                            )}
                            {currentStep < 3 ? (
                                <Button type="button" onClick={handleNext}>
                                    Next
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Order...
                                        </>
                                    ) : (
                                        'Create Order'
                                    )}
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </DialogContent>
            <div ref={attributionDiv} />
        </Dialog>
    )
}