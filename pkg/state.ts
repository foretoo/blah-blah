import { initAttractor } from "./attractor"
import { initSphere } from "./sphere"



type IUniform<T> = { value: T }

type IPlatonicType = {
  isTetra: IUniform<number>
  isOcta: IUniform<number>
  isCube: IUniform<number>
  isDodeca: IUniform<number>
  isIcosa: IUniform<number>
}

export type ISphereSystem = {
  dotSize: IUniform<number>
  color: IUniform<number>
  sphereScale: IUniform<number>
  noiseScale: IUniform<number>
  roughness: IUniform<number>
  platonicness: IUniform<number>
  platonictype: IPlatonicType
}
export type IAttractorSystem = {
  dotSize: IUniform<number>
  color: IUniform<number>
  attractorScale: IUniform<number>
  noiseScale: IUniform<number>
  roughness: IUniform<number>
  vel: IUniform<number>
  platonicness: IUniform<number>
  platonictype: IPlatonicType
}

export type IUpdater = (t: number) => void

const spheresUpdate: IUpdater[] = []
const attractorsUpdate: IUpdater[] = []

const spheres: ISphereSystem[] = []
const attractors: IAttractorSystem[] = []

export type IPlatonicName = "tetra" | "octa" | "cube" | "dodeca" | "icosa"

export type IAttractorName = "aizawa" | "thomas"

type ISphere = {
  dotSize: number
  color: number
  sphereScale: number
  noiseScale: number
  roughness: number
  platonicness: number
  platonictype: IPlatonicName
}

type IAttractor = {
  name: IAttractorName
  dotSize: number
  color: number
  attractorScale: number
  noiseScale: number
  roughness: number
  vel: number
  platonicness: number
  platonictype: IPlatonicName
}

export type IParticlesState = {
  cleartrail: number
  attractors: IAttractor[]
  spheres: ISphere[]
}

export let state: IParticlesState = {
  cleartrail: 0.3,
  attractors: [],
  spheres: [],
}



export const initiateState = (
  json: IParticlesState
) => {

  state = { ...state, ...json }



  for (const spheredata of state.spheres) {

    const { sphere, update } = initSphere(
      spheredata.dotSize,
      spheredata.color,
      spheredata.sphereScale,
      spheredata.noiseScale,
      spheredata.roughness,
      spheredata.platonicness,
      spheredata.platonictype,
    )

    spheres.push(sphere)
    spheresUpdate.push(update)
  }

  for (const attractordata of state.attractors) {

    const { attractor, update } = initAttractor(
      attractordata.dotSize,
      attractordata.color,
      attractordata.attractorScale,
      attractordata.noiseScale,
      attractordata.name,
      attractordata.roughness,
      attractordata.vel,
      attractordata.platonicness,
      attractordata.platonictype,
    )

    attractors.push(attractor)
    attractorsUpdate.push(update)
  }



  return { spheres, spheresUpdate, attractors, attractorsUpdate }
}