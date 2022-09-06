import { BufferAttribute, BufferGeometry, Points, ShaderMaterial } from "three"
import { scene } from "../setup"
import { spherePositions } from "../shared"
import vertexShader from "./vertex-sphere.glsl"
import fragmentShader from "./fragment-sphere.glsl"
import { bindController } from "./controller"



const sphereGeometry = new BufferGeometry()
sphereGeometry.setAttribute("position", new BufferAttribute(spherePositions, 3))



export const initSphere = (
  seed = Math.random() * 123,
  dotSize = 1,
  color = 0.5,
  sphereScale = 1,
  noiseScale = 0.25,
  roughness = 0.2,
  id = crypto.randomUUID(),
) => {

  const material = new ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      seed: { value: seed },

      dotSize: { value: dotSize },
      color: { value: color },
      sphereScale: { value: sphereScale },
      noiseScale: { value: noiseScale },
      roughness: { value: roughness }
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  })

  const sphere = new Points(sphereGeometry, material)
  
  bindController(sphere, seed, id)
  scene.add(sphere)

  return {
    id,
    update: (t: number) => material.uniforms.time.value = t
  }
}