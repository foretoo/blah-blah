import { NearestFilter, RepeatWrapping, Texture } from "three"
import { gpuComputer } from "../setup"
import { spherePointsAmount, spherePositions } from "../shared"
import computeVelocity from "./compute-velocity.glsl"
import computeResPosition from "./compute-res-position.glsl"



const amount = spherePointsAmount
const side = Math.sqrt(amount)



export const initiateResponseComputation = (
  positionTexture: Texture
) => {

const vecPointer = new Float32Array(4)

const velocityTexture = gpuComputer.createTexture()
const responsedPositionTexture = gpuComputer.createTexture()

const velocityMaterial = gpuComputer.createShaderMaterial(
  computeVelocity,
  {
    positionTexture: { value: positionTexture },
    responsedPositionTexture: { value: positionTexture },
    velocityTexture: { value: velocityTexture },
    pointer: { value: vecPointer },
  }
)

const responsedPositionMaterial = gpuComputer.createShaderMaterial(
  computeResPosition,
  {
    positionTexture: { value: positionTexture },
    responsedPositionTexture: { value: positionTexture },
    velocityTexture: { value: velocityTexture },
  }
)

const responsedPositionTarget = Array(2).fill(null).map(() => (
  gpuComputer.createRenderTarget(side, side, RepeatWrapping, RepeatWrapping, NearestFilter, NearestFilter)
))
const velocityTarget = Array(2).fill(null).map(() => (
  gpuComputer.createRenderTarget(side, side, RepeatWrapping, RepeatWrapping, NearestFilter, NearestFilter)
))



let i = 1
return (
  positionTexture: Texture,
  pointer: { x: number, y: number, z: number, d: number },
) => {
  i^=1

  velocityMaterial.uniforms.positionTexture.value = positionTexture
  responsedPositionMaterial.uniforms.positionTexture.value = positionTexture

  vecPointer[0] = pointer.x
  vecPointer[1] = pointer.y
  vecPointer[2] = pointer.z
  vecPointer[3] = pointer.d

  velocityMaterial.uniforms.pointer.value = vecPointer
  gpuComputer.doRenderTarget(velocityMaterial, velocityTarget[i])

  velocityMaterial.uniforms.velocityTexture.value = velocityTarget[i].texture
  responsedPositionMaterial.uniforms.velocityTexture.value = velocityTarget[i].texture

  gpuComputer.doRenderTarget(responsedPositionMaterial, responsedPositionTarget[i])

  velocityMaterial.uniforms.responsedPositionTexture.value = responsedPositionTarget[i].texture
  responsedPositionMaterial.uniforms.responsedPositionTexture.value = responsedPositionTarget[i].texture

  return responsedPositionTarget[i].texture
}

}