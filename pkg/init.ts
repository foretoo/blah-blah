import { Color, OrthographicCamera, Scene, WebGLRenderer } from "three"
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer"

import { initiateState, IParticlesState } from "./state"
import { initClearPlane } from "./clear"
import { initiatePointer } from "./pointer"
import { spherePointsAmount } from "./shared"



/**
 * SETUP
 */

// Scene
export const scene = new Scene()
scene.background = new Color("#fff")

// Camera
export const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
camera.position.set(0, 0, 10)
camera.zoom = 0.25
camera.updateProjectionMatrix()
scene.add(camera)

// Renderer
export const renderer = new WebGLRenderer({ preserveDrawingBuffer: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// GPGPU
const amount = spherePointsAmount
const side = Math.sqrt(amount)
export const gpuComputer = new GPUComputationRenderer(side, side, renderer)

// POINTER
const [ pointer, prevPointer ] = initiatePointer(renderer.domElement)
export { pointer, prevPointer }



/**
 * EXPORT
 */

export const initParticles = (
  width: number,
  height: number,
  state: IParticlesState,
) => {

  const scaleClearPlane = initClearPlane(state.cleartrail)

  const resize = (
    width: number,
    height: number,
  ) => {
    const aspect = width / height
    camera.left = -1 * aspect
    camera.right = aspect
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    scaleClearPlane()
  }
  resize(width, height)

  const { spheres, spheresUpdate, attractors, attractorsUpdate } = initiateState(state)

  let t = 0
  const loopParticles = (time: number) => {
    t = time * 0.0005
    pointer.w *= 0.9

    spheresUpdate.forEach((update) => update(t))
    attractorsUpdate.forEach((update) => update(t))

    renderer.render(scene, camera)
    requestAnimationFrame(loopParticles)
  }
  const startParticles = () => {
    requestAnimationFrame(loopParticles)
  }

  return {
    canvas: renderer.domElement,
    resize,
    spheres,
    attractors,
    startParticles,
  }
}

export { type IParticlesState }