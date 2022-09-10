import { BufferGeometry, IUniform, Points, ShaderMaterial } from "three"
import { spheresUpdate } from "../state"
import { gui, scene } from "../setup"



let count = 0

export interface IControlledSphere {
  type: "sphere"
  seed: number
  dotSize: IUniform<number>
  color: IUniform<number>
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
  computeMaterial: ShaderMaterial,
  seed: number,
  id: string
) => {

  count++
  const sphereFolder = gui.addFolder(`sphere-${count}`)
  sphereFolder.close()
  const saveShere = () => {
    localStoredSpheres[id] = localStoredSphere
    locateSpheres()
  }
  



  const { dotSize, color } = sphere.material.uniforms
  const { sphereScale, noiseScale, roughness } = computeMaterial.uniforms

  sphereFolder.add(dotSize, "value", 0, 3, 0.01).name("dot size")
  .onChange(saveShere)
  sphereFolder.add(color, "value", 0, 1, 0.01).name("color")
  .onChange(saveShere)
  sphereFolder.add(sphereScale, "value", 0.01, 5, 0.01).name("sphere scale")
  .onChange(saveShere)
  sphereFolder.add(noiseScale, "value", 0.01, 1, 0.01).name("noise scale")
  .onChange(saveShere)
  sphereFolder.add(roughness, "value", 0, 1, 0.01).name("roughness")
  .onChange(saveShere)



  const localStoredSphere: IControlledSphere = {
    type: "sphere",
    seed,
    dotSize,
    color,
    sphereScale,
    noiseScale,
    roughness
  }
  saveShere()



  sphereFolder.add({
    remove: () => {
      spheresUpdate.filter((sphere) => sphere.id !== id)
      
      sphere.geometry.dispose()
      sphere.material.dispose()
      scene.remove(sphere)
      sphereFolder.destroy()

      delete localStoredSpheres[id]
      locateSpheres()
    }
  },"remove" )
}