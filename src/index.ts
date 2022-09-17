import "./style.sass"
import { camera, gui, orbit, renderer, scene } from "./setup"
import { attractorsUpdate, initiateState, spheresUpdate, state, locateState, IPlatonic, noiseMaterials } from "./state"
import { initClearPlane } from "./clear"
import { initAttractor } from "./attractor"
import { initSphere } from "./sphere"
import { initiatePointer } from "./pointer"



camera.position.set(0, 0, 10)
initClearPlane()



const [ pointer, prevPointer ] = initiatePointer()

gui.add(state.platonicness, "value", 0, 1, 0.01).name("platonicness")
.onChange((value: number) => {
  state.platonicness.value = value
  locateState()
})

gui.add(state, "platonictype", [ "tetra", "octa", "cube", "dodeca", "icosa" ])
.name("platonic type")
.onChange((type: IPlatonic) => {
  state.platonictype = type
  for (const id in noiseMaterials) {
    noiseMaterials[id].uniforms.isTetra.value = type === "tetra" ? 1 : 0
    noiseMaterials[id].uniforms.isOcta.value = type === "octa" ? 1 : 0
    noiseMaterials[id].uniforms.isCube.value = type === "cube" ? 1 : 0
    noiseMaterials[id].uniforms.isDodeca.value = type === "dodeca" ? 1 : 0
    noiseMaterials[id].uniforms.isIcosa.value = type === "icosa" ? 1 : 0
  }
  locateState()
})

gui.add({
  "add sphere": () => spheresUpdate.push(initSphere())
},"add sphere")
gui.add({
  "add attractor": () => attractorsUpdate.push(initAttractor())
},"add attractor")



initiateState()



let t = 0
const play = () => {
  t += 0.01
  pointer.d *= 0.9

  spheresUpdate.forEach((sphere) => sphere.update(t, pointer, prevPointer))
  attractorsUpdate.forEach((attractor) => attractor.update(t, pointer, prevPointer))

  orbit.update()
  renderer.render(scene, camera)
  requestAnimationFrame(play)
}
requestAnimationFrame(play)