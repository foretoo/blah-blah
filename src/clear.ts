import { Mesh, MeshBasicMaterial, PlaneBufferGeometry } from "three"
import { camera, gui, orbit, renderer, scene } from "./setup"
import { state, locateState } from "./state"



export const initClearPlane = () => {

  renderer.autoClearColor = false



  const clearPlane = new Mesh(
    new PlaneBufferGeometry(2, 2),
    new MeshBasicMaterial({
      color: 0xfffffff,
      transparent: true,
      opacity: state.cleartrail
    })
  )

  const scaleClearPlane = () => {
    clearPlane.scale.set(innerWidth / innerHeight / camera.zoom, 1 / camera.zoom, 1)
  }

  clearPlane.renderOrder = -1



  gui.add(state, "cleartrail", 0, 1, 0.1)
  .name("clear trail")
  .onChange((value: number) => {
    clearPlane.material.opacity = value
    locateState()
  })



  addEventListener("resize", scaleClearPlane)
  orbit.addEventListener("change", scaleClearPlane)
  
  const distance = camera.position.distanceTo(scene.position) * 2
  clearPlane.position.z = -1 * distance
  scaleClearPlane()



  camera.add(clearPlane)
}