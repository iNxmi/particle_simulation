#version 300 es
precision mediump float;

const float PI = acos(-1.0);
const float PI_HALF = acos(0.0);

//Temporary Constants
const float GRAVITATION = 1500.0;
const float GRAVITATION_RADIUS = 350.0;
const float FRICTION = 50.0;
const float ROUGHNESS = 0.67;
const float ELASTICITY = 0.90;
const float WORLD_WIDTH = 800.0;
const float WORLD_HEIGHT = 800.0;

in vec2 in_position;
in vec2 in_velocity;

uniform vec2 u_mouse_position;
uniform bool u_mouse_enabled;
uniform float u_time_delta;

out vec2 out_position;
out vec2 out_velocity;

//Temporary PRNG Function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 getRoughNormal(float radian) {
    float deviation = (random(in_velocity.xy) * 2.0 - 1.0) * PI_HALF * ROUGHNESS;
    float result = radian + deviation;

    return vec2(cos(result), sin(result));
}

void main() {
    vec2 position = in_position;
    vec2 velocity = in_velocity;

    if(u_mouse_enabled) {
        vec2 delta_position = u_mouse_position - position;
        float distance = length(delta_position);
        if (distance <= GRAVITATION_RADIUS) {
            vec2 direction = normalize(delta_position);
            float intensity = -pow(distance / GRAVITATION_RADIUS, 5.0) + 1.0;
            float scalar = (GRAVITATION * intensity) / distance;
            vec2 acceleration = delta_position * scalar;
            velocity += acceleration * u_time_delta;
        }
    }

    float speed = length(velocity);
    if (speed > 0.0) {
        float reduction = FRICTION * u_time_delta;
        float result = max(0.0, speed - reduction);
        float ratio = result / speed;
        velocity *= ratio;
    }

    position += velocity * u_time_delta;

    if (position.x < 0.0) {
        float ratio = abs(position.x) / abs(velocity.x * u_time_delta);
        position -= velocity * ratio * u_time_delta;

        vec2 normal = getRoughNormal(0.0);
        vec2 reflected = reflect(velocity, normal);
        velocity = reflected * ELASTICITY;

        position += velocity * (1.0 - ratio) * u_time_delta;
    } else if (position.x >= WORLD_WIDTH) {
        float ratio = abs(position.x - WORLD_WIDTH) / abs(velocity.x * u_time_delta);
        position -= velocity * ratio * u_time_delta;

        vec2 normal = getRoughNormal(PI);
        vec2 reflected = reflect(velocity, normal);
        velocity = reflected * ELASTICITY;

        position += velocity * (1.0 - ratio) * u_time_delta;
    }

    if (position.y < 0.0) {
        float ratio = abs(position.y) / abs(velocity.y * u_time_delta);
        position -= velocity * ratio * u_time_delta;

        vec2 normal = getRoughNormal(PI_HALF);
        vec2 reflected = reflect(velocity, normal);
        velocity = reflected * ELASTICITY;

        position += velocity * (1.0 - ratio) * u_time_delta;
    } else if (position.y >= WORLD_HEIGHT) {
        float ratio = abs(position.y - WORLD_HEIGHT) / abs(velocity.y * u_time_delta);
        position -= velocity * ratio * u_time_delta;

        vec2 normal = getRoughNormal(-PI_HALF);
        vec2 reflected = reflect(velocity, normal);
        velocity = reflected * ELASTICITY;

        position += velocity * (1.0 - ratio) * u_time_delta;
    }

    position.x = clamp(position.x, 0.0, WORLD_WIDTH - 1.0);
    position.y = clamp(position.y, 0.0, WORLD_HEIGHT - 1.0);

    out_position = position;
    out_velocity = velocity;
}