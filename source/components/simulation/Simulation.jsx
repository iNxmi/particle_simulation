import {SimulationCPU, SimulationWebGL, SimulationWebGPU} from "."

async function isWebGPUSupported() {
    if (!navigator.gpu)
        return false

    try {
        const adapter = await navigator.gpu.requestAdapter();
        return !!adapter
    } catch (exception) {
        return false
    }
}

function isWebGLSupported() {
    try {
        const canvas = document.createElement("canvas")
        return !!(
            window.WebGLRenderingContext &&
            (canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        )
    } catch (exception) {
        return false
    }
}

function Simulation() {
    if (isWebGPUSupported())
        return <SimulationWebGPU/>

    if (isWebGLSupported())
        return <SimulationWebGL/>

    return <SimulationCPU/>
}

export default Simulation