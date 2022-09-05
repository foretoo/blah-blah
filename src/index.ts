import "./style.sass"
import { camera, gpuComputer, gui, orbit, renderer, scene } from "./setup"
import { initiateState } from "./state"
import { initClearPlane } from "./clear"
import { initAttractor } from "./attractor"
import { initSphere } from "./sphere"



initClearPlane()
camera.position.set(0, 0, 12)



gui.add({
  "add sphere": () => spheresUpdate.push(initSphere())
},"add sphere")
gui.add({
  "add attractor": () => attractorsUpdate.push(initAttractor())
},"add attractor")



const { spheresUpdate, attractorsUpdate } = initiateState()



let t = 0
const play = () => {
  t += 0.01

  gpuComputer.compute()
  spheresUpdate.forEach(({ update }) => update(t))
  attractorsUpdate.forEach(({ update }) => update(t))

  orbit.update()
  renderer.render(scene, camera)
  requestAnimationFrame(play)
}
requestAnimationFrame(play)