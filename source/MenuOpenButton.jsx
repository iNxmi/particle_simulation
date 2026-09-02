import {Settings} from "lucide-react"

function MenuOpenButton({isOpen, onClick}) {
    if (!isOpen)
        return null

    return (
        <div className="fixed sm:top-0 sm:left-0 max-sm:bottom-0 max-sm:right-0 m-2 p-5 select-none bg-white/10 aspect-square rounded-2xl hover:bg-white/15" onClick={onClick}>
            <Settings/>
        </div>
    )
}

export default MenuOpenButton