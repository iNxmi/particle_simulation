#version 300 es
precision mediump float;

in vec2 v_velocity;

out vec4 fragColor;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    float hue = length(v_velocity) / 2048.0;
    vec3 hsv = vec3(clamp(hue, 0.0, 1.0), 1.0, 1.0);
    vec3 rgb = hsv2rgb(hsv);
    fragColor = vec4(rgb, 1.0);

//    fragColor = vec4(1.0, 1.0, 1.0, 1.0);
}