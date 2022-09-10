import { BufferGeometry, Points, ShaderMaterial } from "three"
import { gui, scene } from "../setup"
import { attractorsUpdate } from "../state"
import aizawaShader from "./shaders/compute-aizawa.glsl"
import thomasShader from "./shaders/compute-thomas.glsl"
import { IAttractorName, IAttractorStorage, IControlledAttractor } from "./types"



let count = 0
const attractorsList = [ "aizawa", "thomas" ]



const localStoredAttractors: IAttractorStorage = {}
const locateAttractors = () => {
  localStorage.setItem("blah-blah-attractors", JSON.stringify(localStoredAttractors))
}



export const bindController = (
  attractorMaterial: ShaderMaterial,
  noiseMaterial: ShaderMaterial,
  attractorMesh: Points<BufferGeometry, ShaderMaterial>,
  seed: number,
  name: IAttractorName,
  id: string,
) => {

  count++
  const attractorFolder = gui.addFolder(`attractor-${count}`)
  attractorFolder.close()
  const saveAttractor = () => {
    localStoredAttractors[id] = localStoredAttractor
    locateAttractors()
  }



  const { dotSize, color } = attractorMesh.material.uniforms
  const { attractorScale, noiseStrength, noiseScale } = noiseMaterial.uniforms
  const { vel, roughness } = attractorMaterial.uniforms

  attractorFolder.add(dotSize, "value", 0, 3, 0.01)
  .name("dots size")
  .onChange(saveAttractor)
  attractorFolder.add(color, "value", 0, 1, 0.01)
  .name("color")
  .onChange(saveAttractor)
  attractorFolder.add(attractorScale, "value", 0.01, 5, 0.01)
  .name("attractor scale")
  .onChange(saveAttractor)
  attractorFolder.add(noiseStrength, "value", 0, 1, 0.01)
  .name("noise strength")
  .onChange(saveAttractor)
  attractorFolder.add(noiseScale, "value", 0.001, 0.382, 0.001)
  .name("noise scale")
  .onChange(saveAttractor)
  attractorFolder.add(roughness, "value", 0, 1, 0.01)
  .name("roughness")
  .onChange(saveAttractor)
  attractorFolder.add(vel, "value", 0, 3, 0.01)
  .name("vel")
  .onChange(saveAttractor)



  attractorFolder
  .add({ name }, "name", attractorsList)
  .name("attractor")
  .onChange((curr: IAttractorName) => {
    if (curr === "thomas") {
      aizawaFolder.hide()
      thomasFolder.show()
      attractorMaterial.fragmentShader = thomasShader
    }
    else if (curr === "aizawa") {
      aizawaFolder.show()
      thomasFolder.hide()
      attractorMaterial.fragmentShader = aizawaShader
    }
    attractorMaterial.needsUpdate = true
    localStoredAttractor.name = curr
    saveAttractor()
  })

  const aizawaFolder = attractorFolder.addFolder(`aizawa`)
  aizawaFolder.open()
  const thomasFolder = attractorFolder.addFolder(`thomas`)
  thomasFolder.hide()
  thomasFolder.open()



  const { tb, aa, ab, ac, ad, ae, af } = attractorMaterial.uniforms

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
    dotSize,
    color,
    attractorScale,
    noiseStrength,
    noiseScale,
    roughness,
    vel,
    tb, aa, ab, ac, ad, ae, af
  }
  saveAttractor()



  attractorFolder.add({
    remove: () => {
      attractorsUpdate.filter((attractor) => attractor.id !== id)
      
      attractorMaterial.dispose()
      noiseMaterial.dispose()
      attractorMesh.geometry.dispose()
      attractorMesh.material.dispose()
      scene.remove(attractorMesh)
      attractorFolder.destroy()

      delete localStoredAttractors[id]
      locateAttractors()
    }
  }, "remove" )
}