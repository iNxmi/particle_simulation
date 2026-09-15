import {create} from "zustand"

export const useSettings = create((set) => ({
    numberOfParticles: 100000,
    setNumberOfParticles: (numberOfParticles) => set({numberOfParticles}),

    gravitation: 2500.0,
    setGravitation: (gravitation) => set({gravitation}),

    gravitationRadius: 250.0,
    setGravitationRadius: (gravitationRadius) => set({gravitationRadius}),

    friction: 150.0,
    setFriction: (friction) => set({friction}),

    elasticity: 0.67,
    setElasticity: (elasticity) => set({elasticity}),

    roughness: 0.42,
    setRoughness: (roughness) => set({roughness}),
}))

export const useInformation = create((set) => ({
    timeDeltaSeconds: 0.0,
    setTimeDeltaSeconds: (timeDeltaSeconds) => set({timeDeltaSeconds})
}))