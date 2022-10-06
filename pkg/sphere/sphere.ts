import { BufferAttribute, BufferGeometry, Points, ShaderMaterial, Vector4 } from "three"
import { IPlatonicName, ISphereSystem, IUpdater } from "../state"
import { renderer, scene } from "../init"
import { spherePointsAmount, spherePositions } from "../shared"

import { initiateNoiseComputation } from "./gpu-noise"
import { initiateResponseComputation } from "./gpu-response"

import vertexShader from "./shaders/vertex.glsl"
import fragmentShader from "./shaders/fragment.glsl"



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
  dotSize = 1 * renderer.getPixelRatio(),
  color = 0.5,
  sphereScale = 1,
  noiseScale = 0.25,
  roughness = 0.2,
  platonicness = 0,
  platonictype: IPlatonicName = "tetra",
): {
  update: IUpdater,
  sphere: ISphereSystem,
} => {

  const seed = Math.random() * 123

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



  const [ noiseMaterial, computePosition ] = initiateNoiseComputation(
    seed,
    sphereScale,
    noiseScale,
    roughness,
    platonicness,
    platonictype,
  )

  const initialPositionTexture = computePosition(0)

  const computeResponse = initiateResponseComputation(initialPositionTexture)

  material.uniforms.positionTexture.value = initialPositionTexture



  return {
    update: (
      t: number,
    ) => {
      const positionTexture = computePosition(t)
      material.uniforms.positionTexture.value = computeResponse(t / 2, positionTexture)
      sphere.rotation.y = t / 2
    },
    sphere: {
      dotSize: material.uniforms.dotSize,
      color: material.uniforms.color,
      sphereScale: noiseMaterial.uniforms.sphereScale,
      noiseScale: noiseMaterial.uniforms.noiseScale,
      roughness: noiseMaterial.uniforms.roughness,
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