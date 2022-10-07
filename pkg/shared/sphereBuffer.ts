const getRandomSpherePoint = () => {
  const theta = Math.random() * Math.PI * 2.0
  const phi = Math.acos(Math.random() * 2.0 - 1.0)

  const sinTheta = Math.sin(theta)
  const cosTheta = Math.cos(theta)
  const sinPhi = Math.sin(phi)
  const cosPhi = Math.cos(phi)

  const x = sinPhi * cosTheta
  const y = sinPhi * sinTheta
  const z = cosPhi
  return [ x, y, z ]
}

export const spherePointsAmount = 128 ** 2

const exactAmount = spherePointsAmount * 4
const spherePositions = new Float32Array(exactAmount)

for (let i = 0; i < exactAmount; i += 4) {
  const [ x, y, z ] = getRandomSpherePoint()
  spherePositions[i + 0] = x
  spherePositions[i + 1] = y
  spherePositions[i + 2] = z
  spherePositions[i + 3] = 1
}



export { spherePositions }