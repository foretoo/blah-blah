import { BufferGeometry, Mesh, Vector3 } from "three"
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler"



export const getRandomSurfacePointsBuffer = (
  surface: BufferGeometry,
  amount: number,
) => {
  const sampler = new MeshSurfaceSampler(new Mesh(surface))
  .setWeightAttribute(null)
  .build()

  const exactAmount = amount * 3
  const positions = new Float32Array(exactAmount)
  const point = new Vector3()

  for (let i = 0; i < exactAmount; i += 3) {
    sampler.sample(point)
    positions[i + 0] = point.x
    positions[i + 1] = point.y
    positions[i + 2] = point.z
  }

  return positions
}