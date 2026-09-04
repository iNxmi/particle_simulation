import {useEffect, useRef} from "react"
import {Vec2 as Vector} from "gl-matrix"
import {compile} from "mathjs"

const STRIDE_PARTICLES = 6
const OFFSET_PARTICLE_POSITION_X = 0
const OFFSET_PARTICLE_POSITION_Y = 1
const OFFSET_PARTICLE_POSITION_PREVIOUS_X = 2
const OFFSET_PARTICLE_POSITION_PREVIOUS_Y = 3
const OFFSET_PARTICLE_VELOCITY_X = 4
const OFFSET_PARTICLE_VELOCITY_Y = 5

const STRIDE_VERTICES = 3
const OFFSET_VERTEX_POSITION_X = 0
const OFFSET_VERTEX_POSITION_Y = 1
const OFFSET_VERTEX_FACTOR = 2

const PI = Math.PI
const PI_HALF = Math.PI * 0.5

const scratchNormal = new Vector()
const scratchReflection = new Vector()

function applyRoughNormal(out, normalRadian, roughness) {
    const deviation = (Math.random() * 2.0 - 1.0) * PI_HALF * roughness
    const angle = normalRadian + deviation

    out.x = Math.cos(angle)
    out.y = Math.sin(angle)
}

function reflect(incident, normal) {
    const dot = Vector.dot(incident, normal)
    Vector.scaleAndAdd(incident, incident, normal, -2.0 * dot)
}

function remap(value, in_min, in_max, out_min, out_max) {
    return out_min + ((value - in_min) * (out_max - out_min)) / (in_max - in_min)
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
}

function onMouseDown(event, vertices) {
    if (vertices[OFFSET_VERTEX_FACTOR] !== 0.0)
        return

    const rectangle = event.target.getBoundingClientRect()
    vertices[OFFSET_VERTEX_POSITION_X] = event.clientX - rectangle.left
    vertices[OFFSET_VERTEX_POSITION_Y] = event.clientY - rectangle.top
    vertices[OFFSET_VERTEX_FACTOR] =  1.0
}

function onMouseMove(event, vertices) {
    if (vertices[OFFSET_VERTEX_FACTOR] === 0.0)
        return

    const rectangle = event.target.getBoundingClientRect()
    vertices[OFFSET_VERTEX_POSITION_X] = event.clientX - rectangle.left
    vertices[OFFSET_VERTEX_POSITION_Y] = event.clientY - rectangle.top
}

function onMouseUp(vertices) {
    vertices[OFFSET_VERTEX_FACTOR] = 0.0
}

function onMouseLeave(vertices) {
    vertices[OFFSET_VERTEX_FACTOR] = 0.0
}

function onTouchStart(event, vertices) {
    const touches = event.touches
    for (let index = 0; index < touches.length; index++) {
        const touch = touches[index]
        const i = (touch.identifier + 1) * STRIDE_VERTICES

        if(vertices[i + OFFSET_VERTEX_FACTOR] !== 0.0)
            continue

        const rectangle = event.target.getBoundingClientRect()
        vertices[i + OFFSET_VERTEX_POSITION_X] = touch.clientX - rectangle.left
        vertices[i + OFFSET_VERTEX_POSITION_Y] = touch.clientY - rectangle.top
        vertices[i + OFFSET_VERTEX_FACTOR] =  1.0
    }
}

function onTouchMove(event, vertices) {
    const touches = event.touches
    for (let index = 0; index < touches.length; index++) {
        const touch = touches[index]
        const i = (touch.identifier + 1) * STRIDE_VERTICES

        if(vertices[i + OFFSET_VERTEX_FACTOR] === 0.0)
            continue

        const rectangle = event.target.getBoundingClientRect()
        vertices[i + OFFSET_VERTEX_POSITION_X] =  touch.clientX - rectangle.left
        vertices[i + OFFSET_VERTEX_POSITION_Y] =  touch.clientY - rectangle.top
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

const vertex_shader_source = (`#version 300 es
in vec2 a_position;
in vec2 a_velocity;

uniform vec2 u_resolution;

out vec2 v_velocity;

void main() {
    v_velocity = a_velocity;

    vec2 clip_space = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip_space.x, -clip_space.y, 0.0, 1.0);
}
`)

const fragment_shader_source = (`#version 300 es
precision mediump float;

in vec2 v_velocity;

out vec4 fragColor;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    float hue = length(v_velocity) / 1024.0;
    vec3 hsv = vec3(clamp(hue, 0.0, 1.0), 1.0, 1.0);
    vec3 rgb = hsv2rgb(hsv);
    fragColor = vec4(rgb, 1.0);
}
`)

function Simulation({configuration}) {

    const canvasReference = useRef(null)

    const configurationReference = useRef(configuration)
    useEffect(() => {
        configurationReference.current = configuration;
    }, [configuration]);

    const intensityFunctionReference = useRef(null)
    useEffect(() => {
        intensityFunctionReference.current = compile(configuration.intensityExpression)
    }, [configuration.intensityExpression]);

    useEffect(() => {
        const canvas = canvasReference.current
        const gl = canvas.getContext("webgl2")

        function createShader(gl, type, source) {
            const shader = gl.createShader(type)
            gl.shaderSource(shader, source)
            gl.compileShader(shader)

            const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
            if(success)
                return shader

            const error = gl.getShaderInfoLog(shader)
            console.log(error)

            gl.deleteShader(shader)
        }

        const shaderVertex = createShader(gl, gl.VERTEX_SHADER, vertex_shader_source)
        const shaderFragment = createShader(gl, gl.FRAGMENT_SHADER, fragment_shader_source)

        function createProgram(gl, vertexShader, fragmentShader) {
            const program = gl.createProgram()
            gl.attachShader(program, vertexShader)
            gl.attachShader(program, fragmentShader)
            gl.linkProgram(program)

            const success = gl.getProgramParameter(program, gl.LINK_STATUS)
            if(success)
                return program

            const error = gl.getProgramIngoLog(program)
            console.log(error)

            gl.deleteProgram(program)
        }

        const program = createProgram(gl, shaderVertex, shaderFragment)

        const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
        const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
        const velocityAttributeLocation = gl.getAttribLocation(program, "a_velocity")

        const vertexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

        const particles = new Float32Array(configurationReference.current.numberOfParticles * STRIDE_PARTICLES)
        for (let index = 0; index < configurationReference.current.numberOfParticles; index++) {
            const i = index * STRIDE_PARTICLES

            const x = Math.random() * 800
            const y = Math.random() * 800

            particles[i + OFFSET_PARTICLE_POSITION_X] = x
            particles[i + OFFSET_PARTICLE_POSITION_Y] = y
            particles[i + OFFSET_PARTICLE_POSITION_PREVIOUS_X] = x
            particles[i + OFFSET_PARTICLE_POSITION_PREVIOUS_Y] = y
        }

        gl.bufferData(gl.ARRAY_BUFFER, particles, gl.DYNAMIC_DRAW)

        gl.clearColor(0, 0, 0, 0)


        const canvasParent = canvas.parentNode
        function resize() {
            canvas.width = canvasParent.offsetWidth
            canvas.height = canvasParent.offsetHeight
            gl.viewport(0, 0, canvas.width, canvas.height)
        }
        window.addEventListener("resize", resize)
        resize()

        const vertices = new Float32Array(8 * 3)
        canvas.addEventListener("mousemove", (event) => onMouseMove(event, vertices))
        canvas.addEventListener("mousedown", (event) => onMouseDown(event, vertices))
        canvas.addEventListener("mouseup", () => onMouseUp(vertices))
        canvas.addEventListener("mouseleave", () => onMouseLeave(vertices))
        canvas.addEventListener("contextmenu", (event) => {
            event.preventDefault()
        })
        canvas.addEventListener("touchmove", (event) => onTouchMove(event, vertices))
        canvas.addEventListener("touchstart", (event) => onTouchStart(event, vertices))
        canvas.addEventListener("touchend", (event) => onTouchEnd(event, vertices))
        canvas.addEventListener("touchcancel", (event) => onTouchCancel(event, vertices))

        function update(time_delta) {
            const config = configurationReference.current

            const gravitation = config.gravitation
            const gravitationRadius = config.gravitationRadius
            const friction = config.friction
            const elasticity = config.elasticity
            const roughness = config.roughness

            for (let index = 0; index < config.numberOfParticles; index++) {
                const i = index * STRIDE_PARTICLES

                let positionX = particles[i + OFFSET_PARTICLE_POSITION_X]
                let positionY = particles[i + OFFSET_PARTICLE_POSITION_Y]
                let velocityX = particles[i + OFFSET_PARTICLE_VELOCITY_X]
                let velocityY = particles[i + OFFSET_PARTICLE_VELOCITY_Y]

                particles[i + OFFSET_PARTICLE_POSITION_PREVIOUS_X] = positionX
                particles[i + OFFSET_PARTICLE_POSITION_PREVIOUS_Y] = positionY

                let accelerationX = 0.0
                let accelerationY = 0.0
                for (let indexVertex = 0; indexVertex < vertices.length / STRIDE_VERTICES; indexVertex++) {
                    const iVertex = indexVertex * STRIDE_VERTICES
                    const factor = vertices[iVertex + OFFSET_VERTEX_FACTOR]
                    if(factor === 0.0)
                        continue

                    const deltaX = vertices[iVertex + OFFSET_VERTEX_POSITION_X] - positionX
                    const deltaY = vertices[iVertex + OFFSET_VERTEX_POSITION_Y] - positionY
                    const distance = Math.hypot(deltaX, deltaY)

                    if (distance >= gravitationRadius)
                        continue

                    const normalized = distance / gravitationRadius
                    const intensity = -Math.pow(normalized, 5) + 1
                    const scalar = (gravitation * intensity) / distance

                    accelerationX += deltaX * scalar
                    accelerationY += deltaY * scalar
                }

                velocityX += accelerationX * time_delta
                velocityY += accelerationY * time_delta

                let speed = Math.hypot(velocityX, velocityY)
                if(speed > 0.0) {
                    const reduction = friction * time_delta
                    const result = Math.max(0.0, speed - reduction)
                    const ratio = result / speed

                    velocityX *= ratio
                    velocityY *= ratio
                }

                positionX += velocityX * time_delta
                positionY += velocityY * time_delta

                scratchReflection.x = velocityX
                scratchReflection.y = velocityY

                if (positionX < 0.0) {
                    positionX = 0.0

                    applyRoughNormal(scratchNormal, 0.0, roughness)
                    reflect(scratchReflection, scratchNormal)

                    velocityX = scratchReflection.x * elasticity
                    velocityY = scratchReflection.y * elasticity
                } else if (positionX >= canvas.width) {
                    positionX = canvas.width - 1.0

                    applyRoughNormal(scratchNormal, PI, roughness)
                    reflect(scratchReflection, scratchNormal)

                    velocityX = scratchReflection.x * elasticity
                    velocityY = scratchReflection.y * elasticity
                }

                if (positionY < 0.0) {
                    positionY = 0.0

                    applyRoughNormal(scratchNormal, PI_HALF, roughness)
                    reflect(scratchReflection, scratchNormal)

                    velocityX = scratchReflection.x * elasticity
                    velocityY = scratchReflection.y * elasticity
                } else if (positionY >= canvas.height) {
                    positionY = canvas.height - 1.0

                    applyRoughNormal(scratchNormal, -PI_HALF, roughness)
                    reflect(scratchReflection, scratchNormal)

                    velocityX = scratchReflection.x * elasticity
                    velocityY = scratchReflection.y * elasticity
                }

                particles[i + OFFSET_PARTICLE_POSITION_X]=positionX
                particles[i + OFFSET_PARTICLE_POSITION_Y]=positionY
                particles[i + OFFSET_PARTICLE_VELOCITY_X]=velocityX
                particles[i + OFFSET_PARTICLE_VELOCITY_Y]=velocityY
            }
        }

        gl.enable(gl.DEPTH_TEST)
        function render() {
            const config = configurationReference.current

            gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT)

            gl.useProgram(program)

            gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height)

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

            gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(particles))

            gl.enableVertexAttribArray(positionAttributeLocation)
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, STRIDE_PARTICLES * 4, 0)

            gl.enableVertexAttribArray(velocityAttributeLocation)
            gl.vertexAttribPointer(velocityAttributeLocation, 2, gl.FLOAT, false, STRIDE_PARTICLES * 4, 4 * 4)

            gl.drawArrays(gl.POINTS, 0, particles.length / STRIDE_PARTICLES)
        }

        let time_last = 0;
        let animation_frame_id = 0

        function loop(time_now_ms) {
            const time_now_s = time_now_ms / 1000.0
            const time_delta = time_now_s - time_last
            time_last = time_now_s

            update(time_delta)
            render()

            animation_frame_id = requestAnimationFrame(loop)
        }
        animation_frame_id = requestAnimationFrame(loop)

        return () => {
            window.removeEventListener("resize", resize)
            cancelAnimationFrame(animation_frame_id)
        }
    }, [configuration.numberOfParticles, canvasReference])

    return <canvas className="grow bg-black select-none touch-none" ref={canvasReference}></canvas>
}

export default Simulation