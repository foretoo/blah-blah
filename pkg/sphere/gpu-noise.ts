import { NearestFilter, RepeatWrapping } from "three"
import { gpuComputer } from "../init"
import { spherePointsAmount, spherePositions } from "../shared"
import computeNoiseShader from "./shaders/compute-noise.glsl"
import { IPlatonicName } from "../state"



const amount = spherePointsAmount
const side = Math.sqrt(amount)



export const initiateNoiseComputation = (
  seed: number,
  sphereScale: number,
  noiseScale: number,
  roughness: number,
  platonicness: number,
  platonictype: IPlatonicName,
) => {



const positionTexture = gpuComputer.createTexture()
positionTexture.image.data.set(spherePositions)

const positionMaterial = gpuComputer.createShaderMaterial(
  computeNoiseShader,
  {
    positionTexture: { value: positionTexture },

    time: { value: 0 },
    seed: { value: seed },
    sphereScale: { value: sphereScale },
    noiseScale: { value: noiseScale },
    roughness: { value: roughness },

    platonicness: { value: platonicness },
    isTetra: { value: platonictype === "tetra" ? 1 : 0 },
    isOcta: { value: platonictype === "octa" ? 1 : 0 },
    isCube: { value: platonictype === "cube" ? 1 : 0 },
    isDodeca: { value: platonictype === "dodeca" ? 1 : 0 },
    isIcosa: { value: platonictype === "icosa" ? 1 : 0 },
  }
)

const positionTarget = gpuComputer.createRenderTarget(
  side, side, RepeatWrapping, RepeatWrapping, NearestFilter, NearestFilter
)

const computeNoise = (t: number) => {
  positionMaterial.uniforms.time.value = t
  gpuComputer.doRenderTarget(positionMaterial, positionTarget)
  return positionTarget.texture
}

return [ positionMaterial, computeNoise ] as [ typeof positionMaterial, typeof computeNoise ]
}