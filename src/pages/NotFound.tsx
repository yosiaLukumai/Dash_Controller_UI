// import { Button } from "@/components/ui/button"
// import { useNavigate } from "react-router-dom"
// import notF from "/404.svg"

// export default function NotFound() {
//     const navigate = useNavigate()

//     return (
//         <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
//             <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
//                 <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
//                     404
//                 </h1>
//                 <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
//                     Oops! The page you're looking for does not exist.
//                 </p>
//                 <div className="flex justify-center">
//                     <Button
//                         variant="default"
//                         size="lg"
//                         onClick={() => navigate("/")}
//                     >
//                         Go back home
//                     </Button>
//                 </div>
//             </div>
//             <div className="mt-8">
//                 <img
//                     src={notF}
//                     alt="404 Illustration"
//                     className="max-w-[400px] rounded-lg shadow-lg"
//                 />
//             </div>
//         </div>
//     )
// }


import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
// import notF from "/404.svg"

export default function NotFound() {
    const navigate = useNavigate()

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-background text-foreground overflow-hidden">
            <div className="absolute inset-0 z-0">
                <svg
                    className="h-full w-full opacity-10"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="xMidYMid slice"
                >
                    <path
                        fill="currentColor"
                        d="M0 0 L50 100 L100 0 Z"
                    />
                    <path
                        fill="currentColor"
                        d="M50 0 L100 100 L0 100 Z"
                    />
                </svg>
                 {/* <img
                    src={notF}
                    alt="Your are lost"
                    className="h-full w-full opacity-10"
                /> */}
            </div>
            <div className="container relative z-10 flex max-w-[64rem] flex-col items-center gap-4 text-center">
                <h1 className="text-8xl font-extrabold tracking-tight sm:text-9xl md:text-[12rem]">
                    404
                </h1>
                <p className="max-w-[42rem] text-xl leading-normal text-muted-foreground sm:text-2xl sm:leading-8">
                    Oops! The page you're looking for has vanished into the digital void.
                </p>
                <div className="mt-8">
                    <Button
                        variant="default"
                        size="lg"
                        onClick={() => navigate("/")}
                        className="text-lg px-8 py-6"
                    >
                        Return to Safety
                    </Button>
                </div>
            </div>
        </div>
    )
}