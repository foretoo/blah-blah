import { BufferAttribute, BufferGeometry, Points, ShaderMaterial } from "three"
import { IInnerAttractorProps, IOuterAttractorProps } from "./types"
import { scene } from "../setup"
import { spherePointsAmount } from "../shared"
import { Pointer, PrevPointer } from "../pointer"

import { initiateAttractorComputation } from "./gpu-attractor"
import { initiateNoiseComputation } from "./gpu-noise"
import { initiateResponseComputation } from "./gpu-response"
import { bindController } from "./controller"

import vertexShader from "./shaders/vertex.glsl"
import fragmentShader from "./shaders/fragment.glsl"
import { noiseMaterials } from "../state"




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
  id = `${Math.random()}-${Math.random()}`,
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

  const [ attractorMaterial, computeAttractor ] = initiateAttractorComputation(
    name, vel, roughness, tb, aa, ab, ac, ad, ae, af
  )
  const initialAttractorTexture = computeAttractor()

  const [ noiseMaterial, computeNoise ] = initiateNoiseComputation(
    seed, attractorScale, noiseStrength, noiseScale
  )
  const initialNoiseTexture = computeNoise(0, initialAttractorTexture)

  const computeResponse = initiateResponseComputation(initialNoiseTexture)


  
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
  const position = new Float32Array(amount * 4)
  const reference = new Float32Array(amount * 2)
  for (let i = 0; i < amount; i++) {
    reference[i * 2 + 0] = (i % side) / side
    reference[i * 2 + 1] = (i / side | 0) / side
  }
  geometry.setAttribute("position", new BufferAttribute(position, 4))
  geometry.setAttribute("reference", new BufferAttribute(reference, 2))



  const attractor = new Points(geometry, material)
  bindController(attractorMaterial, noiseMaterial, attractor, seed, name, id)
  noiseMaterials[id] = noiseMaterial
  scene.add(attractor)



  return {
    id,
    update: (
      t: number,
      pointer: Pointer,
      prevPointer: PrevPointer,
    ) => {
      const attractorPositionTexture = computeAttractor()
      const noisePositionTexture = computeNoise(t, attractorPositionTexture)
      const responsedPositionTexture = computeResponse(t / 2, noisePositionTexture, pointer, prevPointer)
      material.uniforms.positionTexture.value = responsedPositionTexture
      attractor.rotation.y = t / 2
    }
  }
}