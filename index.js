import {createIcons, icons} from "lucide"
import {Vec2 as Vector} from "gl-matrix"

createIcons({icons})

const UP = new Vector(0.0, -1.0)
const DOWN = new Vector(0.0, 1.0)
const LEFT = new Vector(-1.0, 0.0)
const RIGHT = new Vector(1.0, 0.0)

function getRoughNormal(normal) {
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

class Particle {
    constructor() {
        this.position = new Vector(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        )

        this.position_previous = Vector.clone(this.position)

        this.velocity = new Vector()

        this.hue = 0
    }

    update(time_delta) {
        this.position_previous.copy(this.position)

        const distance = Vector.distance(mouse_position, this.position)
        if (enabled && distance <= gravitation_radius) {
            const acceleration = getAcceleration(this.position).scale(time_delta)
            this.velocity.add(acceleration)
        }

        if (this.velocity.magnitude > 0.0) {
            const friction_vector = Vector.clone(this.velocity)
                .normalize()
                .scale(-1.0 * friction * time_delta)

            this.velocity.add(friction_vector)

            const direction_velocity = Vector.clone(this.velocity).normalize()
            const direction_friction = Vector.clone(friction_vector).normalize()
            const dot = direction_velocity.dot(direction_friction)
            if (dot >= 0.9999)
                Vector.zero(this.velocity)
        }

        this.position.scaleAndAdd(this.velocity, time_delta)

        if (this.position.x < 0.0) {
            const normal = getRoughNormal(RIGHT)
            reflect(this.velocity, this.velocity, normal).scale(elasticity)
            this.position.x = 0.0
        }

        if (this.position.x >= canvas.width) {
            const normal = getRoughNormal(LEFT)
            reflect(this.velocity, this.velocity, normal).scale(elasticity)
            this.position.x = canvas.width - 1
        }

        if (this.position.y < 0.0) {
            const normal = getRoughNormal(DOWN)
            reflect(this.velocity, this.velocity, normal).scale(elasticity)
            this.position.y = 0.0
        }

        if (this.position.y >= canvas.height) {
            const normal = getRoughNormal(UP)
            reflect(this.velocity, this.velocity, normal).scale(elasticity)
            this.position.y = canvas.height - 1
        }

        const speed = this.velocity.magnitude
        this.hue = Math.floor(Math.min(speed / 1024.0, 1.0) * 360.0)
    }

    render(context, time_delta) {
        context.moveTo(this.position_previous.x, this.position_previous.y)
        context.lineTo(this.position.x + 1, this.position.y + 1)
    }
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
}

const settings_number_of_particles = document.getElementById("number_of_particles")
const settings_gravitation = document.getElementById("gravitation")
const settings_gravitation_radius = document.getElementById("gravitation_radius")
const settings_friction = document.getElementById("friction")
const settings_elasticity = document.getElementById("elasticity")
const settings_roughness = document.getElementById("roughness")
const settings_reset = document.getElementById("reset")
// mass

const canvas = document.getElementById("canvas")
const canvas_parent = canvas.parentNode
window.addEventListener("resize", (event) => {
    canvas.width = canvas_parent.offsetWidth
    canvas.height = canvas_parent.offsetHeight
})
canvas.width = canvas_parent.offsetWidth
canvas.height = canvas_parent.offsetHeight

const information_time_delta = document.getElementById("time_delta")
const information_fps = document.getElementById("fps")
const information_particle_count_in_range = document.getElementById("paticle_count_in_range")

const mouse_position = new Vector()
canvas.addEventListener("mousemove", (event) => {
    const rectangle = event.target.getBoundingClientRect()

    mouse_position.x = event.clientX - rectangle.left
    mouse_position.y = event.clientY - rectangle.top
})

const menu_close_root = document.getElementById("menu_close_root")

const menu_open_button = document.getElementById("menu_open_button")
menu_open_button.addEventListener("click", (event) => {
    menu_open_button.classList.add("hidden")
    menu_close_root.classList.remove("hidden")
})

const menu_close_button = document.getElementById("menu_close_button")
menu_close_button.addEventListener("click", (event) => {
    menu_open_button.classList.remove("hidden")
    menu_close_root.classList.add("hidden")
})

let enabled = false
canvas.addEventListener("mousedown", (event) => {
    enabled = true
})
canvas.addEventListener("mouseup", (event) => {
    enabled = false
})
canvas.addEventListener("mouseleave", (event) => {
    enabled = false
})
canvas.addEventListener("touchstart", (event) => {
    const touch = event.touches[0]
    const rectangle = event.target.getBoundingClientRect()

    mouse_position.x = touch.clientX - rectangle.left
    mouse_position.y = touch.clientY - rectangle.top

    enabled = true
})
canvas.addEventListener("touchend", (event) => {
    enabled = false
})
canvas.addEventListener("touchmove", (event) => {
    const touch = event.touches[0]
    const rectangle = event.target.getBoundingClientRect()

    mouse_position.x = touch.clientX - rectangle.left
    mouse_position.y = touch.clientY - rectangle.top
})
canvas.addEventListener("touchcancel", (event) => {
    enabled = false
})


let gravitation = 0

function updateGravitation() {
    gravitation = Number(settings_gravitation.value)
    settings_gravitation.value = gravitation
}

settings_gravitation.onchange = updateGravitation
updateGravitation()

let gravitation_radius = 0

function updateGravitationRadius() {
    gravitation_radius = Number(settings_gravitation_radius.value)
    settings_gravitation_radius.value = gravitation_radius
}

settings_gravitation_radius.onchange = updateGravitationRadius
updateGravitationRadius()

let friction = 0

function updateFriction() {
    friction = Number(settings_friction.value)
    settings_friction.value = friction
}

settings_friction.onchange = updateFriction
updateFriction()

let elasticity = 0

function updateElasticity() {
    elasticity = clamp(Number(settings_elasticity.value), 0.0, 1.0)
    settings_elasticity.value = elasticity
}

settings_elasticity.onchange = updateElasticity
updateElasticity()

let roughness = 0

function updateRoughness() {
    roughness = clamp(Number(settings_roughness.value), 0.0, 1.0)
    settings_roughness.value = roughness
}

settings_roughness.onchange = updateRoughness
updateRoughness()

let particles = []

function updateParticles() {
    const number_of_particles = Math.floor(settings_number_of_particles.value)
    settings_number_of_particles.value = number_of_particles

    particles = [];
    for (let index = 0; index < number_of_particles; index++)
        particles[index] = new Particle()
}

settings_number_of_particles.onchange = updateParticles
updateParticles()

settings_reset.onclick = updateParticles

function getIntensitySin(position) {
    const distance = Vector.distance(mouse_position, position)
    if (distance > gravitation_radius)
        return 0.0

    const x = clamp(distance / gravitation_radius, 0.0, 1.0)
    return Math.sin(x * Math.PI * 5) / 2 + 0.5
}

function getIntensityOld(position) {
    const distance = Vector.distance(mouse_position, position)
    if (distance > gravitation_radius)
        return 0.0

    const x = clamp(distance / gravitation_radius, 0.0, 1.0)
    return -Math.pow(x, 6) + 1
}

function getIntensity(position) {
    const distance = Vector.distance(mouse_position, position)
    return 1.0 / (distance)
}

function getAcceleration(position) {
    const intensity = getIntensityOld(position)
    const influence = gravitation * intensity

    return Vector.clone(mouse_position)
        .subtract(position)
        .normalize()
        .scale(influence)
}

const context = canvas.getContext("2d")
context.lineWidth = 1
context.fillStyle = "white"
context.strokeStyle = "white"

function update(time_delta) {
    information_time_delta.value = Math.round(time_delta * 10000.0) / 10000.0
    information_fps.value = Math.round(1.0 / time_delta)

    let count = 0
    for (const particle of particles) {
        particle.update(time_delta)
        if (Vector.distance(mouse_position, particle.position) <= gravitation_radius)
            count++
    }

    information_particle_count_in_range.value = count
}

function render(time_delta) {
    context.clearRect(0, 0, canvas.width, canvas.height)

    const sorted = Object.groupBy(particles, ({hue}) => hue)
    for (const [hue, p] of Object.entries(sorted)) {
        context.strokeStyle = `hsl(${hue}deg, 100%, 50%)`

        context.beginPath()
        for (const particle of p)
            particle.render(context, time_delta)
        context.stroke()
    }

    if (enabled) {
        context.strokeStyle = "#222222"

        context.beginPath()
        context.arc(mouse_position.x, mouse_position.y, gravitation_radius, 0.0, 2.0 * Math.PI)
        context.stroke()
    }
}

let time_last = 0;

function loop(time_now_ms) {
    const time_delta = (time_now_ms / 1000.0) - time_last
    time_last += time_delta

    update(time_delta)
    render(time_delta)

    requestAnimationFrame(loop)
}

requestAnimationFrame(loop)