function vector(x, y) {
    return {x: x, y: y}
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
}

function getLength(x, y) {
    const squared = x * x + y * y
    const length = Math.sqrt(squared)
    return length
}

function getNormalized(x, y) {
    const length = getLength(x, y)
    if(length == 0)
        return {x: 0, y: 0}

    return {
        x: x / length,
        y: y / length
    }
}

const settings_number_of_particles = document.getElementById("number_of_particles")
const settings_gravitation = document.getElementById("gravitation")
const settings_gravitation_radius = document.getElementById("gravitation_radius")
const settings_friction = document.getElementById("friction")
const settings_elasticity = document.getElementById("elasticity")
// roughness (for walls)
// mass

const canvas = document.getElementById("canvas")

const information_time_delta = document.getElementById("time_delta")
const information_fps = document.getElementById("fps")

let canvas_width = canvas.width
let canvas_height = canvas.height

let mouse_x = canvas_width / 2
let mouse_y = canvas_height / 2
canvas.addEventListener("mousemove", (event) => {
    const rectangle = event.target.getBoundingClientRect()

    const x = event.clientX - rectangle.left
    const y = event.clientY - rectangle.top

    mouse_x = x
    mouse_y = y
})

let enabled = false
canvas.addEventListener("mousedown", (event) => {
    enabled = true
})
canvas.addEventListener("mouseup", (event) => {
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
    elasticity = Math.min(Math.max(Number(settings_elasticity.value), 0.0), 1.0)
    settings_elasticity.value = elasticity
}
settings_elasticity.onchange = updateElasticity
updateElasticity()

let particles = []
function updateParticles() {
    const number_of_particles = Math.floor(settings_number_of_particles.value)
    settings_number_of_particles.value = number_of_particles

    particles = [];
    for (let index = 0; index < number_of_particles; index++) {
        const particle = {
            position_x: Math.random() * canvas_width,
            position_y: Math.random() * canvas_height,

            position_x_previous: 0,
            position_y_previous: 0,

            velocity_x: 0.0,
            velocity_y: 0.0,

            color: 0.0
        }

        particles[index] = particle
    }
}
settings_number_of_particles.onchange = updateParticles
updateParticles()


function getInterpolationFactor(t) {
    return (-Math.pow(t, 6)) + 1
}

/*
function getAcceleration(x, y) {
    let delta_x = mouse_x - x
    let delta_y = mouse_y - y
    let length = getLength(delta_x, delta_y)

    let t = Math.min(Math.max(length / gravitation_radius, 0.0), 1.0)
    let factor = getInterpolationFactor(t)

    let influence = gravitation * factor

    let normalized_x = delta_x / length
    let normalized_y = delta_y / length

    return {
        x: normalized_x * influence,
        y: normalized_y * influence
    }
}
*/

function getIntensityOld(x, y) {
    const delta_x = mouse_x - x
    const delta_y = mouse_y - y

    const distance = getLength(delta_x, delta_y)
    if(distance > gravitation_radius)
        return 0.0

    const t = clamp(distance / gravitation_radius, 0.0, 1.0)
    const intensity = (-Math.pow(t, 6)) + 1

    //console.log(intensity)

    return intensity
}

function getIntensity(x, y) {
    const delta_x = mouse_x - x
    const delta_y = mouse_y - y
    const distance = getLength(delta_x, delta_y)

    const intensity = 1.0 / (distance * distance)

    return intensity
}

function getAcceleration(x, y) {
    const intensity = getIntensityOld(x, y)
    //console.log(intensity)
    const influence = gravitation * intensity

    const delta_x = mouse_x - x
    const delta_y = mouse_y - y
    const direction = getNormalized(delta_x, delta_y)

    return {
        x: direction.x * influence,
        y: direction.y * influence
    }
}

const context = canvas.getContext("2d")
context.lineWidth = 1
context.fillStyle = "white"
context.strokeStyle = "white"

function update(time_delta) {
    information_time_delta.value = time_delta
    information_fps.value = 1.0 / time_delta

    for (const particle of particles) {
        particle.position_x_previous = particle.position_x
        particle.position_y_previous = particle.position_y

        if(enabled) {
            const acceleration = getAcceleration(particle.position_x, particle.position_y)
            particle.velocity_x += acceleration.x * time_delta
            particle.velocity_y += acceleration.y * time_delta
        }

        const direction = getNormalized(particle.velocity_x, particle.velocity_y)
        particle.velocity_x -= friction * direction.x * time_delta
        particle.velocity_y -= friction * direction.y * time_delta

        particle.position_x += particle.velocity_x * time_delta
        particle.position_y += particle.velocity_y * time_delta

        if (particle.position_x < 0.0) {
            particle.velocity_x *= -elasticity
            particle.position_x = 0.0
        }

        if (particle.position_x >= canvas_width) {
            particle.velocity_x *= -elasticity
            particle.position_x = canvas_width - 1
        }

        if (particle.position_y < 0.0) {
            particle.velocity_y *= -elasticity
            particle.position_y = 0.0
        }

        if (particle.position_y >= canvas_height) {
            particle.velocity_y *= -elasticity
            particle.position_y = canvas_height - 1
        }

        const speed = getLength(particle.velocity_x, particle.velocity_y)
        particle.degree = Math.floor(Math.min(speed / 1024.0, 1.0) * 360.0)

        console.log(speed)
    }
}

function render(time_delta) {
    context.clearRect(0, 0, canvas_width, canvas_height)

    const sorted = Object.groupBy(particles, ({ degree }) => degree)
    for (const [degree, p] of Object.entries(sorted)) {
        context.strokeStyle = `hsl(${degree}deg, 100%, 50%)`
        context.beginPath()
        for (let index = 0; index < p.length; index++) {
            const particle = p[index]
            context.moveTo(particle.position_x_previous, particle.position_y_previous)
            context.lineTo(particle.position_x + 1, particle.position_y + 1)
        }
        context.stroke()
    }

    if (false) {
        context.strokeStyle = "white"
        context.beginPath()
        context.arc(mouse_x, mouse_y, gravitation_radius, 0, 2 * Math.PI)
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