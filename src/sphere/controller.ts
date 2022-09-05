import { BufferGeometry, IUniform, Points, ShaderMaterial } from "three"
import { gui, scene } from "../setup"



let count = 0

export interface IControlledSphere {
  type: "sphere"
  seed: number
  sphereScale: IUniform<number>
  noiseScale: IUniform<number>
  roughness: IUniform<number>
}
export interface IShereStorage {
  [id: string]: IControlledSphere
}

const localStoredSpheres: IShereStorage = {}
const locateSpheres = () => {
  localStorage.setItem("blah-blah-spheres", JSON.stringify(localStoredSpheres))
}



export const bindController = (
  sphere: Points<BufferGeometry, ShaderMaterial>,
  seed: number,
  id: string
) => {

  count++
  const sphereGUI = gui.addFolder(`sphere-${count}`)
  const saveShere = () => {
    localStoredSpheres[id] = localStoredSphere
    locateSpheres()
  }
  



  const { sphereScale, noiseScale, roughness } = sphere.material.uniforms

  sphereGUI.add(sphereScale, "value", 0.01, 2, 0.01).name("sphere scale")
  .onChange(saveShere)

  sphereGUI.add(noiseScale, "value", 0.01, 1, 0.01).name("noise scale")
  .onChange(saveShere)

  sphereGUI.add(roughness, "value", 0, 1, 0.01).name("roughness")
  .onChange(saveShere)



  const localStoredSphere: IControlledSphere = {
    type: "sphere",
    seed,
    sphereScale,
    noiseScale,
    roughness
  }
  saveShere()



  sphereGUI.add({
    remove: () => {
      sphere.geometry.dispose()
      sphere.material.dispose()
      scene.remove(sphere)
      sphereGUI.destroy()

      delete localStoredSpheres[id]
      locateSpheres()
    }
  }, "remove" )
}