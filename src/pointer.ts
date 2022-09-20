import { camera } from "./setup"



export type Pointer = { x: number, y: number, z: number, d: number }
export type PrevPointer = { x: number, y: number, z: number }

export const initiatePointer = (
  x = 0,
  y = 0,
  z = 0,
  d = 0,
) => {

  const prevPointer: PrevPointer = { x, y, z }
  const pointer: Pointer = { x, y, z, d }

  addEventListener("pointermove", (e) => {
    prevPointer.x = pointer.x
    prevPointer.y = pointer.y
    // prevPointer.z = pointer.z
    
    pointer.x = (e.clientX / innerWidth  *  2 - 1) * camera.right * (1 / camera.zoom)
    pointer.y = (e.clientY / innerHeight * -2 + 1) * (1 / camera.zoom)
    // const clen = Math.sqrt(pointer.x ** 2 + pointer.y ** 2)
    // pointer.z = clen < 1 ? Math.cos(clen * Math.PI / 2) : 0

    const [ dx, dy ] = [ pointer.x - prevPointer.x, pointer.y - prevPointer.y ]
    pointer.d += Math.sqrt(dx ** 2 + dy ** 2)
  })

  return [ pointer, prevPointer ] as [ Pointer, PrevPointer ]
}