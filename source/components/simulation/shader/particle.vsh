#version 300 es

in vec2 in_position;
in vec2 in_velocity;

uniform vec2 u_resolution;

out vec2 v_velocity;

void main() {
    v_velocity = in_velocity;

    vec2 clip_space = (in_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip_space.x, -clip_space.y, 0.0, 1.0);
}