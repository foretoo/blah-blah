import { SphereBufferGeometry } from "three"
import { getRandomSurfacePointsBuffer } from "./getRandomSurfacePointsBuffer"

export const spherePointsAmount = 128 ** 2

const sphereSurface = new SphereBufferGeometry(1, 36, 18)
export const spherePositions = getRandomSurfacePointsBuffer(sphereSurface, spherePointsAmount)