import { Vector4 } from "three"
import { camera, renderer } from "./init"



export const initiatePointer = (
  canvas: HTMLCanvasElement,
) => {

  const prevPointer = new Vector4(0, 0, 0, 0)
  const pointer = new Vector4(0, 0, 0, 0)

  const pr = renderer.getPixelRatio()
  const cz = 1 / camera.zoom

  canvas.addEventListener("pointermove", (e) => {
    prevPointer.x = pointer.x
    prevPointer.y = pointer.y

    pointer.x = (e.offsetX / canvas.width  * pr *  2 - 1) * camera.right * cz
    pointer.y = (e.offsetY / canvas.height * pr * -2 + 1) * cz

    const [ dx, dy ] = [ pointer.x - prevPointer.x, pointer.y - prevPointer.y ]
    pointer.w += Math.sqrt(dx ** 2 + dy ** 2)
  })

  return [ pointer, prevPointer ]
}