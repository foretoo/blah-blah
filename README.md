## Installation

```bash
npm install github:foretoo/blah-blah
```

</br>

## Usage

```typescript
import { initParticles, IParticlesState } from "blah-blah/build"


// dotSize is multiplied by devicePixelRatio (max 2) on `initParticles` call
const initialData: IParticlesState = {
  cleartrail: 0.3,
  spheres: [
    {
      dotSize: 1,
      color: 0.25,
      sphereScale: 1,
      noiseScale: 0.5,
      roughness: 0.2,
      platonicness: 0,
      platonictype: "tetra",
    },
  ],
  attractors: [
    {
      name: "aizawa",
      dotSize: 1,
      color: 0.25,
      attractorScale: 1.25,
      noiseScale: 0.2,
      roughness: 0.2,
      vel: 0.5,
      platonicness: 1,
      platonictype: "octa",
    },
  ]
}



const {

  canvas,
  startParticles,
  resize,
  spheres,
  attractors,

} = initParticles(500, 500, initialData)

document.body.append(canvas)
startParticles()
```
</br>

structure of returned `spheres` (for example):
```typescript
// `values` are for animation
[{
  dotSize:      { value: 1 },
  color:        { value: 0.25 },
  sphereScale:  { value: 1 },
  noiseScale:   { value: 0.75 },
  roughness:    { value: 0 },
  platonicness: { value: 0 },
  platonictype: {
    isTetra:    { value: 1 },
    isOcta:     { value: 0 },
    isCube:     { value: 0 },
    isDodeca:   { value: 0 },
    isIcosa:    { value: 0 }
  }
}]
```

</br>

## Public
https://foretoo.github.io/blah-blah/

</br>

## Todos

- 🧃 ***feature*** — colored fields inside a shape

</br>

## Done

- ~~🛼 ***feature*** — morphing to paltonic solids~~
- ~~💨 ***feature*** — pointer response~~
- ~~👻 ***add*** — clearPlane ui handler~~
- ~~🤌 ***add*** — ui inputs for dots sizes and color transparency~~
- ~~🍚 ***add*** — sphere roughness~~
- ~~🦀 ***fix*** — empty screen on some machines (pows in platonics)~~
- ~~🦀 ***fix*** — mousePlane rotating~~
- ~~🦀 ***fix*** — clearPlane correct resizing on window resize~~
- ~~🦀 ***fix*** — clearPlane bind to camera correctly~~
- ~~🦀 ***fix*** — different attractors at the same time (gpgpu issue)~~