import { BufferAttribute, BufferGeometry, Points, ShaderMaterial } from "three"
import { IAttractorName } from "./types"
import { IAttractorSystem, IPlatonicName, IUpdater } from "../state"
import { renderer, scene } from "../init"
import { spherePointsAmount } from "../shared"

import { initiateAttractorComputation } from "./gpu-attractor"
import { initiateNoiseComputation } from "./gpu-noise"
import { initiateResponseComputation } from "./gpu-response"

import vertexShader from "./shaders/vertex.glsl"
import fragmentShader from "./shaders/fragment.glsl"



const amount = spherePointsAmount
const side = Math.sqrt(spherePointsAmount)



export const initAttractor = (
  dotSize = 1 * renderer.getPixelRatio(),
  color = 0.5,
  attractorScale = 1,
  noiseScale = 0.2,
  name: IAttractorName = "aizawa",
  roughness = 0.2,
  vel = 1,
  platonicness = 0,
  platonictype: IPlatonicName = "tetra",
): {
  update: IUpdater,
  attractor: IAttractorSystem,
} => {

  const seed = Math.random() * 123

  const [ attractorMaterial, computeAttractor ] = initiateAttractorComputation(name, vel, roughness)
  const initialAttractorTexture = computeAttractor()

  const [ noiseMaterial, computeNoise ] = initiateNoiseComputation(
    seed, attractorScale, noiseScale, platonicness, platonictype
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
  scene.add(attractor)



  return {
    update: (
      t: number,
    ) => {
      const attractorPositionTexture = computeAttractor()
      const noisePositionTexture = computeNoise(t, attractorPositionTexture)
      const responsedPositionTexture = computeResponse(t / 2, noisePositionTexture)
      material.uniforms.positionTexture.value = responsedPositionTexture
      attractor.rotation.y = t / 2
    },
    attractor: {
      dotSize: material.uniforms.dotSize,
      color: material.uniforms.color,
      roughness: attractorMaterial.uniforms.roughness,
      vel: attractorMaterial.uniforms.vel,
      attractorScale: noiseMaterial.uniforms.attractorScale,
      noiseScale: noiseMaterial.uniforms.noiseScale,
      platonicness: noiseMaterial.uniforms.platonicness,
      platonictype: {
        isTetra: noiseMaterial.uniforms.isTetra,
        isOcta: noiseMaterial.uniforms.isOcta,
        isCube: noiseMaterial.uniforms.isCube,
        isDodeca: noiseMaterial.uniforms.isDodeca,
        isIcosa: noiseMaterial.uniforms.isIcosa,
      },
    }
  }
}