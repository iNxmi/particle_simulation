import {X} from "lucide-react"
import {Input, Card} from "."

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

function Menu({configuration, onChange, onClose}) {

    function handleChange(event) {
        const {name, value, type} = event.target

        let parsed = value
        if(type === "range" || type === "number")
            parsed = Number(value)

        onChange(name, parsed)
    }

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
                        <Input name="numberOfParticles" type="number" value={configuration.numberOfParticles} onChange={handleChange}/>
                    </Field>
                    <Field label="Gravitation" accent="px / s²">
                        <Input name="gravitation" type="number" value={configuration.gravitation} step={0.01} onChange={handleChange}/>
                    </Field>
                    <Field label="Gravitation Radius" accent="px">
                        <Input name="gravitationRadius" type="number" value={configuration.gravitationRadius} min={1} step={0.01} onChange={handleChange}/>
                    </Field>
                    <Field label="Intensity Expression">
                        <Input name="intensityExpression" type="text" value={configuration.intensityExpression} onChange={handleChange}/>
                    </Field>
                    <Field label="Friction" accent="px / s">
                        <Input name="friction" type="number" value={configuration.friction} step={0.01} onChange={handleChange}/>
                    </Field>
                    <Field label="Elasticity" accent={`${Math.round(configuration.elasticity * 100)}%`}>
                        <Input name="elasticity" type="range" value={configuration.elasticity} min={0} max={1} step={0.01} onChange={handleChange}/>
                    </Field>
                    <Field label="Roughness" accent={`${Math.round(configuration.roughness * 100)}%`}>
                        <Input name="roughness" type="range" value={configuration.roughness} min={0} max={1} step={0.01} onChange={handleChange}/>
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
                        <Input type="input" value={__APP_VERSION__} disabled/>
                    </Field>
                </Card>
            </div>
        </Card>
    )
}

export default Menu