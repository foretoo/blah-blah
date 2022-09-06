import { Color, PerspectiveCamera, Scene, WebGLRenderer } from "three"
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
export const camera = new PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100)
scene.add(camera)

// Orbit
export const orbit = new TrackballControls(camera, canvas)

// Renderer
export const renderer = new WebGLRenderer({
  canvas,
  preserveDrawingBuffer: true,
})
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)  
})

// GPGPU
const amount = spherePointsAmount
const side = Math.sqrt(amount)
export const gpuComputer = new GPUComputationRenderer(side, side, renderer)