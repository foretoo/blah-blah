import { NearestFilter, RepeatWrapping } from "three"
import { gpuComputer } from "../setup"
import { spherePointsAmount, spherePositions } from "../shared"
import { IAttractorName } from "./types"
import aizawaShader from "./shaders/compute-aizawa.glsl"
import thomasShader from "./shaders/compute-thomas.glsl"



const shader = {
  aizawa: aizawaShader,
  thomas: thomasShader
}



const amount = spherePointsAmount
const side = Math.sqrt(amount)
const p = spherePositions
const initialPositions = new Float32Array(amount * 4)
for (let i = 0; i < amount; i++) {
  initialPositions[i * 4 + 0] = p[i * 3 + 0] + (Math.random() * 2 - 1) * 0.333
  initialPositions[i * 4 + 1] = p[i * 3 + 1] + (Math.random() * 2 - 1) * 0.333
  initialPositions[i * 4 + 2] = p[i * 3 + 2] + (Math.random() * 2 - 1) * 0.333
  initialPositions[i * 4 + 3] = 1
}



export const initiateAttractorComputation = (
  name: IAttractorName,
  vel: number,
  roughness: number,
  tb: number, aa: number, ab: number, ac: number, ad: number, ae: number, af: number
) => {

  const attractorTexture = gpuComputer.createTexture()
  attractorTexture.image.data.set(initialPositions)

  const attractorMaterial = gpuComputer.createShaderMaterial(
    shader[name],
    { positionTexture: { value: attractorTexture }}
  )

  attractorMaterial.uniforms.vel = { value: vel }
  attractorMaterial.uniforms.roughness = { value: roughness }

  attractorMaterial.uniforms.tb = { value: tb }

  attractorMaterial.uniforms.aa = { value: aa }
  attractorMaterial.uniforms.ab = { value: ab }
  attractorMaterial.uniforms.ac = { value: ac }
  attractorMaterial.uniforms.ad = { value: ad }
  attractorMaterial.uniforms.ae = { value: ae }
  attractorMaterial.uniforms.af = { value: af }



  const attractorTarget = Array(2).fill(null).map(() => (
    gpuComputer.createRenderTarget(side, side, RepeatWrapping, RepeatWrapping, NearestFilter, NearestFilter)
  ))

  let i = 1
  const computeAttractor = () => {
    i^=1
    gpuComputer.doRenderTarget(attractorMaterial, attractorTarget[i])
    attractorMaterial.uniforms.positionTexture.value = attractorTarget[i].texture
    return attractorTarget[i].texture
  }

  return [ attractorMaterial, computeAttractor ] as [ typeof attractorMaterial, typeof computeAttractor ]
}