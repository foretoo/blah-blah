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

export const initiateState = () => {

  const spheresRaw = localStorage.getItem("blah-blah-spheres")
  if (spheresRaw) {
    const spheres: IShereStorage = JSON.parse(spheresRaw)

    for (const id in spheres) {
      const { seed, dotSize, color, sphereScale, noiseScale, roughness } = spheres[id]
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
  }



  const attractorsRaw = localStorage.getItem("blah-blah-attractors")
  if (attractorsRaw) {
    const attractors: IAttractorStorage = JSON.parse(attractorsRaw)

    for (const id in attractors) {
      
      const outerAttractorProps: IOuterAttractorProps = {
        seed: attractors[id].seed,
        dotSize: attractors[id].dotSize?.value,
        color: attractors[id].color?.value,
        attractorScale: attractors[id].attractorScale?.value,
        noiseStrength: attractors[id].noiseStrength?.value,
        noiseScale: attractors[id].noiseScale?.value,
      }

      const innerAttractorProps: IInnerAttractorProps = {
        name: attractors[id].name,
        roughness: attractors[id].roughness?.value,
        vel: attractors[id].vel?.value,
        tb: attractors[id].tb?.value,
        aa: attractors[id].aa?.value,
        ab: attractors[id].ab?.value,
        ac: attractors[id].ac?.value,
        ad: attractors[id].ad?.value,
        ae: attractors[id].ae?.value,
        af: attractors[id].af?.value,
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

}



export const getClearPlaneState = () => {
  const clearPlaneRaw = localStorage.getItem("blah-blah-clear")
  const trailValue = clearPlaneRaw ? JSON.parse(clearPlaneRaw) as number : null
  const saveTrail = (value: number) => localStorage.setItem("blah-blah-clear", JSON.stringify(value))
  return { trailValue, saveTrail }
}