import {useEffect, useRef} from "react"

import shader_simulation_vertex_source from "./shader/simulation.vsh?raw"
import shader_simulation_fragment_source from "./shader/simulation.fsh?raw"

import shader_particle_vertex_source from "./shader/particle.vsh?raw"
import shader_particle_fragment_source from "./shader/particle.fsh?raw"

function onTouchStart(event, vertices) {
    const touches = event.touches
    for (let index = 0; index < touches.length; index++) {
        const touch = touches[index]
        const i = (touch.identifier + 1) * STRIDE_VERTICES

        if (vertices[i + OFFSET_VERTEX_FACTOR] !== 0.0)
            continue

        const rectangle = event.target.getBoundingClientRect()
        vertices[i + OFFSET_VERTEX_POSITION_X] = touch.clientX - rectangle.left
        vertices[i + OFFSET_VERTEX_POSITION_Y] = touch.clientY - rectangle.top
        vertices[i + OFFSET_VERTEX_FACTOR] = 1.0
    }
}

function onTouchMove(event, vertices) {
    const touches = event.touches
    for (let index = 0; index < touches.length; index++) {
        const touch = touches[index]
        const i = (touch.identifier + 1) * STRIDE_VERTICES

        if (vertices[i + OFFSET_VERTEX_FACTOR] === 0.0)
            continue

        const rectangle = event.target.getBoundingClientRect()
        vertices[i + OFFSET_VERTEX_POSITION_X] = touch.clientX - rectangle.left
        vertices[i + OFFSET_VERTEX_POSITION_Y] = touch.clientY - rectangle.top
    }
}

function onTouchEnd(event, vertices) {
    const touches = event.changedTouches
    for (let index = 0; index < touches.length; index++) {
        const touch = touches[index]
        const i = (touch.identifier + 1) * STRIDE_VERTICES
        vertices[i + OFFSET_VERTEX_FACTOR] = 0.0
    }
}

function onTouchCancel(event, vertices) {
    const touches = event.changedTouches
    for (let index = 0; index < touches.length; index++) {
        const touch = touches[index]
        const i = (touch.identifier + 1) * STRIDE_VERTICES
        vertices[i + OFFSET_VERTEX_FACTOR] = 0.0
    }
}

function Simulation({configuration}) {

    const canvasReference = useRef(null)

    const configurationReference = useRef(configuration)
    useEffect(() => {
        configurationReference.current = configuration;
    }, [configuration]);

    useEffect(() => {
        const canvas = canvasReference.current
        const gl = canvas.getContext("webgl2", {
            antialias: true
        })
        gl.clearColor(0, 0, 0, 0)

        function createShader(gl, type, source) {
            const shader = gl.createShader(type)
            gl.shaderSource(shader, source)

            gl.compileShader(shader)
            const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
            if (success)
                return shader

            const error = gl.getShaderInfoLog(shader)
            gl.deleteShader(shader)

            throw new Error(error)
        }

        function createProgram(gl, shader_vertex, shader_fragment, lambda) {
            const program = gl.createProgram()
            gl.attachShader(program, shader_vertex)
            gl.attachShader(program, shader_fragment)
            if(lambda)
                lambda(gl, program)
            gl.linkProgram(program)
            const success = gl.getProgramParameter(program, gl.LINK_STATUS)
            if (success)
                return program

            const error = gl.getProgramInfoLog(program)
            gl.deleteProgram(program)

            throw new Error(error)
        }

        const shader_simulation_vertex = createShader(gl, gl.VERTEX_SHADER, shader_simulation_vertex_source)
        const shader_simulation_fragment = createShader(gl, gl.FRAGMENT_SHADER, shader_simulation_fragment_source)
        const program_simulation = createProgram(gl, shader_simulation_vertex, shader_simulation_fragment, (gl, program) => {
            gl.transformFeedbackVaryings(program, ["out_position", "out_velocity"], gl.INTERLEAVED_ATTRIBS)
        })

        const shader_particle_vertex = createShader(gl, gl.VERTEX_SHADER, shader_particle_vertex_source)
        const shader_particle_fragment = createShader(gl, gl.FRAGMENT_SHADER, shader_particle_fragment_source)
        const program_particle = createProgram(gl, shader_particle_vertex, shader_particle_fragment)

        const NUMBER_OF_PARTICLES = 3_000_000
        const NUMBER_OF_FLOATS = 4
        const particles = new Float32Array(NUMBER_OF_PARTICLES * NUMBER_OF_FLOATS)
        for(let index = 0; index < NUMBER_OF_PARTICLES; index++) {
            particles[index * 4] = Math.random() * 800.0
            particles[index * 4 + 1] = Math.random() * 800.0
        }

        const buffers = [gl.createBuffer(), gl.createBuffer()]
        const vaos = [gl.createVertexArray(), gl.createVertexArray()]
        for(let index = 0; index < 2; index++) {
            const vao = vaos[index]
            gl.bindVertexArray(vao)

            const buffer = buffers[index]
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
            gl.bufferData(gl.ARRAY_BUFFER, particles, gl.DYNAMIC_COPY)

            const location_position = gl.getAttribLocation(program_simulation, "in_position")
            gl.enableVertexAttribArray(location_position)
            gl.vertexAttribPointer(location_position, 2, gl.FLOAT, false, 2 * 8, 0)

            const location_velocity = gl.getAttribLocation(program_simulation, "in_velocity")
            gl.enableVertexAttribArray(location_velocity)
            gl.vertexAttribPointer(location_velocity, 2, gl.FLOAT, false, 2 * 8, 1 * 8)
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, null)
        gl.bindVertexArray(null)

        let index_a = 0
        let index_b = 1

        const uniform_time_delta = gl.getUniformLocation(program_simulation, "u_time_delta");
        const uniform_mouse_position = gl.getUniformLocation(program_simulation, "u_mouse_position");
        const uniform_mouse_enabled = gl.getUniformLocation(program_simulation, "u_mouse_enabled");
        const uniform_resolution = gl.getUniformLocation(program_particle, "u_resolution");

        const transform_feedback = gl.createTransformFeedback()

        const canvasParent = canvas.parentNode
        function resize() {
            canvas.width = canvasParent.offsetWidth
            canvas.height = canvasParent.offsetHeight
            gl.viewport(0, 0, canvas.width, canvas.height)
        }

        window.addEventListener("resize", resize)
        resize()

        let mouse_position_x = 0
        let mouse_position_y = 0
        let mouse_enabled = false
        function onMouseDown(event, vertices) {
            if(mouse_enabled)
                return

            const rectangle = event.target.getBoundingClientRect()
            mouse_position_x = event.clientX - rectangle.left
            mouse_position_y = event.clientY - rectangle.top
            mouse_enabled = true
        }

        function onMouseMove(event, vertices) {
            if(!mouse_enabled)
                return

            const rectangle = event.target.getBoundingClientRect()
            mouse_position_x = event.clientX - rectangle.left
            mouse_position_y = event.clientY - rectangle.top
        }

        function onMouseUp(vertices) {
            mouse_enabled = false
        }

        function onMouseLeave(vertices) {
            mouse_enabled = false
        }

        const vertices = new Float32Array(8 * 3)
        canvas.addEventListener("mousemove", (event) => onMouseMove(event, vertices))
        canvas.addEventListener("mousedown", (event) => onMouseDown(event, vertices))
        canvas.addEventListener("mouseup", () => onMouseUp(vertices))
        canvas.addEventListener("mouseleave", () => onMouseLeave(vertices))
        canvas.addEventListener("contextmenu", (event) => {
            event.preventDefault()
        })
        // canvas.addEventListener("touchmove", (event) => onTouchMove(event, vertices))
        // canvas.addEventListener("touchstart", (event) => onTouchStart(event, vertices))
        // canvas.addEventListener("touchend", (event) => onTouchEnd(event, vertices))
        // canvas.addEventListener("touchcancel", (event) => onTouchCancel(event, vertices))

        let time_last_seconds = 0
        let animation_frame_id = 0
        function loop(time_now_milliseconds) {
            const time_now_seconds = time_now_milliseconds / 1000.0
            const time_delta_seconds = time_now_seconds - time_last_seconds
            time_last_seconds = time_now_seconds

            gl.useProgram(program_simulation)
            gl.uniform1f(uniform_time_delta, time_delta_seconds)
            gl.uniform2f(uniform_mouse_position, mouse_position_x, mouse_position_y)
            gl.uniform1i(uniform_mouse_enabled, mouse_enabled)

            const vao_a = vaos[index_a]
            const buffer_b = buffers[index_b]
            gl.bindVertexArray(vao_a)
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transform_feedback)
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer_b)

            gl.enable(gl.RASTERIZER_DISCARD)
            gl.beginTransformFeedback(gl.POINTS)
            gl.drawArrays(gl.POINTS, 0, NUMBER_OF_PARTICLES)
            gl.endTransformFeedback()
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null)
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null)
            gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null)
            gl.disable(gl.RASTERIZER_DISCARD)

            const vao_b = vaos[index_b]
            gl.clear(gl.COLOR_BUFFER_BIT)
            gl.useProgram(program_particle)
            gl.uniform2f(uniform_resolution, canvas.width, canvas.height)
            gl.bindVertexArray(vao_b)
            gl.drawArrays(gl.POINTS, 0, NUMBER_OF_PARTICLES)

            let index_temporary = index_a
            index_a = index_b
            index_b = index_temporary

            animation_frame_id = requestAnimationFrame(loop)
        }

        animation_frame_id = requestAnimationFrame(loop)

        return () => {
            cancelAnimationFrame(animation_frame_id)
            window.removeEventListener("resize", resize)
        }
    }, [configuration.numberOfParticles, canvasReference])

    return <canvas className="grow bg-black select-none touch-none" ref={canvasReference}></canvas>
}

export default Simulation