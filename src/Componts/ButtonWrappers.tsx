import { Button } from '@/components/ui/button';
import { useButtonContext } from '@/contexts/useTabActives';


interface Props {
    activeTab: string;
}
export default function ButtonWrappers({ activeTab }: Props) {
    const { activateButton } = useButtonContext()
    return (<>
        {
            (activeTab == "Dashboard" || activeTab == "Orders") && <Button onClick={() => activateButton("order")} variant={"default"}>Add Order</Button>
        }
    </>)
}
