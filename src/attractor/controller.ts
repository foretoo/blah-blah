import { BufferGeometry, Points, ShaderMaterial } from "three"
import { gui, scene } from "../setup"
import { locateState, attractorsUpdate, state } from "../state"
import aizawaShader from "./shaders/compute-aizawa.glsl"
import thomasShader from "./shaders/compute-thomas.glsl"
import { IAttractorName } from "./types"



let count = 0
const attractorsList = [ "aizawa", "thomas" ]



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



  const { dotSize, color } = attractorMesh.material.uniforms
  const { attractorScale, noiseStrength, noiseScale } = noiseMaterial.uniforms
  const { vel, roughness } = attractorMaterial.uniforms

  attractorFolder.add(dotSize, "value", 0, 3, 0.01)
  .name("dots size")
  .onChange(locateState)
  attractorFolder.add(color, "value", 0, 1, 0.01)
  .name("color")
  .onChange(locateState)
  attractorFolder.add(attractorScale, "value", 0.01, 5, 0.01)
  .name("attractor scale")
  .onChange(locateState)
  attractorFolder.add(noiseStrength, "value", 0, 1, 0.01)
  .name("noise strength")
  .onChange(locateState)
  attractorFolder.add(noiseScale, "value", 0.001, 0.382, 0.001)
  .name("noise scale")
  .onChange(locateState)
  attractorFolder.add(roughness, "value", 0, 1, 0.01)
  .name("roughness")
  .onChange(locateState)
  attractorFolder.add(vel, "value", 0, 3, 0.01)
  .name("vel")
  .onChange(locateState)



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
    state.attractors[id].name = curr
    locateState()
  })

  const aizawaFolder = attractorFolder.addFolder(`aizawa`)
  aizawaFolder.open()
  const thomasFolder = attractorFolder.addFolder(`thomas`)
  thomasFolder.hide()
  thomasFolder.open()



  const { tb, aa, ab, ac, ad, ae, af } = attractorMaterial.uniforms

  thomasFolder.add(tb, "value", 0.12, 0.28, 0.01).name("b").onChange(locateState)

  aizawaFolder.add(aa, "value", 0, 1, 0.01).name("a").onChange(locateState)
  aizawaFolder.add(ab, "value", -0.62, 0.62, 0.01).name("b").onChange(locateState)
  aizawaFolder.add(ac, "value", 1, 5, 0.01).name("c").onChange(locateState)
  aizawaFolder.add(ad, "value", -3, 3, 0.01).name("d").onChange(locateState)
  aizawaFolder.add(ae, "value", 0, 0.9, 0.01).name("e").onChange(locateState)
  aizawaFolder.add(af, "value", -0.5, 0.5, 0.01).name("f").onChange(locateState)



  state.attractors[id] = {
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
  locateState()



  attractorFolder.add({
    remove: () => {
      attractorsUpdate.filter((attractor) => attractor.id !== id)

      attractorMaterial.dispose()
      noiseMaterial.dispose()
      attractorMesh.geometry.dispose()
      attractorMesh.material.dispose()
      scene.remove(attractorMesh)
      attractorFolder.destroy()

      delete state.attractors[id]
      locateState()
    }
  }, "remove" )
}