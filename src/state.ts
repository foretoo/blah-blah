import { ShaderMaterial } from "three"
import { initAttractor } from "./attractor"
import { IAttractorStorage, IInnerAttractorProps, IOuterAttractorProps } from "./attractor/types"
import { Pointer, PrevPointer } from "./pointer"
import { initSphere } from "./sphere"
import { IShereStorage } from "./sphere/controller"



type IUpdater = {
  id: string
  update: (
    t: number,
    pointer: Pointer,
    prevPointer: PrevPointer
  ) => void
}

export const spheresUpdate: IUpdater[] = []
export const attractorsUpdate: IUpdater[] = []

export const noiseMaterials: { [id: string]: ShaderMaterial } = {}

export type IPlatonic = "tetra" | "octa" | "cube" | "dodeca" | "icosa"

type IState = {
  cleartrail: number
  platonictype: IPlatonic
  platonicness: { value: number }
  attractors: IAttractorStorage
  spheres: IShereStorage
}

export let state: IState = {
  cleartrail: 0.3,
  platonictype: "tetra",
  platonicness: {
    value: 0,
  },
  attractors: {},
  spheres: {},
}

export const locateState = () => {
  localStorage.setItem("blah-blah", JSON.stringify(state))
}

const stateRaw = localStorage.getItem("blah-blah")
  
if (stateRaw) state = { ...state, ...JSON.parse(stateRaw) }
else locateState()



export const initiateState = () => {

  for (const id in state.spheres) {

    const { seed, dotSize, color, sphereScale, noiseScale, roughness } = state.spheres[id]

    spheresUpdate.push(
      initSphere(
        seed,
        dotSize?.value,
        color?.value,
        sphereScale?.value,
        noiseScale?.value,
        roughness?.value,
        id,
      )
    )
  }



  for (const id in state.attractors) {

    const outerAttractorProps: IOuterAttractorProps = {
      seed: state.attractors[id].seed,
      dotSize: state.attractors[id].dotSize?.value,
      color: state.attractors[id].color?.value,
      attractorScale: state.attractors[id].attractorScale?.value,
      noiseStrength: state.attractors[id].noiseStrength?.value,
      noiseScale: state.attractors[id].noiseScale?.value,
    }

    const innerAttractorProps: IInnerAttractorProps = {
      name: state.attractors[id].name,
      roughness: state.attractors[id].roughness?.value,
      vel: state.attractors[id].vel?.value,
      tb: state.attractors[id].tb?.value,
      aa: state.attractors[id].aa?.value,
      ab: state.attractors[id].ab?.value,
      ac: state.attractors[id].ac?.value,
      ad: state.attractors[id].ad?.value,
      ae: state.attractors[id].ae?.value,
      af: state.attractors[id].af?.value,
    }

    attractorsUpdate.push(
      initAttractor(
        outerAttractorProps,
        innerAttractorProps,
        id,
      )
    )
  }
}