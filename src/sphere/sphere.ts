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
  sphereScale = 1,
  noiseScale = 0.2,
  roughness = 0,
  id?: string,
) => {

  const material = new ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      seed: { value: seed },

      sphereScale: { value: sphereScale },
      noiseScale: { value: noiseScale },
      roughness: { value: roughness }
    },
    vertexShader,
    fragmentShader,
    transparent: true,
  })

  const sphere = new Points(sphereGeometry, material)
  
  bindController(sphere, seed, id)
  scene.add(sphere)

  return (
    t: number,
  ) => {
    material.uniforms.time.value = t
  }
}