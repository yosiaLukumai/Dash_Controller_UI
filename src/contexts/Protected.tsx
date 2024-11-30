import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from './userContext'
import { useToast } from "@/hooks/use-toast"

interface ProtectedProps {
    children: React.ReactNode;
}

export const Protected: React.FC<ProtectedProps> = ({ children }) => {
    const { user } = useUser()
    const { toast } = useToast()

    useEffect(() => {
        if (!user) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Login to access the resources.",
            })
        }
    }, [user])

    if (!user) {
        return <Navigate to="/" replace={true} />
    }

    return <>{children}</>
}

export default Protected
