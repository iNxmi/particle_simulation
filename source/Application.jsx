import {useState} from "react"

import Simulation from "./Simulation"
import MenuOpenButton from "./MenuOpenButton"
import Menu from "./Menu"

function Application() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <div className="bg-black grow min-h-svh max-h-svh overflow-hidden text-gray-300">
            <h1 className="sr-only">Interactive Particle Gravitation Simulation</h1>

            <Simulation/>

            <MenuOpenButton isOpen={!isMenuOpen} onClick={() => {
                setIsMenuOpen(true)
            }}/>

            <Menu isOpen={isMenuOpen} onClose={() => {
                setIsMenuOpen(false)
            }}/>
        </div>
    )
}

export default Application