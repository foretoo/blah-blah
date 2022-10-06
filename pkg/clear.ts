import { Mesh, MeshBasicMaterial, PlaneBufferGeometry, Vector2 } from "three"
import { camera, renderer, scene } from "./init"



export const initClearPlane = (
  opacity: number
) => {

  renderer.autoClearColor = false

  const clearPlane = new Mesh(
    new PlaneBufferGeometry(2, 2),
    new MeshBasicMaterial({
      color: 0xfffffff,
      transparent: true,
      opacity
    })
  )

  const size = new Vector2()
  const scaleClearPlane = () => {
    renderer.getSize(size)
    clearPlane.scale.set(size.x / size.y / camera.zoom, 1 / camera.zoom, 1)
  }

  clearPlane.renderOrder = -1
  
  const distance = camera.position.distanceTo(scene.position) * 2
  clearPlane.position.z = -1 * distance

  camera.add(clearPlane)

  return scaleClearPlane
}