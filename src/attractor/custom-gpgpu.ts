import { NearestFilter, RepeatWrapping } from "three"
import { gpuComputer } from "../setup"
import { spherePointsAmount, spherePositions } from "../shared"
import { IAttractorName } from "./types"
import aizawaShader from "./shaders/aizawa.glsl"
import thomasShader from "./shaders/thomas.glsl"



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



export const getCustomGPGPU = (
  name: IAttractorName,
  vel: number,
  roughness: number,
  tb: number, aa: number, ab: number, ac: number, ad: number, ae: number, af: number
) => {

  const positionTexture = gpuComputer.createTexture()
  positionTexture.image.data.set(initialPositions)

  const gpgpuMaterial = gpuComputer.createShaderMaterial(
    shader[name],
    { positionTexture: { value: positionTexture }}
  )

  gpgpuMaterial.uniforms.vel = { value: vel }
  gpgpuMaterial.uniforms.roughness = { value: roughness }

  gpgpuMaterial.uniforms.tb = { value: tb }

  gpgpuMaterial.uniforms.aa = { value: aa }
  gpgpuMaterial.uniforms.ab = { value: ab }
  gpgpuMaterial.uniforms.ac = { value: ac }
  gpgpuMaterial.uniforms.ad = { value: ad }
  gpgpuMaterial.uniforms.ae = { value: ae }
  gpgpuMaterial.uniforms.af = { value: af }



  let i = 1
  const switchTarget = () => i^=1

  const renderTarget = Array(2).fill(null).map(() => (
    gpuComputer.createRenderTarget(side, side, RepeatWrapping, RepeatWrapping, NearestFilter, NearestFilter)
  ))

  const gpgpuCompute = () => {
    gpuComputer.doRenderTarget(gpgpuMaterial, renderTarget[switchTarget()])
    gpgpuMaterial.uniforms.positionTexture.value = renderTarget[i].texture
    return renderTarget[i].texture
  }

  return { gpgpuMaterial, gpgpuCompute }
}