import {useState} from "react"
import {Settings} from "lucide-react";
import {Simulation, Menu, Card} from "./components"

function Controls({configuration, onChange}) {
    const [isOpen, setIsOpen] = useState(false)

    if (isOpen)
        return <Menu configuration={configuration} onChange={onChange} onClose={() => {
            setIsOpen(false)
        }}/>

    return (
        <Card className="hover:cursor-pointer fixed sm:top-0 sm:left-0 max-sm:bottom-0 max-sm:right-0 m-3 aspect-square hover:bg-white/10" onClick={() => {
            setIsOpen(true)
        }}>
            <Settings className="m-5 select-none"/>
        </Card>
    )
}

function Application() {
    const [configuration, setConfiguration] = useState({
        numberOfParticles: 10000,
        gravitation: 2500.0,
        gravitationRadius: 250.0,
        intensityExpression: "-x^5 + 1",
        friction: 300.0,
        elasticity: 0.67,
        roughness: 0.42
    })

    function onConfigurationChange(key, value) {
        setConfiguration((previous) => ({
            ...previous,
            [key]: value
        }))
    }

    return (
        <div className="bg-black grow min-h-svh max-h-svh overflow-hidden text-gray-300">
            <h1 className="sr-only">Interactive Particle Gravitation Simulation</h1>

            <Simulation configuration={configuration}/>

            <Controls configuration={configuration} onChange={onConfigurationChange}/>
        </div>
    )
}

export default Application