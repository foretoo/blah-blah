import { BufferGeometry, IUniform, Points, ShaderMaterial } from "three"
import { locateState, spheresUpdate, state } from "../state"
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



export const bindController = (
  sphere: Points<BufferGeometry, ShaderMaterial>,
  computeMaterial: ShaderMaterial,
  seed: number,
  id: string
) => {

  count++
  const sphereFolder = gui.addFolder(`sphere-${count}`)
  sphereFolder.close()



  const { dotSize, color } = sphere.material.uniforms
  const { sphereScale, noiseScale, roughness } = computeMaterial.uniforms

  sphereFolder.add(dotSize, "value", 0, 3, 0.01).name("dot size")
  .onChange(locateState)
  sphereFolder.add(color, "value", 0, 1, 0.01).name("color")
  .onChange(locateState)
  sphereFolder.add(sphereScale, "value", 0.01, 5, 0.01).name("sphere scale")
  .onChange(locateState)
  sphereFolder.add(noiseScale, "value", 0.01, 1, 0.01).name("noise scale")
  .onChange(locateState)
  sphereFolder.add(roughness, "value", 0, 1, 0.01).name("roughness")
  .onChange(locateState)



  state.spheres[id] = {
    type: "sphere",
    seed,
    dotSize,
    color,
    sphereScale,
    noiseScale,
    roughness
  }
  locateState()



  sphereFolder.add({
    remove: () => {
      spheresUpdate.filter((sphere) => sphere.id !== id)
      
      sphere.geometry.dispose()
      sphere.material.dispose()
      scene.remove(sphere)
      sphereFolder.destroy()

      delete state.spheres[id]
      locateState()
    }
  },"remove" )
}