import { BufferAttribute, BufferGeometry, Points, ShaderMaterial } from "three"
import { scene } from "../setup"
import { spherePointsAmount, spherePositions } from "../shared"
import { Pointer, PrevPointer } from "../pointer"

import { bindController } from "./controller"
import { initiateNoiseComputation } from "./gpu-noise"
import { initiateResponseComputation } from "./gpu-response"

import vertexShader from "./shaders/vertex.glsl"
import fragmentShader from "./shaders/fragment.glsl"
import { noiseMaterials } from "../state"



const sphereGeometry = new BufferGeometry()
sphereGeometry.setAttribute("position", new BufferAttribute(spherePositions, 4))

const amount = spherePointsAmount
const side = Math.sqrt(amount)
const ref = new Float32Array(amount * 2)

for (let i = 0; i < amount; i++) {
  ref[i * 2 + 0] =  (i % side) / side
  ref[i * 2 + 1] = (i / side | 0) / side
}

sphereGeometry.setAttribute("ref", new BufferAttribute(ref, 2))



export const initSphere = (
  seed = Math.random() * 123,
  dotSize = 1,
  color = 0.5,
  sphereScale = 1,
  noiseScale = 0.25,
  roughness = 0.2,
  id = `${Math.random()}-${Math.random()}`,
) => {

  const material = new ShaderMaterial({
    uniforms: {
      positionTexture: { value: null },
      dotSize: { value: dotSize },
      color: { value: color },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  })

  const sphere = new Points(sphereGeometry, material)
  scene.add(sphere)



  const [ positionMaterial, computePosition ] = initiateNoiseComputation(
    seed,
    sphereScale,
    noiseScale,
    roughness,
    sphere.modelViewMatrix
  )

  const initialPositionTexture = computePosition(0)

  const computeResponse = initiateResponseComputation(initialPositionTexture)

  material.uniforms.positionTexture.value = initialPositionTexture



  bindController(sphere, positionMaterial, seed, id)
  noiseMaterials[id] = positionMaterial

  return {
    id,
    update: (
      t: number,
      pointer: Pointer,
      prevPointer: PrevPointer,
    ) => {
      const positionTexture = computePosition(t)
      material.uniforms.positionTexture.value = computeResponse(positionTexture, pointer, prevPointer)
      sphere.rotation.y = t / 2
    }
  }
}