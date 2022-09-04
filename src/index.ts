import "./style.sass"
import { camera, gui, orbit, renderer, scene } from "./setup"
import { initiateState } from "./state"
import { initClearPlane } from "./clear"
import { initAttractor } from "./attractor"
import { initSphere } from "./sphere"
import { gpuCompute } from "./attractor/gpgpu"




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

  
  spheresUpdate.forEach((update) => update(t))
  attractorsUpdate.forEach((update) => update(t))

  orbit.update()
  renderer.render(scene, camera)
  gpuCompute()
  requestAnimationFrame(play)
}
requestAnimationFrame(play)