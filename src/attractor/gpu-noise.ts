import { NearestFilter, RepeatWrapping, Texture } from "three"
import { gpuComputer } from "../setup"
import { spherePointsAmount } from "../shared"
import { state } from "../state"
import computeNoiseShader from "./shaders/compute-noise.glsl"



const amount = spherePointsAmount
const side = Math.sqrt(amount)



export const initiateNoiseComputation = (
  seed: number,
  attractorScale: number,
  noiseStrength: number,
  noiseScale: number,
) => {

const noiseMaterial = gpuComputer.createShaderMaterial(
  computeNoiseShader,
  {
    seed: { value: seed },
    time: { value: 0 },

    attractorScale: { value: attractorScale },
    noiseStrength: { value: noiseStrength },
    noiseScale: { value: noiseScale },

    platonicness: state.platonicness,
    isTetra: { value: state.platonictype === "tetra" ? 1 : 0 },
    isOcta: { value: state.platonictype === "octa" ? 1 : 0 },
    isCube: { value: state.platonictype === "cube" ? 1 : 0 },
    isDodeca: { value: state.platonictype === "dodeca" ? 1 : 0 },
    isIcosa: { value: state.platonictype === "icosa" ? 1 : 0 },

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