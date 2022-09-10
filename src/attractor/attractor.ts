import { BufferAttribute, BufferGeometry, Points, ShaderMaterial } from "three"
import { IInnerAttractorProps, IOuterAttractorProps } from "./types"
import { scene } from "../setup"
import { spherePointsAmount } from "../shared"
import { initiateAttractorPositionComputation } from "./gpu-attractor-position"
import { initiateNoiseComputation } from "./gpu-noise-position"
import { bindController } from "./controller"

import vertexShader from "./shaders/vertex.glsl"
import fragmentShader from "./shaders/fragment.glsl"




const amount = spherePointsAmount
const side = Math.sqrt(spherePointsAmount)



const defaultOuterAttractorProps: Partial<IOuterAttractorProps> = {
  dotSize: 1,
  color: 0.5,
  attractorScale: 1,
  noiseStrength: 1,
  noiseScale: 0.2,
}
const defaultInnerAttractorProps: Partial<IInnerAttractorProps> = {
  name: "aizawa",
  roughness: 0.2,
  vel: 1,
  tb: 0.21,
  aa: 0.5,
  ab: 0,
  ac: 1.3,
  ad: 0,
  ae: 0,
  af: 0,
}
export const initAttractor = (
  outerAttractorProps = defaultOuterAttractorProps,
  innerAttractorProps = defaultInnerAttractorProps,
  id = crypto.randomUUID(),
) => {

  const {
    seed = Math.random() * 123,
    dotSize = 1,
    color = 0.5,
    attractorScale = 1,
    noiseStrength = 1,
    noiseScale = 0.2,
  } = outerAttractorProps

  const {
    name = "aizawa",
    roughness = 0.2,
    vel = 1,
    tb = 0.21,
    aa = 0.5,
    ab = 0,
    ac = 1.3,
    ad = 0,
    ae = 0,
    af = 0,
  } = innerAttractorProps

  const { gpgpuMaterial, gpgpuCompute } = initiateAttractorPositionComputation(
    name, vel, roughness, tb, aa, ab, ac, ad, ae, af
  )

  const [ noiseMaterial, computeNoise ] = initiateNoiseComputation(
    seed, attractorScale, noiseStrength, noiseScale
  )


  
  const material = new ShaderMaterial({
    uniforms: {
      seed: { value: seed },
      time: { value: 0 },

      dotSize: { value: dotSize },
      color: { value: color },

      positionTexture: { value: null },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  })



  const geometry = new BufferGeometry()
  const position = new Float32Array(amount * 3)
  const reference = new Float32Array(amount * 2)
  for (let i = 0; i < amount; i++) {
    reference[i * 2 + 0] = (i % side) / side
    reference[i * 2 + 1] = (i / side | 0) / side
  }
  geometry.setAttribute("position", new BufferAttribute(position, 3))
  geometry.setAttribute("reference", new BufferAttribute(reference, 2))



  const attractor = new Points(geometry, material)
  bindController(gpgpuMaterial, noiseMaterial, attractor, seed, name, id)
  scene.add(attractor)



  return {
    id,
    update: (t: number) => {
      const attractorPositionTexture = gpgpuCompute()
      const noisePositionTexture = computeNoise(t, attractorPositionTexture)
      material.uniforms.positionTexture.value = noisePositionTexture
    }
  }
}