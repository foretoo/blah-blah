import { Matrix4, NearestFilter, RepeatWrapping } from "three"
import { camera, gpuComputer } from "../setup"
import { spherePointsAmount, spherePositions } from "../shared"
import computeNoiseShader from "./shaders/compute-noise.glsl"
import { state } from "../state"



const amount = spherePointsAmount
const side = Math.sqrt(amount)



export const initiateNoiseComputation = (
  seed: number,
  sphereScale: number,
  noiseScale: number,
  roughness: number,
  modelViewMatrix: Matrix4,
) => {

const positionTexture = gpuComputer.createTexture()
positionTexture.image.data.set(spherePositions)

const positionMaterial = gpuComputer.createShaderMaterial(
  computeNoiseShader,
  {
    positionTexture: { value: positionTexture },

    modelViewMatrix: { value: modelViewMatrix },
    projectionMatrix: { value: camera.projectionMatrix },

    time: { value: 0 },
    seed: { value: seed },
    sphereScale: { value: sphereScale },
    noiseScale: { value: noiseScale },
    roughness: { value: roughness },

    platonicness: state.platonicness,
    isTetra: { value: state.platonictype === "tetra" ? 1 : 0 },
    isOcta: { value: state.platonictype === "octa" ? 1 : 0 },
    isCube: { value: state.platonictype === "cube" ? 1 : 0 },
    isDodeca: { value: state.platonictype === "dodeca" ? 1 : 0 },
    isIcosa: { value: state.platonictype === "icosa" ? 1 : 0 },
  }
)

const positionTarget = gpuComputer.createRenderTarget(
  side, side, RepeatWrapping, RepeatWrapping, NearestFilter, NearestFilter
)



const computePosition = (t: number) => {
  positionMaterial.uniforms.time.value = t
  gpuComputer.doRenderTarget(positionMaterial, positionTarget)
  return positionTarget.texture
}

return [ positionMaterial, computePosition ] as [ typeof positionMaterial, typeof computePosition ]

}