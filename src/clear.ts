import { Mesh, MeshBasicMaterial, PlaneBufferGeometry } from "three"
import { camera, gui, orbit, renderer, scene } from "./setup"
import { getClearPlaneState } from "./state"



renderer.autoClearColor = false

const { trailValue, saveTrail } = getClearPlaneState()

const clearPlane = new Mesh(
  new PlaneBufferGeometry(2, 2),
  new MeshBasicMaterial({
    color: 0xfffffff,
    transparent: true,
    opacity: trailValue || 0.3
  })
)
clearPlane.scale.set(innerWidth / innerHeight / camera.zoom, 1 / camera.zoom, 1)

clearPlane.renderOrder = -1



gui.add(clearPlane.material, "opacity", 0, 1, 0.1)
.name("clear trail")
.onChange((value: number) => saveTrail(value))



addEventListener("resize", () => {
  clearPlane.scale.set(innerWidth / innerHeight, 1, 1)
})
orbit.addEventListener("change", () => {
  clearPlane.scale.set(innerWidth / innerHeight / camera.zoom, 1 / camera.zoom, 1)
})



export const initClearPlane = () => {
  
  const distance = camera.position.distanceTo(scene.position) * 2
  clearPlane.position.z = -1 * distance

  camera.add(clearPlane)
}