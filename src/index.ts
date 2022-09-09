import "./style.sass"
import { camera, gui, orbit, renderer, scene } from "./setup"
import { attractorsUpdate, initiateState, spheresUpdate } from "./state"
import { initClearPlane } from "./clear"
import { initAttractor } from "./attractor"
import { initSphere } from "./sphere"
import { initiatePointer } from "./pointer"



camera.position.set(1, 5, 10)

const pointer = initiatePointer()

gui.add({
  "add sphere": () => spheresUpdate.push(initSphere())
},"add sphere")
gui.add({
  "add attractor": () => attractorsUpdate.push(initAttractor())
},"add attractor")

initClearPlane()

initiateState()


let t = 0
const play = () => {
  t += 0.01

  spheresUpdate.forEach((sphere) => sphere.update(t))
  attractorsUpdate.forEach((attractor) => attractor.update(t))

  orbit.update()
  renderer.render(scene, camera)
  requestAnimationFrame(play)
}
requestAnimationFrame(play)