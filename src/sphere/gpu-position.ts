import { Matrix4, NearestFilter, RepeatWrapping } from "three"
import { camera, gpuComputer } from "../setup"
import { spherePointsAmount, spherePositions } from "../shared"
import computePositionShader from "./shaders/compute-position.glsl"



const amount = spherePointsAmount
const side = Math.sqrt(amount)



export const initiatePositionComputation = (
  seed: number,
  sphereScale: number,
  noiseScale: number,
  roughness: number,
  modelViewMatrix: Matrix4,
) => {

const positionTexture = gpuComputer.createTexture()
positionTexture.image.data.set(spherePositions)

const positionMaterial = gpuComputer.createShaderMaterial(
  computePositionShader,
  {
    positionTexture: { value: positionTexture },

    modelViewMatrix: { value: modelViewMatrix },
    projectionMatrix: { value: camera.projectionMatrix },

    time: { value: 0 },
    seed: { value: seed },
    sphereScale: { value: sphereScale },
    noiseScale: { value: noiseScale },
    roughness: { value: roughness },
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