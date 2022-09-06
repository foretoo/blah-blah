import { Mesh, MeshBasicMaterial, PlaneBufferGeometry } from "three"
import { camera, renderer, scene } from "./setup"



renderer.autoClearColor = false

const clearPlane = new Mesh(
  new PlaneBufferGeometry(),
  new MeshBasicMaterial({
    color: 0xfffffff,
    transparent: true,
    opacity: 0.333
  })
)

clearPlane.renderOrder = -1



export const initClearPlane = () => {
  
  const distance = camera.position.distanceTo(scene.position) * 2
  clearPlane.position.z = -1 * distance
  
  const fov = (camera.fov * Math.PI) / 180
  const planeHeight = 2 * Math.tan(fov / 2) * distance
  clearPlane.scale.set(planeHeight * camera.aspect, planeHeight, 1)
  
  addEventListener("resize", () => {
    clearPlane.scale.set(planeHeight * camera.aspect, planeHeight, 1)
  })

  camera.add(clearPlane)
}