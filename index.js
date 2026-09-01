lucide.createIcons()

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

    rotate(radian) {
        const cos = Math.cos(radian)
        const sin = Math.sin(radian)

        const x_new = this.x * cos - this.y * sin
        const y_new = this.x * sin + this.y * cos

        this.x = x_new
        this.y = y_new

        return this
    }

    getDotProduct(vector) {
        return this.x * vector.x + this.y * vector.y
    }

    reflect(normal) {
        return this.subtractVector(
            normal.getCopy().multiplyValue(
                2.0 * this.getDotProduct(normal)
            )
        )
    }

    getNormalized() {
        return this.getCopy().normalize()
    }

    getCopy() {
        return new Vector().setVector(this)
    }

}

const UP = new Vector().setComponents(0, -1)
const DOWN = new Vector().setComponents(0, 1)
const LEFT = new Vector().setComponents(-1, 0)
const RIGHT = new Vector().setComponents(1, 0)

function getRoughNormal(normal) {
    const random = Math.random() * 2.0 - 1.0
    const degree = 90.0 * roughness * random
    const radian = degree * Math.PI / 180.0

    return normal.getCopy().rotate(radian)
}

class Particle {
    constructor() {
        this.position = new Vector().setComponents(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        )

        this.position_previous = new Vector().setVector(this.position)

        this.velocity = new Vector()

        this.color = 0
    }

    update(time_delta) {
        this.position_previous.setVector(this.position)

        if (enabled && mouse_position.getCopy().subtractVector(this.position).getLength() <= gravitation_radius) {
            const acceleration = getAcceleration(this.position)
                .multiplyValue(time_delta)
            this.velocity.addVector(acceleration)
        }

        if (this.velocity.getLength() > 0.0) {
            const friction_vector = this.velocity.getCopy()
                .normalize()
                .multiplyValue(-1)
                .multiplyValue(friction * time_delta)

            this.velocity.addVector(friction_vector)

            const direction_velocity = this.velocity.getCopy().normalize()
            const direction_friction = friction_vector.getCopy().normalize()
            const dot = direction_velocity.getDotProduct(direction_friction)
            if (dot >= 0.9999)
                this.velocity.setComponents(0.0, 0.0)
        }

        this.position.addVector(this.velocity.getCopy().multiplyValue(time_delta))

        if (this.position.x < 0.0) {
            const normal = getRoughNormal(RIGHT)
            this.velocity.reflect(normal).multiplyValue(elasticity)
            this.position.x = 0.0
        }

        if (this.position.x >= canvas.width) {
            const normal = getRoughNormal(LEFT)
            this.velocity.reflect(normal).multiplyValue(elasticity)
            this.position.x = canvas.width - 1
        }

        if (this.position.y < 0.0) {
            const normal = getRoughNormal(DOWN)
            this.velocity.reflect(normal).multiplyValue(elasticity)
            this.position.y = 0.0
        }

        if (this.position.y >= canvas.height) {
            const normal = getRoughNormal(UP)
            this.velocity.reflect(normal).multiplyValue(elasticity)
            this.position.y = canvas.height - 1
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

    mouse_position.setComponents(
        event.clientX - rectangle.left,
        event.clientY - rectangle.top
    )
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

    mouse_position.setComponents(
        touch.clientX - rectangle.left,
        touch.clientY - rectangle.top
    )

    enabled = true
})
canvas.addEventListener("touchend", (event) => {
    enabled = false
})
canvas.addEventListener("touchmove", (event) => {
    const touch = event.touches[0]

    const rectangle = event.target.getBoundingClientRect()

    mouse_position.setComponents(
        touch.clientX - rectangle.left,
        touch.clientY - rectangle.top
    )
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
    const distance = mouse_position.getCopy()
        .subtractVector(position)
        .getLength()

    if (distance > gravitation_radius)
        return 0.0

    const x = clamp(distance / gravitation_radius, 0.0, 1.0)
    return Math.sin(x * Math.PI * 5) / 2 + 0.5
}

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

    return 1.0 / (distance)
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
    information_time_delta.value = Math.round(time_delta * 10000.0) / 10000.0
    information_fps.value = Math.round(1.0 / time_delta)

    let count = 0
    for (const particle of particles) {
        particle.update(time_delta)
        if (mouse_position.getCopy().subtractVector(particle.position).getLength() <= gravitation_radius)
            count++
    }

    information_particle_count_in_range.value = count
}

function render(time_delta) {
    context.clearRect(0, 0, canvas.width, canvas.height)

    const sorted = Object.groupBy(particles, ({ degree }) => degree)
    for (const [degree, p] of Object.entries(sorted)) {
        context.strokeStyle = `hsl(${degree}deg, 100%, 50%)`

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