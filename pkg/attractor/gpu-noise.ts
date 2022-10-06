import { NearestFilter, RepeatWrapping, Texture } from "three"
import { gpuComputer } from "../init"
import { spherePointsAmount } from "../shared"
import { IPlatonicName } from "../state"
import computeNoiseShader from "./shaders/compute-noise.glsl"



const amount = spherePointsAmount
const side = Math.sqrt(amount)



export const initiateNoiseComputation = (
  seed: number,
  attractorScale: number,
  noiseScale: number,
  platonicness: number,
  platonictype: IPlatonicName,
) => {

const noiseMaterial = gpuComputer.createShaderMaterial(
  computeNoiseShader,
  {
    seed: { value: seed },
    time: { value: 0 },

    attractorScale: { value: attractorScale },
    noiseScale: { value: noiseScale },

    platonicness: { value: platonicness },
    isTetra: { value: platonictype === "tetra" ? 1 : 0 },
    isOcta: { value: platonictype === "octa" ? 1 : 0 },
    isCube: { value: platonictype === "cube" ? 1 : 0 },
    isDodeca: { value: platonictype === "dodeca" ? 1 : 0 },
    isIcosa: { value: platonictype === "icosa" ? 1 : 0 },

    attractorTexture: { value: null },
  },
)

const noiseTarget = gpuComputer.createRenderTarget(
  side, side, RepeatWrapping, RepeatWrapping, NearestFilter, NearestFilter
)



const computeNoise = (
  t: number,
  attractorTexture: Texture,
) => {
  noiseMaterial.uniforms.time.value = t
  noiseMaterial.uniforms.attractorTexture.value = attractorTexture
  gpuComputer.doRenderTarget(noiseMaterial, noiseTarget)
  return noiseTarget.texture
}

return [ noiseMaterial, computeNoise ] as [ typeof noiseMaterial, typeof computeNoise ]

}