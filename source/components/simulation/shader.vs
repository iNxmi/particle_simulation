#version 300 es
in vec2 a_position;
in vec2 a_velocity;

uniform vec2 u_resolution;

out vec2 v_velocity;

void main() {
    v_velocity = a_velocity;

    vec2 clip_space = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip_space.x, -clip_space.y, 0.0, 1.0);
}