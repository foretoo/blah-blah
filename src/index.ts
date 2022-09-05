import "./style.sass"
import { camera, gpuComputer, gui, orbit, renderer, scene } from "./setup"
import { attractorsUpdate, initiateState, spheresUpdate } from "./state"
import { initClearPlane } from "./clear"
import { initAttractor } from "./attractor"
import { initSphere } from "./sphere"



gui.add({
  "add sphere": () => spheresUpdate.push(initSphere())
},"add sphere")
gui.add({
  "add attractor": () => attractorsUpdate.push(initAttractor())
},"add attractor")

initiateState()



initClearPlane()
camera.position.set(0, 0, 12)



let t = 0
const play = () => {
  t += 0.01

  gpuComputer.compute()
  spheresUpdate.forEach((sphere) => sphere.update(t))
  attractorsUpdate.forEach((attractor) => attractor.update(t))

  orbit.update()
  renderer.render(scene, camera)
  requestAnimationFrame(play)
}
requestAnimationFrame(play)