import { BufferGeometry, Points, ShaderMaterial } from "three"
import { gui, scene } from "../setup"
import { attractorsUpdate } from "../state"
import aizawaShader from "./shaders/aizawa.glsl"
import thomasShader from "./shaders/thomas.glsl"
import { IAttractorName, IAttractorStorage, IControlledAttractor } from "./types"



let count = 0
const attractorsList = [ "aizawa", "thomas" ]



const localStoredAttractors: IAttractorStorage = {}
const locateAttractors = () => {
  localStorage.setItem("blah-blah-attractors", JSON.stringify(localStoredAttractors))
}



export const bindController = (
  gpgpuMaterial: ShaderMaterial,
  attractorMesh: Points<BufferGeometry, ShaderMaterial>,
  seed: number,
  name: IAttractorName,
  id: string,
) => {

  count++
  const attractorGUI = gui.addFolder(`attractor-${count}`)
  const saveAttractor = () => {
    localStoredAttractors[id] = localStoredAttractor
    locateAttractors()
  }



  const { attractorScale, noiseStrength, noiseScale } = attractorMesh.material.uniforms
  const { vel, roughness } = gpgpuMaterial.uniforms

  attractorGUI.add(attractorScale, "value", 0.01, 5, 0.01)
  .name("attractor scale")
  .onChange(saveAttractor)
  attractorGUI.add(noiseStrength, "value", 0, 1, 0.01)
  .name("noise strength")
  .onChange(saveAttractor)
  attractorGUI.add(noiseScale, "value", 0.001, 0.382, 0.001)
  .name("noise scale")
  .onChange(saveAttractor)
  attractorGUI.add(roughness, "value", 0, 1, 0.01)
  .name("roughness")
  .onChange(saveAttractor)
  attractorGUI.add(vel, "value", 0, 3, 0.01)
  .name("vel")
  .onChange(saveAttractor)



  attractorGUI
  .add({ name }, "name", attractorsList)
  .name("attractor")
  .onChange((curr: IAttractorName) => {
    if (curr === "thomas") {
      aizawaFolder.hide()
      thomasFolder.show()
      gpgpuMaterial.fragmentShader = thomasShader
    }
    else if (curr === "aizawa") {
      aizawaFolder.show()
      thomasFolder.hide()
      gpgpuMaterial.fragmentShader = aizawaShader
    }
    gpgpuMaterial.needsUpdate = true
    localStoredAttractors[id].name = curr
    saveAttractor()
  })

  const aizawaFolder = attractorGUI.addFolder(`aizawa`)
  aizawaFolder.open()
  const thomasFolder = attractorGUI.addFolder(`thomas`)
  thomasFolder.hide()
  thomasFolder.open()



  const { tb, aa, ab, ac, ad, ae, af } = gpgpuMaterial.uniforms

  thomasFolder.add(tb, "value", 0.12, 0.28, 0.01).name("b").onChange(saveAttractor)

  aizawaFolder.add(aa, "value", 0, 1, 0.01).name("a").onChange(saveAttractor)
  aizawaFolder.add(ab, "value", -0.62, 0.62, 0.01).name("b").onChange(saveAttractor)
  aizawaFolder.add(ac, "value", 1, 5, 0.01).name("c").onChange(saveAttractor)
  aizawaFolder.add(ad, "value", -3, 3, 0.01).name("d").onChange(saveAttractor)
  aizawaFolder.add(ae, "value", 0, 0.9, 0.01).name("e").onChange(saveAttractor)
  aizawaFolder.add(af, "value", -0.5, 0.5, 0.01).name("f").onChange(saveAttractor)



  const localStoredAttractor: IControlledAttractor = {
    type: "attractor",
    seed,
    name,
    attractorScale,
    noiseStrength,
    noiseScale,
    roughness,
    vel,
    tb, aa, ab, ac, ad, ae, af
  }
  saveAttractor()



  attractorGUI.add({
    remove: () => {
      attractorsUpdate.filter((attractor) => attractor.id !== id)
      
      gpgpuMaterial.dispose()
      attractorMesh.geometry.dispose()
      attractorMesh.material.dispose()
      scene.remove(attractorMesh)
      attractorGUI.destroy()

      delete localStoredAttractors[id]
      locateAttractors()
    }
  }, "remove" )
}