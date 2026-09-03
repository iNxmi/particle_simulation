import {useEffect, useRef} from "react"
import {Vec2 as Vector} from "gl-matrix"
import {compile} from "mathjs"

const UP = new Vector(0.0, -1.0)
const DOWN = new Vector(0.0, 1.0)
const LEFT = new Vector(-1.0, 0.0)
const RIGHT = new Vector(1.0, 0.0)

function getRoughNormal(normal, roughness) {
    const random = Math.random() * 2.0 - 1.0
    const degree = 90.0 * roughness * random
    const radian = degree * Math.PI / 180.0

    const out = Vector.clone(normal)
    return Vector.rotate(out, out, new Vector(), radian)
}

function reflect(out, incident, normal) {
    const dot = Vector.dot(incident, normal)
    Vector.scaleAndAdd(out, incident, normal, -2.0 * dot)
    return out
}

function remap(value, in_min, in_max, out_min, out_max) {
    return out_min + ((value - in_min) * (out_max - out_min)) / (in_max - in_min)
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
}

class Particle {
    constructor(world_width, world_height) {
        this.position = new Vector(
            Math.random() * world_width,
            Math.random() * world_height
        )

        this.position_previous = Vector.clone(this.position)

        this.velocity = new Vector()

        this.hue = 0
    }

    update(time_delta, world_width, world_height, vertices, gravitation, gravitation_radius, elasticity, friction, roughness, intensityFunction) {
        this.position_previous.copy(this.position)

        const acceleration = new Vector()
        for (const [_, vertex] of vertices)
            acceleration.add(getAcceleration(intensityFunction, vertex, this.position, gravitation, gravitation_radius))

        this.velocity.scaleAndAdd(acceleration, time_delta)

        if (this.velocity.magnitude > 0.0) {
            const direction_friction = Vector.clone(this.velocity).normalize().scale(-1.0)
            this.velocity.scaleAndAdd(direction_friction, friction * time_delta)

            const direction_velocity = Vector.clone(this.velocity).normalize()
            const dot = direction_velocity.dot(direction_friction)
            if (dot >= 0.9999)
                Vector.zero(this.velocity)
        }

        this.position.scaleAndAdd(this.velocity, time_delta)

        if (this.position.x < 0.0) {
            const normal = getRoughNormal(RIGHT, roughness)
            reflect(this.velocity, this.velocity, normal).scale(elasticity)
            this.position.x = 0.0
        }

        if (this.position.x >= world_width) {
            const normal = getRoughNormal(LEFT, roughness)
            reflect(this.velocity, this.velocity, normal).scale(elasticity)
            this.position.x = world_width - 1
        }

        if (this.position.y < 0.0) {
            const normal = getRoughNormal(DOWN, roughness)
            reflect(this.velocity, this.velocity, normal).scale(elasticity)
            this.position.y = 0.0
        }

        if (this.position.y >= world_height) {
            const normal = getRoughNormal(UP, roughness)
            reflect(this.velocity, this.velocity, normal).scale(elasticity)
            this.position.y = world_height - 1
        }

        const speed = this.velocity.magnitude
        this.hue = Math.floor(Math.min(speed / 1024.0, 1.0) * 360.0)
    }

    render(context, time_delta) {
        context.moveTo(this.position_previous.x, this.position_previous.y)
        context.lineTo(this.position.x + 1, this.position.y + 1)
    }
}

function getIntensity(intensityFunction, origin, position, gravitation_radius) {
    const distance = Vector.distance(origin, position)
    if (distance > gravitation_radius)
        return 0.0

    const x = clamp(distance / gravitation_radius, 0.0, 1.0)
    return intensityFunction.evaluate({x: x})
}

function getAcceleration(intensityFunction, origin, position, gravitation, gravitation_radius) {
    const intensity = getIntensity(intensityFunction, origin, position, gravitation_radius)
    return Vector.clone(origin)
        .subtract(position)
        .normalize()
        .scale(gravitation * intensity)
}

function onMouseMove(event, vertices) {
    if (!vertices.has("mouse"))
        return

    const rectangle = event.target.getBoundingClientRect()

    const vertex = vertices.get("mouse")
    vertex.x = event.clientX - rectangle.left
    vertex.y = event.clientY - rectangle.top
}

function onMouseDown(event, vertices) {
    if (vertices.has("mouse"))
        return

    const rectangle = event.target.getBoundingClientRect()
    const vertex = new Vector(
        event.clientX - rectangle.left,
        event.clientY - rectangle.top
    )
    vertices.set("mouse", vertex)
}

function onMouseUp(vertices) {
    if (vertices.has("mouse"))
        vertices.delete("mouse")
}

function onMouseLeave(vertices) {
    if (vertices.has("mouse"))
        vertices.delete("mouse")
}

function onTouchStart(event, vertices) {
    for (const touch of event.touches) {
        const rectangle = event.target.getBoundingClientRect()
        const vertex = new Vector(
            touch.clientX - rectangle.left,
            touch.clientY - rectangle.top
        )

        vertices.set(touch.identifier, vertex)
        console.log(touch.identifier)
    }
}

function onTouchEnd(event, vertices) {
    for (const touch of event.changedTouches)
        vertices.delete(touch.identifier)
}

function onTouchMove(event, vertices) {
    for (const touch of event.touches) {
        const identifier = touch.identifier

        if (!vertices.has(identifier))
            continue

        const vertex = vertices.get(identifier)
        const rectangle = event.target.getBoundingClientRect()
        vertex.x = touch.clientX - rectangle.left
        vertex.y = touch.clientY - rectangle.top
    }
}

function onTouchCancel(event, vertices) {
    for (const touch of event.changedTouches)
        vertices.delete(touch.identifier)
}

function Simulation({configuration}) {

    const configurationReference = useRef(configuration)
    useEffect(() => {
        configurationReference.current = configuration;
    }, [configuration]);

    const canvas_reference = useRef(null)
    const particles = useRef([])
    const intensityFunction = useRef(null)

    function initializeParticles(numberOfParticles, world_width, world_height) {
        particles.current = []
        for (let index = 0; index < numberOfParticles; index++) {
            particles.current[index] = new Particle(world_width, world_height)
        }
    }
    useEffect(() => {
        initializeParticles(configuration.numberOfParticles, 800, 800);
    }, [configuration.numberOfParticles]);

    useEffect(() => {
        intensityFunction.current = compile(configuration.intensityExpression)
    }, [configuration.intensityExpression]);

    useEffect(() => {
        const canvas = canvas_reference.current
        const context = canvas.getContext("2d")
        context.lineWidth = 1
        context.fillStyle = "white"
        context.strokeStyle = "white"
        context.imageSmoothingEnabled = false

        const canvas_parent = canvas.parentNode
        window.addEventListener("resize", (event) => {
            resize()
        })

        function resize() {
            canvas.width = canvas_parent.offsetWidth
            canvas.height = canvas_parent.offsetHeight
        }

        resize()

        const vertices = new Map()

        canvas.addEventListener("mousemove", (event) => onMouseMove(event, vertices))
        canvas.addEventListener("mousedown", (event) => onMouseDown(event, vertices))
        canvas.addEventListener("mouseup", () => onMouseUp(vertices))
        canvas.addEventListener("mouseleave", () => onMouseLeave(vertices))
        canvas.addEventListener("contextmenu", (event) => {event.preventDefault()})

        canvas.addEventListener("touchmove", (event) => onTouchMove(event, vertices))
        canvas.addEventListener("touchstart", (event) => onTouchStart(event, vertices))
        canvas.addEventListener("touchend", (event) => onTouchEnd(event, vertices))
        canvas.addEventListener("touchcancel", (event) => onTouchCancel(event, vertices))

        function update(time_delta) {
            for (const particle of particles.current)
                particle.update(
                    time_delta,
                    canvas.width, canvas.height,
                    vertices,
                    configurationReference.current.gravitation,
                    configurationReference.current.gravitationRadius,
                    configurationReference.current.elasticity,
                    configurationReference.current.friction,
                    configurationReference.current.roughness,
                    intensityFunction.current
                )
        }

        function render(time_delta) {
            context.clearRect(0, 0, canvas.width, canvas.height)

            const sorted = Object.groupBy(particles.current, ({hue}) => hue)
            for (const [hue, p] of Object.entries(sorted)) {
                context.beginPath()
                for (const particle of p)
                    particle.render(context, time_delta)
                context.strokeStyle = `hsl(${hue}deg, 100%, 50%)`
                context.stroke()
            }

            // context.beginPath()
            // for (const [_, vertex] of vertices)
            //     // context.moveTo(vertex.position.x, vertex.position.y)
            //     context.arc(vertex.x, vertex.y, gravitation_radius, 0.0, 2.0 * Math.PI)
            // context.strokeStyle = "#222222"
            // context.stroke()
        }

        let time_last = 0;
        let animation_frame_id = 0

        function loop(time_now_ms) {
            const time_delta = (time_now_ms / 1000.0) - time_last
            time_last += time_delta

            update(time_delta)
            render(time_delta)

            animation_frame_id = requestAnimationFrame(loop)
        }

        requestAnimationFrame(loop)

        return () => cancelAnimationFrame(animation_frame_id)
    }, [])

    return <canvas className="grow bg-black select-none touch-none" ref={canvas_reference} width={800} height={800}></canvas>
}

export default Simulation