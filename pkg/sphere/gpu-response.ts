import { NearestFilter, RepeatWrapping, Texture } from "three"
import { gpuComputer, pointer, prevPointer } from "../init"
import { spherePointsAmount } from "../shared"
import computeVelocityShader from "./shaders/compute-velocity.glsl"
import computeResponseShader from "./shaders/compute-response.glsl"



const amount = spherePointsAmount
const side = Math.sqrt(amount)



export const initiateResponseComputation = (
  positionTexture: Texture
) => {

const velocityTexture = gpuComputer.createTexture()

const velocityMaterial = gpuComputer.createShaderMaterial(
  computeVelocityShader,
  {
    positionTexture: { value: positionTexture },
    responsedPositionTexture: { value: positionTexture },
    velocityTexture: { value: velocityTexture },
    pointer: { value: pointer },
    prevPointer: { value: prevPointer },
    time: { value: 0 },
  }
)

const responsedPositionMaterial = gpuComputer.createShaderMaterial(
  computeResponseShader,
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
  t: number,
  positionTexture: Texture,
) => {
  i^=1

  velocityMaterial.uniforms.positionTexture.value = positionTexture
  responsedPositionMaterial.uniforms.positionTexture.value = positionTexture

  velocityMaterial.uniforms.time.value = t
  gpuComputer.doRenderTarget(velocityMaterial, velocityTarget[i])

  velocityMaterial.uniforms.velocityTexture.value = velocityTarget[i].texture
  responsedPositionMaterial.uniforms.velocityTexture.value = velocityTarget[i].texture

  gpuComputer.doRenderTarget(responsedPositionMaterial, responsedPositionTarget[i])

  velocityMaterial.uniforms.responsedPositionTexture.value = responsedPositionTarget[i].texture
  responsedPositionMaterial.uniforms.responsedPositionTexture.value = responsedPositionTarget[i].texture

  return responsedPositionTarget[i].texture
}

}