class Vector {

    constructor() {
        this.x = 0.0
        this.y = 0.0
    }


    setComponents(x, y) {
        this.x = x
        this.y = y

        return this
    }

    setVector(vector) {
        return this.setComponents(vector.x, vector.y)
    }


    addComponents(x, y) {
        this.x += x
        this.y += y

        return this
    }

    addValue(value) {
        return this.addComponents(value, value)
    }

    addVector(vector) {
        return this.addComponents(vector.x, vector.y)
    }


    subtractComponents(x, y) {
        this.x -= x
        this.y -= y

        return this
    }

    subtractValue(value) {
        return this.subtractComponents(value, value)
    }

    subtractVector(vector) {
        return this.subtractComponents(vector.x, vector.y)
    }


    multiplyComponents(x, y) {
        this.x *= x
        this.y *= y

        return this
    }

    multiplyValue(value) {
        return this.multiplyComponents(value, value)
    }

    multiplyVector(vector) {
        return this.multiplyComponents(vector.x, vector.y)
    }


    divideComponents(x, y) {
        this.x /= x
        this.y /= y

        return this
    }

    divideValue(value) {
        return this.divideComponents(value, value)
    }

    divideVector(vector) {
        return this.divideComponents(vector.x, vector.y)
    }


    getLength() {
        if (this.x === 0.0 && this.y === 0.0)
            return 0.0

        const squared = this.x * this.x + this.y * this.y
        return Math.sqrt(squared)
    }

    normalize() {
        const length = this.getLength()
        if (length === 0.0) {
            this.y = 0.0
            this.y = 0.0
        } else {
            this.x /= length
            this.y /= length
        }

        return this
    }

    getNormalized() {
        return this.getCopy().normalize()
    }

    getCopy() {
        return new Vector().setVector(this)
    }

}

class Particle {
    constructor() {
        this.position = new Vector().setComponents(
            Math.random() * canvas_width,
            Math.random() * canvas_height
        )

        this.position_previous = new Vector().setVector(this.position)

        this.velocity = new Vector()

        this.color = 0
    }

    update(time_delta) {
        this.position_previous.setVector(this.position)

        if (enabled) {
            const acceleration = getAcceleration(this.position)
                .multiplyValue(time_delta)
            this.velocity.addVector(acceleration)
        }

        const friction_vector = this.velocity.getCopy()
            .normalize()
            .multiplyValue(friction * time_delta)
        this.velocity.subtractVector(friction_vector)

        this.position.addVector(this.velocity.getCopy().multiplyValue(time_delta))

        if (this.position.x < 0.0) {
            this.velocity.x *= -elasticity
            this.position.x = 0.0
        }

        if (this.position.x >= canvas_width) {
            this.velocity.x *= -elasticity
            this.position.x = canvas_width - 1
        }

        if (this.position.y < 0.0) {
            this.velocity.y *= -elasticity
            this.position.y = 0.0
        }

        if (this.position.y >= canvas_height) {
            this.velocity.y *= -elasticity
            this.position.y = canvas_height - 1
        }

        const speed = this.velocity.getLength()
        this.degree = Math.floor(Math.min(speed / 1024.0, 1.0) * 360.0)
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
// roughness (for walls)
// mass

const canvas = document.getElementById("canvas")

const information_time_delta = document.getElementById("time_delta")
const information_fps = document.getElementById("fps")

let canvas_width = canvas.width
let canvas_height = canvas.height

const mouse_position = new Vector()
canvas.addEventListener("mousemove", (event) => {
    const rectangle = event.target.getBoundingClientRect()

    mouse_position.setComponents(
        event.clientX - rectangle.left,
        event.clientY - rectangle.top
    )
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
    for (let index = 0; index < number_of_particles; index++)
        particles[index] = new Particle()
}
settings_number_of_particles.onchange = updateParticles
updateParticles()

function getIntensityOld(position) {
    const distance = mouse_position.getCopy()
        .subtractVector(position)
        .getLength()

    if (distance > gravitation_radius)
        return 0.0

    const x = clamp(distance / gravitation_radius, 0.0, 1.0)
    return -Math.pow(x, 6) + 1
}

function getIntensity(position) {
    const distance = mouse_position.getCopy()
        .subtractVector(position)
        .getLength()

    return 1.0 / (distance * distance)
}

function getAcceleration(position) {
    const intensity = getIntensityOld(position)
    const influence = gravitation * intensity

    return mouse_position.getCopy()
        .subtractVector(position)
        .normalize()
        .multiplyValue(influence)
}

const context = canvas.getContext("2d")
context.lineWidth = 1
context.fillStyle = "white"
context.strokeStyle = "white"

function update(time_delta) {
    information_time_delta.value = time_delta
    information_fps.value = 1.0 / time_delta

    for (const particle of particles)
        particle.update(time_delta)
}

function render(time_delta) {
    context.clearRect(0, 0, canvas_width, canvas_height)

    const sorted = Object.groupBy(particles, ({ degree }) => degree)
    for (const [degree, p] of Object.entries(sorted)) {
        context.strokeStyle = `hsl(${degree}deg, 100%, 50%)`

        context.beginPath()
        for (const particle of p)
            particle.render(context, time_delta)
        context.stroke()
    }

    if (enabled) {
        context.strokeStyle = "white"

        context.beginPath()
        context.arc(mouse_position.x, mouse_position.y, gravitation_radius, 0, 2 * Math.PI)
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