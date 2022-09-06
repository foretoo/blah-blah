import { Color, OrthographicCamera, Scene, WebGLRenderer } from "three"
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls"
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js"
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer"
import { spherePointsAmount } from "./shared"



// GUI
export const gui = new GUI()

// Canvas
export const canvas = document.querySelector("canvas")!

// Scene
export const scene = new Scene()
scene.background = new Color("#fff")

// Camera
const aspect = innerWidth / innerHeight
export const camera = new OrthographicCamera(-1 * aspect, aspect, 1, -1, 0.1, 100)
camera.zoom = 0.25
camera.updateProjectionMatrix()
scene.add(camera)

// Orbit
export const orbit = new TrackballControls(camera, canvas)
orbit.staticMoving = true
orbit.maxDistance = 10

// Renderer
export const renderer = new WebGLRenderer({
  canvas,
  preserveDrawingBuffer: true,
})
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

addEventListener("resize", () => {
  const aspect = innerWidth / innerHeight
  camera.left = -1 * aspect
  camera.right = aspect
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)  
})

// GPGPU
const amount = spherePointsAmount
const side = Math.sqrt(amount)
export const gpuComputer = new GPUComputationRenderer(side, side, renderer)