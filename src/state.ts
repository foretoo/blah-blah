import { initAttractor } from "./attractor"
import { IAttractorStorage, IInnerAttractorProps, IOuterAttractorProps } from "./attractor/types"
import { initSphere } from "./sphere"
import { IShereStorage } from "./sphere/controller"



export const initiateState = () => {

  const spheresUpdate: ((t: number) => void)[] = []
  const attractorsUpdate: ((t: number) => void)[] = []

  const spheresRaw = localStorage.getItem("blah-blah-spheres")
  if (spheresRaw) {
    const spheres: IShereStorage = JSON.parse(spheresRaw)

    for (const id in spheres) {
      const { seed, sphereScale, noiseScale, roughness } = spheres[id]
      spheresUpdate.push(
        initSphere(
          seed,
          sphereScale.value,
          noiseScale.value,
          roughness.value,
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
        attractorScale: attractors[id].attractorScale.value,
        noiseStrength: attractors[id].noiseStrength.value,
        noiseScale: attractors[id].noiseScale.value,
      }

      const innerAttractorProps: IInnerAttractorProps = {
        name: attractors[id].name,
        roughness: attractors[id].roughness.value,
        vel: attractors[id].vel.value,
        tb: attractors[id].tb.value,
        aa: attractors[id].aa.value,
        ab: attractors[id].ab.value,
        ac: attractors[id].ac.value,
        ad: attractors[id].ad.value,
        ae: attractors[id].ae.value,
        af: attractors[id].af.value,
      }

      attractorsUpdate.push(
        initAttractor(
          outerAttractorProps,
          innerAttractorProps,
          id
        )
      )
    }
  }

  return { spheresUpdate, attractorsUpdate }

}