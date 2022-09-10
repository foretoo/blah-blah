import { camera } from "./setup"



export const initiatePointer = (
  x = 0,
  y = 0,
  z = 0,
  d = 0,
) => {

  const prevPointer = { x, y, z }
  const pointer = { x, y, z, d }

  addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / innerWidth  *  2 - 1) * camera.right * (1 / camera.zoom)
    pointer.y = (e.clientY / innerHeight * -2 + 1) * (1 / camera.zoom)
    const clen = Math.sqrt(pointer.x ** 2 + pointer.y ** 2)
    pointer.z = clen < 1 ? Math.cos(clen * Math.PI / 2) : 0

    const [ dx, dy ] = [ pointer.x - prevPointer.x, pointer.y - prevPointer.y ]
    pointer.d += Math.sqrt(dx ** 2 + dy ** 2)
    
    prevPointer.x = pointer.x
    prevPointer.y = pointer.y
  })

  return pointer
}