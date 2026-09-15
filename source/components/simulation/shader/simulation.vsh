#version 300 es
precision mediump float;

const float PI = acos(-1.0);
const float PI_HALF = acos(0.0);

in vec2 in_position;
in vec2 in_velocity;

uniform float u_gravitation;
uniform float u_gravitation_radius;
uniform float u_friction;
uniform float u_elasticity;
uniform float u_roughness;
uniform vec2 u_world_size;

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
    float deviation = (random(in_velocity.xy) * 2.0 - 1.0) * PI_HALF * u_roughness;
    float result = radian + deviation;

    return vec2(cos(result), sin(result));
}

void main() {
    vec2 position = in_position;
    vec2 velocity = in_velocity;

    if (u_mouse_enabled) {
        vec2 delta_position = u_mouse_position - position;
        float distance = length(delta_position);
        if (distance <= u_gravitation_radius) {
            vec2 direction = normalize(delta_position);
            float intensity = -pow(distance / u_gravitation_radius, 5.0) + 1.0;
            float scalar = (u_gravitation * intensity) / distance;
            vec2 acceleration = delta_position * scalar;
            velocity += acceleration * u_time_delta;
        }
    }

    float speed = length(velocity);
    if (speed > 0.0) {
        float reduction = u_friction * u_time_delta;
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
        velocity = reflected * u_elasticity;

        position += velocity * (1.0 - ratio) * u_time_delta;
    } else if (position.x >= u_world_size.x) {
        float ratio = abs(position.x - u_world_size.x) / abs(velocity.x * u_time_delta);
        position -= velocity * ratio * u_time_delta;

        vec2 normal = getRoughNormal(PI);
        vec2 reflected = reflect(velocity, normal);
        velocity = reflected * u_elasticity;

        position += velocity * (1.0 - ratio) * u_time_delta;
    }

    if (position.y < 0.0) {
        float ratio = abs(position.y) / abs(velocity.y * u_time_delta);
        position -= velocity * ratio * u_time_delta;

        vec2 normal = getRoughNormal(PI_HALF);
        vec2 reflected = reflect(velocity, normal);
        velocity = reflected * u_elasticity;

        position += velocity * (1.0 - ratio) * u_time_delta;
    } else if (position.y >= u_world_size.y) {
        float ratio = abs(position.y - u_world_size.y) / abs(velocity.y * u_time_delta);
        position -= velocity * ratio * u_time_delta;

        vec2 normal = getRoughNormal(-PI_HALF);
        vec2 reflected = reflect(velocity, normal);
        velocity = reflected * u_elasticity;

        position += velocity * (1.0 - ratio) * u_time_delta;
    }

    position.x = clamp(position.x, 0.0, u_world_size.x - 1.0);
    position.y = clamp(position.y, 0.0, u_world_size.y - 1.0);

    out_position = position;
    out_velocity = velocity;
}