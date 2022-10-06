import { IUniform } from "three"

type U = IUniform<number>

export type IAttractorName = "aizawa" | "thomas"

export interface IUniforms { [uniform: string]: IUniform<any> }

export interface IGPGPUUniforms extends IUniforms {
  dotSize: U
  vel: U
  roughness: U
  tb: U
  aa: U
  ab: U
  ac: U
  ad: U
  ae: U
  af: U
}