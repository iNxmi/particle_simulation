import {version} from "../package.json"
import {X} from "lucide-react"

function Menu({isOpen, onClose}) {
    if (!isOpen)
        return null

    return (
        <div className="flex flex-col absolute inset-0 bg-white/7 rounded-2xl md:w-100 overflow-scroll sm:w-full m-2">
            <div className="grow flex flex-col gap-15 m-5 justify-between">
                <div className="flex flex-col gap-3">
                    <div id="menu_close_button" className="flex gap-1 bg-black text-white border border-white/50 rounded-md p-1 hover:bg-gray-800 active:bg-gray-900 select-none justify-center" onClick={onClose}>
                        <X/>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <h2 className="text-3xl font-bold text-center select-none">Settings</h2>
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">Number of Particles</span>
                        <input id="number_of_particles" className="grow bg-black text-white border border-white/50 rounded-md p-1" type="text" value="2000.0"/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">Gravitation (Pixels per Second Squared))</span>
                        <input id="gravitation" className="bg-black text-white border border-white/50 rounded-md p-1" type="text" value="2000.0"/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">Gravitation Radius (Pixels)</span>
                        <input id="gravitation_radius" className="bg-black text-white border border-white/50 rounded-md p-1" type="text" value="300.0"/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">Friction (Pixels per Second)</span>
                        <input id="friction" className="bg-black text-white border border-white/50 rounded-md p-1" type="text" value="300.0"/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">Elasticity (0% - 100%)</span>
                        <input id="elasticity" className="bg-black text-white border border-white/50 rounded-md p-1" type="range" value="0.9" min="0" max="1" step="0.01"/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">Roughness (0% - 100%)</span>
                        <input id="roughness" className="bg-black text-white border border-white/50 rounded-md p-1" type="range" value="0.9" min="0" max="1" step="0.01"/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">Reset Simulation</span>
                        <input id="reset" className="bg-black text-white border border-white/50 rounded-md p-1 hover:bg-gray-800 active:bg-gray-900" type="button" value="Reset"/>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <h2 className="text-3xl font-bold text-center select-none">Information</h2>
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">FPS</span>
                        <input id="fps" className="bg-black text-white border border-white/50 rounded-md p-1" type="text" disabled/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">Delta Time (Seconds)</span>
                        <input id="time_delta" className="bg-black text-white border border-white/50 rounded-md p-1" type="text" disabled/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">Version</span>
                        <input id="version" className="bg-black text-white border border-white/50 rounded-md p-1" type="text" value={version} disabled/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">Currently in Range</span>
                        <input id="paticle_count_in_range" className="bg-black text-white border border-white/50 rounded-md p-1" type="text" disabled/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Menu