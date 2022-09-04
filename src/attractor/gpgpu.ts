import { RepeatWrapping } from "three"
import { gpuComputer } from "../setup"
import { spherePointsAmount, spherePositions } from "../shared"
import { IAttractorName, IGPGPUUniforms } from "./types"
import aizawaShader from "./shaders/aizawa.glsl"
import thomasShader from "./shaders/thomas.glsl"



const shader = {
  aizawa: aizawaShader,
  thomas: thomasShader
}



const amount = spherePointsAmount
const p = spherePositions
const initialPositions = new Float32Array(amount * 4)
for (let i = 0; i < amount; i++) {
  initialPositions[i * 4 + 0] = p[i * 3 + 0] + (Math.random() * 2 - 1) * 0.333
  initialPositions[i * 4 + 1] = p[i * 3 + 1] + (Math.random() * 2 - 1) * 0.333
  initialPositions[i * 4 + 2] = p[i * 3 + 2] + (Math.random() * 2 - 1) * 0.333
  initialPositions[i * 4 + 3] = 1
}



export const getGPGPU = (
  name: IAttractorName,
  vel: number,
  roughness: number,
  tb: number, aa: number, ab: number, ac: number, ad: number, ae: number, af: number
) => {

  const positionTexture = gpuComputer.createTexture()
  positionTexture.image.data.set(initialPositions)
  const positionVar = gpuComputer.addVariable("positionTexture", shader[name], positionTexture)

  const gpgpuMaterial = positionVar.material
  const gpgpuUniforms = gpgpuMaterial.uniforms as IGPGPUUniforms



  gpgpuUniforms.vel = { value: vel }
  gpgpuUniforms.roughness = { value: roughness }

  gpgpuUniforms.tb = { value: tb }

  gpgpuUniforms.aa = { value: aa }
  gpgpuUniforms.ab = { value: ab }
  gpgpuUniforms.ac = { value: ac }
  gpgpuUniforms.ad = { value: ad }
  gpgpuUniforms.ae = { value: ae }
  gpgpuUniforms.af = { value: af }



  positionVar.wrapS = RepeatWrapping
  positionVar.wrapT = RepeatWrapping

  const error = gpuComputer.init()
  if ( error !== null ) console.error( error )

  const gpgpuCompute = () => {
    return gpuComputer.getCurrentRenderTarget(positionVar).texture
  }

  return { gpgpuMaterial, gpgpuCompute }
}