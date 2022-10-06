import { Vector4 } from "three"
import { camera } from "./init"



export const initiatePointer = (
  canvas: HTMLCanvasElement,
) => {

  const prevPointer = new Vector4(0, 0, 0, 0)
  const pointer = new Vector4(0, 0, 0, 0)

  canvas.addEventListener("pointermove", (e) => {
    prevPointer.x = pointer.x
    prevPointer.y = pointer.y

    pointer.x = (e.offsetX / canvas.width  *  2 - 1) * camera.right * (1 / camera.zoom)
    pointer.y = (e.offsetY / canvas.height * -2 + 1) * (1 / camera.zoom)

    const [ dx, dy ] = [ pointer.x - prevPointer.x, pointer.y - prevPointer.y ]
    pointer.w += Math.sqrt(dx ** 2 + dy ** 2)
  })

  return [ pointer, prevPointer ]
}