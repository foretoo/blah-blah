import { Mesh, MeshBasicMaterial, PlaneBufferGeometry } from "three"
import { camera, orbit, renderer, scene } from "./setup"



const clearPlane = new Mesh(
  new PlaneBufferGeometry(),
  new MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.333
  })
)
clearPlane.position.z = -5
clearPlane.renderOrder = -1



let fov = (camera.fov * Math.PI) / 180

function stickToCamera() {
  const distance = clearPlane.position.distanceTo(camera.position)
  const height = 2 * Math.tan(fov / 2) * distance
  const width = height * camera.aspect
  clearPlane.scale.set(width * 100, height * 100, 1)
  clearPlane.lookAt(scene.position)
}
stickToCamera()

orbit.noPan = true
orbit.addEventListener("change", stickToCamera)
addEventListener("resize", stickToCamera)
renderer.autoClearColor = false



export const initClearPlane = () => {
  scene.add(clearPlane)
}