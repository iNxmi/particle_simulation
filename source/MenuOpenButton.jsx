import {Settings} from "lucide-react"
import Card from "./Card";

function MenuOpenButton({isOpen, onClick}) {
    if (!isOpen)
        return null

    return (
        <Card className="hover:cursor-pointer  fixed sm:top-0 sm:left-0 max-sm:bottom-0 max-sm:right-0 m-3 aspect-square hover:bg-white/10" onClick={onClick}>
            <Settings className="m-5 select-none"/>
        </Card>
    )
}

export default MenuOpenButton