type IPlatonicName = "tetra" | "octa" | "cube" | "dodeca" | "icosa"

type IAttractorName = "aizawa" | "thomas"

type ISphere = {
  dotSize: number
  color: number
  sphereScale: number
  noiseScale: number
  roughness: number
  platonicness: number
  platonictype: IPlatonicName
}

type IAttractor = {
  name: IAttractorName
  dotSize: number
  color: number
  attractorScale: number
  noiseScale: number
  roughness: number
  vel: number
  platonicness: number
  platonictype: IPlatonicName
}

export declare type IParticlesState = {
  cleartrail: number
  attractors: IAttractor[]
  spheres: ISphere[]
}

type IUniform<T> = { value: T }
type FUniform = IUniform<number>

type IPlatonicType = {
  isTetra: FUniform
  isOcta: FUniform
  isCube: FUniform
  isDodeca: FUniform
  isIcosa: FUniform
}

type ISpheres = {
  dotSize: FUniform
  color: FUniform
  sphereScale: FUniform
  noiseScale: FUniform
  roughness: FUniform
  platonicness: FUniform
  platonictype: IPlatonicType
}[]
type IAttractors = {
  dotSize: FUniform
  color: FUniform
  attractorScale: FUniform
  noiseScale: FUniform
  roughness: FUniform
  vel: FUniform
  platonicness: FUniform
  platonictype: IPlatonicType
}[]

export declare const initParticles: (
  width: number,
  height: number,
  state: IParticlesState,
) => {
  canvas: HTMLCanvasElement
  resize: (width: number, height: number) => void
  spheres: ISpheres
  attractors: IAttractors
  startParticles: () => void
}