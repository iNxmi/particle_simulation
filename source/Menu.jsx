import {useState} from "react"
import {version} from "../package.json"
import {X} from "lucide-react"
import Input from "./Input";
import Card from "./Card";

function Field({label, accent, children}) {
    return (
        <label className="flex flex-col gap-1">
            <div className="flex justify-between">
                <span className="font-bold">{label}</span>
                <span className="font-bold text-sm">{accent}</span>
            </div>
            {children}
        </label>
    )
}

function Menu({isOpen, onClose}) {
    if (!isOpen)
        return null

    const [numberOfParticles, setNumberOfParticles] = useState(25000)
    const [gravitation, setGravitation] = useState(2500.0)
    const [gravitationRadius, setGravitationRadius] = useState(250.0)
    const [friction, setFriction] = useState(150.0)
    const [elasticity, setElasticity] = useState(0.67)
    const [roughness, setRoughness] = useState(0.40)

    return (
        <Card className="flex flex-col absolute inset-0 md:w-100 overflow-scroll sm:w-full p-3 m-3">
            <div className="grow flex flex-col gap-3">
                <Card className="flex flex-col gap-3 p-3">
                    <Field label="Close Menu">
                        <div className="hover:cursor-pointer flex gap-1 bg-black text-white border border-white/50 rounded-md p-1 hover:bg-gray-800 active:bg-gray-900 select-none justify-center" onClick={onClose}>
                            <X/>
                        </div>
                    </Field>
                </Card>

                <Card className="flex flex-col gap-3 p-3">
                    <h2 className="text-3xl font-bold text-center select-none">Settings</h2>
                    <Field label="Number of Particles">
                        <Input type="number" value={numberOfParticles} onChange={(event) => setNumberOfParticles(event.target.value)}/>
                    </Field>
                    <Field label="Gravitation" accent="px / s²">
                        <Input type="number" value={gravitation} step={0.01} onChange={(event) => setGravitation(event.target.value)}/>
                    </Field>
                    <Field label="Gravitation Radius" accent = "px">
                        <Input type="number" value={gravitationRadius} min={1} step={0.01} onChange={(event) => setGravitationRadius(event.target.value)}/>
                    </Field>
                    <Field label="Friction" accent="px / s">
                        <Input type="number" value={friction} step={0.01} onChange={(event) => setFriction(event.target.value)}/>
                    </Field>
                    <Field label="Elasticity" accent = {`${Math.round(elasticity * 100)}%`}>
                        <Input type="range" value={elasticity} min={0} max={1} step={0.01} onChange={(event) => setElasticity(event.target.value)}/>
                    </Field>
                    <Field label="Roughness" accent = {`${Math.round(roughness * 100)}%`}>
                        <Input type="range" value={roughness} min={0} max={1} step={0.01} onChange={(event) => setRoughness(event.target.value)}/>
                    </Field>
                    <Field label="Reset Simulation">
                        <Input type="button" value="Reset"/>
                    </Field>
                </Card>

                <Card className="flex flex-col gap-3 p-3">
                    <h2 className="text-3xl font-bold text-center select-none">Information</h2>
                    <Field label="FPS">
                        <Input type="input" disabled/>
                    </Field>
                    <Field label="Delta Time" accent="Seconds">
                        <Input type="input" disabled/>
                    </Field>
                    <Field label="Version">
                        <Input type="input" value={version} disabled/>
                    </Field>
                </Card>
            </div>
        </Card>
    )
}

export default Menu