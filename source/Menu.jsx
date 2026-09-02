import {version} from "../package.json"
import {X, GitGraph} from "lucide-react"
import Input from "./Input";
import Card from "./Card";

function wrapper(title, children) {
    return (
    <div className="flex flex-col gap-1">
        <span className="font-bold">{title}</span>
        {children}
    </div>
    )
}

function Menu({isOpen, onClose}) {
    if (!isOpen)
        return null

    return (
        <Card className="flex flex-col absolute inset-0 md:w-100 overflow-scroll sm:w-full p-3 m-3">
            <div className="grow flex flex-col gap-3">
                <Card className="flex flex-col gap-3 p-3">
                    <div id="menu_close_button" className="hover:cursor-pointer flex gap-1 bg-black text-white border border-white/50 rounded-md p-1 hover:bg-gray-800 active:bg-gray-900 select-none justify-center" onClick={onClose}>
                        <X/>
                    </div>
                </Card>

                <Card className="flex flex-col gap-3 p-3">
                    <h2 className="text-3xl font-bold text-center select-none">Settings</h2>
                    {wrapper("Number of Particles", <Input type="number" value="25000" onChange={() => alert}/>)}
                    {wrapper("Gravitation (px/s²)", <Input type="number" step="0.01" value="2500.0"/>)}
                    {wrapper("Gravitation Radius (px)", <Input type="number" min="1" step="0.01" value="300.0"/>)}
                    {wrapper("Friction (px/s)", <Input type="number" step="0.01" value="150.0"/>)}
                    {wrapper("Elasticity (%)", <Input type="range" min="0" max="1" step="0.01" value="0.67"/>)}
                    {wrapper("Roughness (%)", <Input type="range" min="0" max="1" step="0.01" value="0.25"/>)}
                    {wrapper("Reset Simulation", <Input type="button" value="Reset"/>)}
                </Card>

                <Card className="flex flex-col gap-3 p-3">
                    <h2 className="text-3xl font-bold text-center select-none">Information</h2>
                    {wrapper("FPS", <Input disabled/>)}
                    {wrapper("Delta Time (Seconds)", <Input disabled/>)}
                    {wrapper("Version", <Input value={version} disabled/>)}
                </Card>
            </div>
        </Card>
    )
}

export default Menu