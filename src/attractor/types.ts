import { IUniform } from "three"

export type IOuterAttractorProps = {
  seed?: number
  attractorScale: number
  noiseStrength: number
  noiseScale: number
}

export type IInnerAttractorProps = {
  name: IAttractorName
  roughness: number
  vel: number
  tb: number, aa: number, ab: number, ac: number, ad: number, ae: number, af: number
}

type U = IUniform<number>

export type IAttractorName = "aizawa" | "thomas"

export type IControlledAttractor =  {
  type: "attractor"
  seed: number
  name: IAttractorName
  attractorScale: U
  noiseStrength: U
  noiseScale: U
  roughness: U
  vel: U
  tb: U, aa: U, ab: U, ac: U, ad: U, ae: U, af: U
}
export interface IAttractorStorage { [id: string]: IControlledAttractor }

export interface IUniforms { [uniform: string]: IUniform<any> }
export interface IGPGPUUniforms extends IUniforms {
  vel: IUniform<number>
  roughness: IUniform<number>
  tb: IUniform<number>
  aa: IUniform<number>
  ab: IUniform<number>
  ac: IUniform<number>
  ad: IUniform<number>
  ae: IUniform<number>
  af: IUniform<number>
}