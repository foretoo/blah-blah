import { Scene, Camera, Mesh, PlaneGeometry, ShaderMaterial, WebGLRenderTarget, RGBAFormat, DataTexture, FloatType, NearestFilter, ClampToEdgeWrapping, Triangle, Vector3, SphereBufferGeometry, RepeatWrapping, BufferGeometry, BufferAttribute, Points, PlaneBufferGeometry, MeshBasicMaterial, Vector2, Vector4, Color, OrthographicCamera, WebGLRenderer } from "three";
class GPUComputationRenderer {
  constructor(sizeX, sizeY, renderer2) {
    this.variables = [];
    this.currentTextureIndex = 0;
    let dataType = FloatType;
    const scene2 = new Scene();
    const camera2 = new Camera();
    camera2.position.z = 1;
    const passThruUniforms = {
      passThruTexture: { value: null }
    };
    const passThruShader = createShaderMaterial(getPassThroughFragmentShader(), passThruUniforms);
    const mesh = new Mesh(new PlaneGeometry(2, 2), passThruShader);
    scene2.add(mesh);
    this.setDataType = function(type) {
      dataType = type;
      return this;
    };
    this.addVariable = function(variableName, computeFragmentShader, initialValueTexture) {
      const material = this.createShaderMaterial(computeFragmentShader);
      const variable = {
        name: variableName,
        initialValueTexture,
        material,
        dependencies: null,
        renderTargets: [],
        wrapS: null,
        wrapT: null,
        minFilter: NearestFilter,
        magFilter: NearestFilter
      };
      this.variables.push(variable);
      return variable;
    };
    this.setVariableDependencies = function(variable, dependencies) {
      variable.dependencies = dependencies;
    };
    this.init = function() {
      if (renderer2.capabilities.isWebGL2 === false && renderer2.extensions.has("OES_texture_float") === false) {
        return "No OES_texture_float support for float textures.";
      }
      if (renderer2.capabilities.maxVertexTextures === 0) {
        return "No support for vertex shader textures.";
      }
      for (let i = 0; i < this.variables.length; i++) {
        const variable = this.variables[i];
        variable.renderTargets[0] = this.createRenderTarget(sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter);
        variable.renderTargets[1] = this.createRenderTarget(sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter);
        this.renderTexture(variable.initialValueTexture, variable.renderTargets[0]);
        this.renderTexture(variable.initialValueTexture, variable.renderTargets[1]);
        const material = variable.material;
        const uniforms = material.uniforms;
        if (variable.dependencies !== null) {
          for (let d = 0; d < variable.dependencies.length; d++) {
            const depVar = variable.dependencies[d];
            if (depVar.name !== variable.name) {
              let found = false;
              for (let j = 0; j < this.variables.length; j++) {
                if (depVar.name === this.variables[j].name) {
                  found = true;
                  break;
                }
              }
              if (!found) {
                return "Variable dependency not found. Variable=" + variable.name + ", dependency=" + depVar.name;
              }
            }
            uniforms[depVar.name] = { value: null };
            material.fragmentShader = "\nuniform sampler2D " + depVar.name + ";\n" + material.fragmentShader;
          }
        }
      }
      this.currentTextureIndex = 0;
      return null;
    };
    this.compute = function() {
      const currentTextureIndex = this.currentTextureIndex;
      const nextTextureIndex = this.currentTextureIndex === 0 ? 1 : 0;
      for (let i = 0, il = this.variables.length; i < il; i++) {
        const variable = this.variables[i];
        if (variable.dependencies !== null) {
          const uniforms = variable.material.uniforms;
          for (let d = 0, dl = variable.dependencies.length; d < dl; d++) {
            const depVar = variable.dependencies[d];
            uniforms[depVar.name].value = depVar.renderTargets[currentTextureIndex].texture;
          }
        }
        this.doRenderTarget(variable.material, variable.renderTargets[nextTextureIndex]);
      }
      this.currentTextureIndex = nextTextureIndex;
    };
    this.getCurrentRenderTarget = function(variable) {
      return variable.renderTargets[this.currentTextureIndex];
    };
    this.getAlternateRenderTarget = function(variable) {
      return variable.renderTargets[this.currentTextureIndex === 0 ? 1 : 0];
    };
    function addResolutionDefine(materialShader) {
      materialShader.defines.resolution = "vec2( " + sizeX.toFixed(1) + ", " + sizeY.toFixed(1) + " )";
    }
    this.addResolutionDefine = addResolutionDefine;
    function createShaderMaterial(computeFragmentShader, uniforms) {
      uniforms = uniforms || {};
      const material = new ShaderMaterial({
        uniforms,
        vertexShader: getPassThroughVertexShader(),
        fragmentShader: computeFragmentShader
      });
      addResolutionDefine(material);
      return material;
    }
    this.createShaderMaterial = createShaderMaterial;
    this.createRenderTarget = function(sizeXTexture, sizeYTexture, wrapS, wrapT, minFilter, magFilter) {
      sizeXTexture = sizeXTexture || sizeX;
      sizeYTexture = sizeYTexture || sizeY;
      wrapS = wrapS || ClampToEdgeWrapping;
      wrapT = wrapT || ClampToEdgeWrapping;
      minFilter = minFilter || NearestFilter;
      magFilter = magFilter || NearestFilter;
      const renderTarget = new WebGLRenderTarget(sizeXTexture, sizeYTexture, {
        wrapS,
        wrapT,
        minFilter,
        magFilter,
        format: RGBAFormat,
        type: dataType,
        depthBuffer: false
      });
      return renderTarget;
    };
    this.createTexture = function() {
      const data = new Float32Array(sizeX * sizeY * 4);
      const texture = new DataTexture(data, sizeX, sizeY, RGBAFormat, FloatType);
      texture.needsUpdate = true;
      return texture;
    };
    this.renderTexture = function(input, output) {
      passThruUniforms.passThruTexture.value = input;
      this.doRenderTarget(passThruShader, output);
      passThruUniforms.passThruTexture.value = null;
    };
    this.doRenderTarget = function(material, output) {
      const currentRenderTarget = renderer2.getRenderTarget();
      mesh.material = material;
      renderer2.setRenderTarget(output);
      renderer2.render(scene2, camera2);
      mesh.material = passThruShader;
      renderer2.setRenderTarget(currentRenderTarget);
    };
    function getPassThroughVertexShader() {
      return "void main()	{\n\n	gl_Position = vec4( position, 1.0 );\n\n}\n";
    }
    function getPassThroughFragmentShader() {
      return "uniform sampler2D passThruTexture;\n\nvoid main() {\n\n	vec2 uv = gl_FragCoord.xy / resolution.xy;\n\n	gl_FragColor = texture2D( passThruTexture, uv );\n\n}\n";
    }
  }
}
const _face = new Triangle();
const _color = new Vector3();
class MeshSurfaceSampler {
  constructor(mesh) {
    let geometry = mesh.geometry;
    if (!geometry.isBufferGeometry || geometry.attributes.position.itemSize !== 3) {
      throw new Error("THREE.MeshSurfaceSampler: Requires BufferGeometry triangle mesh.");
    }
    if (geometry.index) {
      console.warn("THREE.MeshSurfaceSampler: Converting geometry to non-indexed BufferGeometry.");
      geometry = geometry.toNonIndexed();
    }
    this.geometry = geometry;
    this.randomFunction = Math.random;
    this.positionAttribute = this.geometry.getAttribute("position");
    this.colorAttribute = this.geometry.getAttribute("color");
    this.weightAttribute = null;
    this.distribution = null;
  }
  setWeightAttribute(name) {
    this.weightAttribute = name ? this.geometry.getAttribute(name) : null;
    return this;
  }
  build() {
    const positionAttribute = this.positionAttribute;
    const weightAttribute = this.weightAttribute;
    const faceWeights = new Float32Array(positionAttribute.count / 3);
    for (let i = 0; i < positionAttribute.count; i += 3) {
      let faceWeight = 1;
      if (weightAttribute) {
        faceWeight = weightAttribute.getX(i) + weightAttribute.getX(i + 1) + weightAttribute.getX(i + 2);
      }
      _face.a.fromBufferAttribute(positionAttribute, i);
      _face.b.fromBufferAttribute(positionAttribute, i + 1);
      _face.c.fromBufferAttribute(positionAttribute, i + 2);
      faceWeight *= _face.getArea();
      faceWeights[i / 3] = faceWeight;
    }
    this.distribution = new Float32Array(positionAttribute.count / 3);
    let cumulativeTotal = 0;
    for (let i = 0; i < faceWeights.length; i++) {
      cumulativeTotal += faceWeights[i];
      this.distribution[i] = cumulativeTotal;
    }
    return this;
  }
  setRandomGenerator(randomFunction) {
    this.randomFunction = randomFunction;
    return this;
  }
  sample(targetPosition, targetNormal, targetColor) {
    const cumulativeTotal = this.distribution[this.distribution.length - 1];
    const faceIndex = this.binarySearch(this.randomFunction() * cumulativeTotal);
    return this.sampleFace(faceIndex, targetPosition, targetNormal, targetColor);
  }
  binarySearch(x) {
    const dist = this.distribution;
    let start = 0;
    let end = dist.length - 1;
    let index = -1;
    while (start <= end) {
      const mid = Math.ceil((start + end) / 2);
      if (mid === 0 || dist[mid - 1] <= x && dist[mid] > x) {
        index = mid;
        break;
      } else if (x < dist[mid]) {
        end = mid - 1;
      } else {
        start = mid + 1;
      }
    }
    return index;
  }
  sampleFace(faceIndex, targetPosition, targetNormal, targetColor) {
    let u = this.randomFunction();
    let v = this.randomFunction();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    _face.a.fromBufferAttribute(this.positionAttribute, faceIndex * 3);
    _face.b.fromBufferAttribute(this.positionAttribute, faceIndex * 3 + 1);
    _face.c.fromBufferAttribute(this.positionAttribute, faceIndex * 3 + 2);
    targetPosition.set(0, 0, 0).addScaledVector(_face.a, u).addScaledVector(_face.b, v).addScaledVector(_face.c, 1 - (u + v));
    if (targetNormal !== void 0) {
      _face.getNormal(targetNormal);
    }
    if (targetColor !== void 0 && this.colorAttribute !== void 0) {
      _face.a.fromBufferAttribute(this.colorAttribute, faceIndex * 3);
      _face.b.fromBufferAttribute(this.colorAttribute, faceIndex * 3 + 1);
      _face.c.fromBufferAttribute(this.colorAttribute, faceIndex * 3 + 2);
      _color.set(0, 0, 0).addScaledVector(_face.a, u).addScaledVector(_face.b, v).addScaledVector(_face.c, 1 - (u + v));
      targetColor.r = _color.x;
      targetColor.g = _color.y;
      targetColor.b = _color.z;
    }
    return this;
  }
}
const getRandomSurfacePointsBuffer = (geometry, amount2) => {
  const sampler = new MeshSurfaceSampler(new Mesh(geometry)).setWeightAttribute(null).build();
  const exactAmount = amount2 * 4;
  const positions = new Float32Array(exactAmount);
  const point = new Vector3();
  for (let i = 0; i < exactAmount; i += 4) {
    sampler.sample(point);
    positions[i + 0] = point.x;
    positions[i + 1] = point.y;
    positions[i + 2] = point.z;
    positions[i + 3] = 1;
  }
  return positions;
};
const spherePointsAmount = 128 ** 2;
const sphereSurface = new SphereBufferGeometry(1, 36, 18);
const spherePositions = getRandomSurfacePointsBuffer(sphereSurface, spherePointsAmount);
var compute_aizawa_default = "uniform float vel;\nuniform float roughness;\n\nuniform float aa;\nuniform float ab;\nuniform float ac;\nuniform float ad;\nuniform float ae;\nuniform float af;\n\nuniform sampler2D positionTexture;\n\nfloat random (vec2 st) {\n  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);\n}\n\nvec3 rough3D (vec3 point) {\n  float u = random(point.xy);\n  float v = random(point.yz);\n  float theta = u * 6.28318530718;\n  float phi = acos(2.0 * v - 1.0);\n\n  float sinTheta = sin(theta);\n  float cosTheta = cos(theta);\n  float sinPhi = sin(phi);\n  float cosPhi = cos(phi);\n\n  float r = sqrt(random(point.zx));\n  float x = r * sinPhi * cosTheta;\n  float y = r * sinPhi * sinTheta;\n  float z = r * cosPhi;\n\n  return vec3(x, y, z);\n}\n\nvoid main() {\n  vec2 reference = gl_FragCoord.xy / resolution.xy;\n  vec4 prev = texture(positionTexture, reference);\n  float x = prev.x;\n  float y = prev.y;\n  float z = prev.z;\n  float v = vel / 100.0;\n\n  vec3 next = vec3(\n    x + v * ((z - ab) * x - ad * y),\n    y + v * (ad * x + (z - ab) * y),\n    z + v * (ac + aa * z - z * z * z / 3.0 - (x * x + y * y) * (1.0 + ae * z) + af * z * x * x * x)\n  );\n  next += rough3D(next) * roughness * 0.333;\n\n  gl_FragColor = vec4(next, 1.0);\n}";
var compute_thomas_default = "uniform float vel;\nuniform float roughness;\n\nuniform float tb;\n\nuniform sampler2D positionTexture;\n\nfloat random (vec2 st) {\n  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);\n}\n\nvec3 rough3D (vec3 point) {\n  float u = random(point.xy);\n  float v = random(point.yz);\n  float theta = u * 6.28318530718;\n  float phi = acos(2.0 * v - 1.0);\n\n  float sinTheta = sin(theta);\n  float cosTheta = cos(theta);\n  float sinPhi = sin(phi);\n  float cosPhi = cos(phi);\n\n  float r = sqrt(random(point.zx));\n  float x = r * sinPhi * cosTheta;\n  float y = r * sinPhi * sinTheta;\n  float z = r * cosPhi;\n\n  return vec3(x, y, z);\n}\n\nvoid main() {\n  vec2 reference = gl_FragCoord.xy / resolution.xy;\n  vec4 prev = texture(positionTexture, reference);\n\n  float v = vel / 50.0;\n\n  vec3 next = vec3(\n    prev.x + v * (sin(prev.y) - tb * prev.x),\n    prev.y + v * (sin(prev.z) - tb * prev.y),\n    prev.z + v * (sin(prev.x) - tb * prev.z)\n  );\n  next += rough3D(next) * roughness * 0.333;\n\n  gl_FragColor = vec4(next, 1.0);\n}";
const shader = {
  aizawa: compute_aizawa_default,
  thomas: compute_thomas_default
};
const amount$7 = spherePointsAmount;
const side$7 = Math.sqrt(amount$7);
const p = spherePositions;
const initialPositions = new Float32Array(amount$7 * 4);
for (let i = 0; i < amount$7; i++) {
  initialPositions[i * 4 + 0] = p[i * 3 + 0] + (Math.random() * 2 - 1) * 0.333;
  initialPositions[i * 4 + 1] = p[i * 3 + 1] + (Math.random() * 2 - 1) * 0.333;
  initialPositions[i * 4 + 2] = p[i * 3 + 2] + (Math.random() * 2 - 1) * 0.333;
  initialPositions[i * 4 + 3] = 1;
}
const initiateAttractorComputation = (name, vel, roughness) => {
  const attractorTexture = gpuComputer.createTexture();
  attractorTexture.image.data.set(initialPositions);
  const attractorMaterial = gpuComputer.createShaderMaterial(
    shader[name],
    {
      positionTexture: { value: attractorTexture },
      vel: { value: vel },
      roughness: { value: roughness },
      tb: { value: 0.21 },
      aa: { value: 0.5 },
      ab: { value: 0 },
      ac: { value: 1.3 },
      ad: { value: 0 },
      ae: { value: 0 },
      af: { value: 0 }
    }
  );
  const attractorTarget = Array(2).fill(null).map(() => gpuComputer.createRenderTarget(side$7, side$7, RepeatWrapping, RepeatWrapping, NearestFilter, NearestFilter));
  let i = 1;
  const computeAttractor = () => {
    i ^= 1;
    gpuComputer.doRenderTarget(attractorMaterial, attractorTarget[i]);
    attractorMaterial.uniforms.positionTexture.value = attractorTarget[i].texture;
    return attractorTarget[i].texture;
  };
  return [attractorMaterial, computeAttractor];
};
var compute_noise_default$1 = "uniform float seed;\nuniform float time;\nuniform float attractorScale;\nuniform float noiseScale;\nuniform float platonicness;\n\nuniform float isTetra;\nuniform float isOcta;\nuniform float isCube;\nuniform float isDodeca;\nuniform float isIcosa;\n\nuniform sampler2D attractorTexture;\n\nvec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}\nvec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}\n\nfloat snoise3D(vec3 v){ \n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min( g.xyz, l.zxy );\n  vec3 i2 = max( g.xyz, l.zxy );\n\n  \n  vec3 x1 = x0 - i1 + 1.0 * C.xxx;\n  vec3 x2 = x0 - i2 + 2.0 * C.xxx;\n  vec3 x3 = x0 - 1. + 3.0 * C.xxx;\n\n  i = mod(i, 289.0 ); \n  vec4 p = permute( permute( permute( \n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) \n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n  float n_ = 1.0/7.0; \n  vec3  ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  \n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    \n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1.xy,h.z);\n  vec3 p3 = vec3(a1.zw,h.w);\n\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), \n                                dot(p2,x2), dot(p3,x3) ) );\n}\n\nvec3 snoiseVec3( vec3 x ){\n  float s  = snoise3D(vec3( x ));\n  float s1 = snoise3D(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));\n  float s2 = snoise3D(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));\n  vec3 c = vec3( s , s1 , s2 );\n  return c;\n}\n\nvec3 cnoise( vec3 p ){\n  const float e = .1;\n  vec3 dx = vec3( e   , 0.0 , 0.0 );\n  vec3 dy = vec3( 0.0 , e   , 0.0 );\n  vec3 dz = vec3( 0.0 , 0.0 , e   );\n\n  vec3 p_x0 = snoiseVec3( p - dx );\n  vec3 p_x1 = snoiseVec3( p + dx );\n  vec3 p_y0 = snoiseVec3( p - dy );\n  vec3 p_y1 = snoiseVec3( p + dy );\n  vec3 p_z0 = snoiseVec3( p - dz );\n  vec3 p_z1 = snoiseVec3( p + dz );\n\n  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;\n  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;\n  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;\n\n  const float divisor = 1.0 / ( 2.0 * e );\n  return normalize( vec3( x , y , z ) * divisor );\n}\n#define PHI 1.61803398875\n\nconst int tetr_factor = 8;\nconst int oct_factor = 4;\nconst int cube_factor = 6;\nconst int dodec_factor = 4;\nconst int icos_factor = 4;\n\nfloat tetr(vec3 pos) {\n  pos.xz = abs(pos.xz);\n  vec3 n = normalize(vec3(0.0, sqrt(0.5), 1.0));\n  float d = max(dot(pos, n.xyz), dot(pos, n.zyx * vec3(1.0, -1.0, 1.0)));\n\n  for (int i = 0; i < tetr_factor; i++) d = sqrt(d);\n    d -= 2.0;\n  for (int i = 0; i < tetr_factor; i++) d = d * d;\n\n  return d;\n}\n\nfloat oct(vec3 pos) {\n  pos = abs(pos);\n  vec3 n = normalize(vec3(1.0));\n  float d = dot(pos, n);\n\n  for (int i = 0; i < oct_factor; i++) d = sqrt(d);\n    d -= 2.0;\n  for (int i = 0; i < oct_factor; i++) d = d * d;\n\n  return d;\n}\n\nfloat cube(vec3 pos) {\n  pos = abs(pos);\n  vec3 n = vec3(1.0, 0.0, 0.0);\n  float d =    dot(pos, n.xyz);\n    d = max(d, dot(pos, n.zxy));\n    d = max(d, dot(pos, n.yzx));\n  \n  for (int i = 0; i < cube_factor; i++) d = sqrt(d);\n    d -= 2.0;\n  for (int i = 0; i < cube_factor; i++) d = d * d;\n\n  return d * isCube + 1.0 - isCube;\n}\n\nfloat dodec(vec3 pos){\n  pos = abs(pos);\n	vec3 n = normalize(vec3(PHI, 1.0, 0.0));\n	float d =    dot(pos, n.xyz);\n    d = max(d, dot(pos, n.yzx));\n    d = max(d, dot(pos, n.zxy));\n\n  for (int i = 0; i < dodec_factor; i++) d = sqrt(d);\n    d -= 2.0;\n  for (int i = 0; i < dodec_factor; i++) d = d * d;\n\n  return d * isDodeca + 1.0 - isDodeca;\n}\n\nfloat icos(vec3 pos) {\n  pos = abs(pos);\n  vec3 n = normalize(vec3(0, 1.0 / PHI, PHI));\n  float d =    dot(pos, normalize(vec3(1)));\n    d = max(d, dot(pos, n.xyz));\n    d = max(d, dot(pos, n.yzx));\n    d = max(d, dot(pos, n.zxy));\n\n  for (int i = 0; i < icos_factor; i++) d = sqrt(d);\n    d -= 2.0;\n  for (int i = 0; i < icos_factor; i++) d = d * d;\n\n  return d * isIcosa + 1.0 - isIcosa;\n}\n\nvec3 platonic(vec3 pos, float r) {\n  vec3 tpos = pos * tetr(pos) * 0.618;\n  vec3 opos = pos * oct(pos)  * 0.8;\n  vec3 cpos = pos * cube(pos) * 0.9;\n  vec3 dpos = pos * dodec(pos);\n  vec3 ipos = pos * icos(pos);\n\n  pos = mix(pos, tpos, isTetra);\n  pos = mix(pos, opos, isOcta);\n  pos = mix(pos, cpos, isCube);\n  pos = mix(pos, dpos, isDodeca);\n  pos = mix(pos, ipos, isIcosa);\n\n  return pos;\n}\n\nvoid main() {\n\n  vec2 reference = gl_FragCoord.xy / resolution.xy;\n\n  float t = time * 0.2 + seed;\n\n  vec3 pos = texture(attractorTexture, reference).xyz;\n  vec3 cpos = cnoise(pos * noiseScale + t);\n  pos = mix(pos, cpos, 0.9);\n\n  vec3 ppos = platonic(pos, 2.0);\n\n  pos = mix(pos, ppos, platonicness) * attractorScale;\n\n  gl_FragColor = vec4(pos, 1.0);\n}";
const amount$6 = spherePointsAmount;
const side$6 = Math.sqrt(amount$6);
const initiateNoiseComputation$1 = (seed, attractorScale, noiseScale, platonicness, platonictype) => {
  const noiseMaterial = gpuComputer.createShaderMaterial(
    compute_noise_default$1,
    {
      seed: { value: seed },
      time: { value: 0 },
      attractorScale: { value: attractorScale },
      noiseScale: { value: noiseScale },
      platonicness: { value: platonicness },
      isTetra: { value: platonictype === "tetra" ? 1 : 0 },
      isOcta: { value: platonictype === "octa" ? 1 : 0 },
      isCube: { value: platonictype === "cube" ? 1 : 0 },
      isDodeca: { value: platonictype === "dodeca" ? 1 : 0 },
      isIcosa: { value: platonictype === "icosa" ? 1 : 0 },
      attractorTexture: { value: null }
    }
  );
  const noiseTarget = gpuComputer.createRenderTarget(
    side$6,
    side$6,
    RepeatWrapping,
    RepeatWrapping,
    NearestFilter,
    NearestFilter
  );
  const computeNoise = (t, attractorTexture) => {
    noiseMaterial.uniforms.time.value = t;
    noiseMaterial.uniforms.attractorTexture.value = attractorTexture;
    gpuComputer.doRenderTarget(noiseMaterial, noiseTarget);
    return noiseTarget.texture;
  };
  return [noiseMaterial, computeNoise];
};
var compute_velocity_default$1 = "uniform sampler2D positionTexture;\nuniform sampler2D responsedPositionTexture;\nuniform sampler2D velocityTexture;\nuniform vec4 pointer;\nuniform vec3 prevPointer;\nuniform float time;\n\nconst float PI  = 3.14159265359;\nconst float PHI = 1.61803398875;\nconst float LEN = PHI;\n\nvoid main() {\n\n  vec2 uv = gl_FragCoord.xy / resolution.xy;\n  vec3 initialPosition = texture(positionTexture, uv).xyz;\n  vec3 currentPosition = texture(responsedPositionTexture, uv).xyz;\n  vec3 velocity = texture(velocityTexture, uv).xyz;\n  vec3 ptr  = pointer.xyx     * vec3(cos(time), 1.0, sin(time));\n  vec3 pptr = prevPointer.xyx * vec3(cos(time), 1.0, sin(time));\n\n    vec3 pdiff = ptr - pptr;\n    pdiff = length(pdiff) > 0.0 ? normalize(pdiff) : vec3(0.0);\n    vec3 diff = currentPosition - ptr;\n    float dlen = length(diff);\n    float force = dlen < LEN\n      ? 1.0 - pow(1.0 - pow(1.0 - dlen / LEN, 3.0), 0.333) \n      : 0.0;\n    force *= pointer.w * 0.5;\n\n    \n    velocity += mix(normalize(diff), pdiff, 0.333) * force;\n\n    \n    velocity *= 0.95;\n\n    \n    diff = initialPosition - currentPosition;\n    velocity += diff * 0.0001;\n\n  gl_FragColor = vec4(velocity, 1.0);\n}";
var compute_response_default$1 = "uniform sampler2D positionTexture;\nuniform sampler2D responsedPositionTexture;\nuniform sampler2D velocityTexture;\n\nvoid main() {\n\n  vec2 uv = gl_FragCoord.xy / resolution.xy;\n  vec4 position = texture(positionTexture, uv);\n  vec4 resPosition = texture(responsedPositionTexture, uv);\n  vec4 velocity = texture(velocityTexture, uv);\n\n  resPosition.x += velocity.x;\n  resPosition.y += velocity.y;\n  resPosition.z += velocity.z;\n\n  gl_FragColor = mix(position, resPosition, 0.618);\n}";
const amount$5 = spherePointsAmount;
const side$5 = Math.sqrt(amount$5);
const initiateResponseComputation$1 = (positionTexture) => {
  const velocityTexture = gpuComputer.createTexture();
  const velocityMaterial = gpuComputer.createShaderMaterial(
    compute_velocity_default$1,
    {
      positionTexture: { value: positionTexture },
      responsedPositionTexture: { value: positionTexture },
      velocityTexture: { value: velocityTexture },
      pointer: { value: pointer },
      prevPointer: { value: prevPointer },
      time: { value: 0 }
    }
  );
  const responsedPositionMaterial = gpuComputer.createShaderMaterial(
    compute_response_default$1,
    {
      positionTexture: { value: positionTexture },
      responsedPositionTexture: { value: positionTexture },
      velocityTexture: { value: velocityTexture }
    }
  );
  const responsedPositionTarget = Array(2).fill(null).map(() => gpuComputer.createRenderTarget(side$5, side$5, RepeatWrapping, RepeatWrapping, NearestFilter, NearestFilter));
  const velocityTarget = Array(2).fill(null).map(() => gpuComputer.createRenderTarget(side$5, side$5, RepeatWrapping, RepeatWrapping, NearestFilter, NearestFilter));
  let i = 1;
  return (t, positionTexture2) => {
    i ^= 1;
    velocityMaterial.uniforms.positionTexture.value = positionTexture2;
    responsedPositionMaterial.uniforms.positionTexture.value = positionTexture2;
    velocityMaterial.uniforms.time.value = t;
    gpuComputer.doRenderTarget(velocityMaterial, velocityTarget[i]);
    velocityMaterial.uniforms.velocityTexture.value = velocityTarget[i].texture;
    responsedPositionMaterial.uniforms.velocityTexture.value = velocityTarget[i].texture;
    gpuComputer.doRenderTarget(responsedPositionMaterial, responsedPositionTarget[i]);
    velocityMaterial.uniforms.responsedPositionTexture.value = responsedPositionTarget[i].texture;
    responsedPositionMaterial.uniforms.responsedPositionTexture.value = responsedPositionTarget[i].texture;
    return responsedPositionTarget[i].texture;
  };
};
var vertex_default$1 = "attribute vec2 reference;\nuniform float dotSize;\nuniform sampler2D positionTexture;\n\nvoid main() {\n  gl_PointSize = dotSize;\n\n  vec4 pos = texture(positionTexture, reference);\n\n  gl_Position = projectionMatrix * modelViewMatrix * pos;\n}";
var fragment_default$1 = "uniform float color;\n\nvoid main() {\n  gl_FragColor = vec4(vec3(0.0), color);\n}";
const amount$4 = spherePointsAmount;
const side$4 = Math.sqrt(spherePointsAmount);
const initAttractor = (dotSize = 1 * renderer.getPixelRatio(), color = 0.5, attractorScale = 1, noiseScale = 0.2, name = "aizawa", roughness = 0.2, vel = 1, platonicness = 0, platonictype = "tetra") => {
  const seed = Math.random() * 123;
  const [attractorMaterial, computeAttractor] = initiateAttractorComputation(name, vel, roughness);
  const initialAttractorTexture = computeAttractor();
  const [noiseMaterial, computeNoise] = initiateNoiseComputation$1(
    seed,
    attractorScale,
    noiseScale,
    platonicness,
    platonictype
  );
  const initialNoiseTexture = computeNoise(0, initialAttractorTexture);
  const computeResponse = initiateResponseComputation$1(initialNoiseTexture);
  const material = new ShaderMaterial({
    uniforms: {
      seed: { value: seed },
      time: { value: 0 },
      dotSize: { value: dotSize },
      color: { value: color },
      positionTexture: { value: null }
    },
    vertexShader: vertex_default$1,
    fragmentShader: fragment_default$1,
    transparent: true,
    depthWrite: false
  });
  const geometry = new BufferGeometry();
  const position = new Float32Array(amount$4 * 4);
  const reference = new Float32Array(amount$4 * 2);
  for (let i = 0; i < amount$4; i++) {
    reference[i * 2 + 0] = i % side$4 / side$4;
    reference[i * 2 + 1] = (i / side$4 | 0) / side$4;
  }
  geometry.setAttribute("position", new BufferAttribute(position, 4));
  geometry.setAttribute("reference", new BufferAttribute(reference, 2));
  const attractor = new Points(geometry, material);
  scene.add(attractor);
  return {
    update: (t) => {
      const attractorPositionTexture = computeAttractor();
      const noisePositionTexture = computeNoise(t, attractorPositionTexture);
      const responsedPositionTexture = computeResponse(t / 2, noisePositionTexture);
      material.uniforms.positionTexture.value = responsedPositionTexture;
      attractor.rotation.y = t / 2;
    },
    attractor: {
      dotSize: material.uniforms.dotSize,
      color: material.uniforms.color,
      roughness: attractorMaterial.uniforms.roughness,
      vel: attractorMaterial.uniforms.vel,
      attractorScale: noiseMaterial.uniforms.attractorScale,
      noiseScale: noiseMaterial.uniforms.noiseScale,
      platonicness: noiseMaterial.uniforms.platonicness,
      platonictype: {
        isTetra: noiseMaterial.uniforms.isTetra,
        isOcta: noiseMaterial.uniforms.isOcta,
        isCube: noiseMaterial.uniforms.isCube,
        isDodeca: noiseMaterial.uniforms.isDodeca,
        isIcosa: noiseMaterial.uniforms.isIcosa
      }
    }
  };
};
var compute_noise_default = "uniform sampler2D positionTexture;\n\nuniform float time;\nuniform float seed;\nuniform float sphereScale;\nuniform float noiseScale;\nuniform float roughness;\nuniform float platonicness;\n\nuniform float isTetra;\nuniform float isOcta;\nuniform float isCube;\nuniform float isDodeca;\nuniform float isIcosa;\n\nvec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}\nvec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}\n\nfloat snoise3D(vec3 v){ \n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min( g.xyz, l.zxy );\n  vec3 i2 = max( g.xyz, l.zxy );\n\n  \n  vec3 x1 = x0 - i1 + 1.0 * C.xxx;\n  vec3 x2 = x0 - i2 + 2.0 * C.xxx;\n  vec3 x3 = x0 - 1. + 3.0 * C.xxx;\n\n  i = mod(i, 289.0 ); \n  vec4 p = permute( permute( permute( \n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) \n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n  float n_ = 1.0/7.0; \n  vec3  ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  \n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    \n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1.xy,h.z);\n  vec3 p3 = vec3(a1.zw,h.w);\n\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), \n                                dot(p2,x2), dot(p3,x3) ) );\n}\n\nvec3 snoiseVec3( vec3 x ){\n  float s  = snoise3D(vec3( x ));\n  float s1 = snoise3D(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));\n  float s2 = snoise3D(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));\n  vec3 c = vec3( s , s1 , s2 );\n  return c;\n}\n\nvec3 cnoise( vec3 p ){\n  const float e = .1;\n  vec3 dx = vec3( e   , 0.0 , 0.0 );\n  vec3 dy = vec3( 0.0 , e   , 0.0 );\n  vec3 dz = vec3( 0.0 , 0.0 , e   );\n\n  vec3 p_x0 = snoiseVec3( p - dx );\n  vec3 p_x1 = snoiseVec3( p + dx );\n  vec3 p_y0 = snoiseVec3( p - dy );\n  vec3 p_y1 = snoiseVec3( p + dy );\n  vec3 p_z0 = snoiseVec3( p - dz );\n  vec3 p_z1 = snoiseVec3( p + dz );\n\n  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;\n  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;\n  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;\n\n  const float divisor = 1.0 / ( 2.0 * e );\n  return normalize( vec3( x , y , z ) * divisor );\n}\nfloat random (vec2 st) {\n  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);\n}\n\nvec3 rough3D (vec3 point) {\n  float u = random(point.xy);\n  float v = random(point.yz);\n  float theta = u * 6.28318530718;\n  float phi = acos(2.0 * v - 1.0);\n\n  float sinTheta = sin(theta);\n  float cosTheta = cos(theta);\n  float sinPhi = sin(phi);\n  float cosPhi = cos(phi);\n\n  float r = sqrt(random(point.zx));\n  float x = r * sinPhi * cosTheta;\n  float y = r * sinPhi * sinTheta;\n  float z = r * cosPhi;\n\n  return vec3(x, y, z);\n}\n#define PHI 1.61803398875\n\nconst int tetr_factor = 8;\nconst int oct_factor = 4;\nconst int cube_factor = 6;\nconst int dodec_factor = 4;\nconst int icos_factor = 4;\n\nfloat tetr(vec3 pos) {\n  pos.xz = abs(pos.xz);\n  vec3 n = normalize(vec3(0.0, sqrt(0.5), 1.0));\n  float d = max(dot(pos, n.xyz), dot(pos, n.zyx * vec3(1.0, -1.0, 1.0)));\n\n  for (int i = 0; i < tetr_factor; i++) d = sqrt(d);\n    d -= 2.0;\n  for (int i = 0; i < tetr_factor; i++) d = d * d;\n\n  return d;\n}\n\nfloat oct(vec3 pos) {\n  pos = abs(pos);\n  vec3 n = normalize(vec3(1.0));\n  float d = dot(pos, n);\n\n  for (int i = 0; i < oct_factor; i++) d = sqrt(d);\n    d -= 2.0;\n  for (int i = 0; i < oct_factor; i++) d = d * d;\n\n  return d;\n}\n\nfloat cube(vec3 pos) {\n  pos = abs(pos);\n  vec3 n = vec3(1.0, 0.0, 0.0);\n  float d =    dot(pos, n.xyz);\n    d = max(d, dot(pos, n.zxy));\n    d = max(d, dot(pos, n.yzx));\n  \n  for (int i = 0; i < cube_factor; i++) d = sqrt(d);\n    d -= 2.0;\n  for (int i = 0; i < cube_factor; i++) d = d * d;\n\n  return d * isCube + 1.0 - isCube;\n}\n\nfloat dodec(vec3 pos){\n  pos = abs(pos);\n	vec3 n = normalize(vec3(PHI, 1.0, 0.0));\n	float d =    dot(pos, n.xyz);\n    d = max(d, dot(pos, n.yzx));\n    d = max(d, dot(pos, n.zxy));\n\n  for (int i = 0; i < dodec_factor; i++) d = sqrt(d);\n    d -= 2.0;\n  for (int i = 0; i < dodec_factor; i++) d = d * d;\n\n  return d * isDodeca + 1.0 - isDodeca;\n}\n\nfloat icos(vec3 pos) {\n  pos = abs(pos);\n  vec3 n = normalize(vec3(0, 1.0 / PHI, PHI));\n  float d =    dot(pos, normalize(vec3(1)));\n    d = max(d, dot(pos, n.xyz));\n    d = max(d, dot(pos, n.yzx));\n    d = max(d, dot(pos, n.zxy));\n\n  for (int i = 0; i < icos_factor; i++) d = sqrt(d);\n    d -= 2.0;\n  for (int i = 0; i < icos_factor; i++) d = d * d;\n\n  return d * isIcosa + 1.0 - isIcosa;\n}\n\nvec3 platonic(vec3 pos, float r) {\n  vec3 tpos = pos * tetr(pos) * 0.618;\n  vec3 opos = pos * oct(pos)  * 0.8;\n  vec3 cpos = pos * cube(pos) * 0.9;\n  vec3 dpos = pos * dodec(pos);\n  vec3 ipos = pos * icos(pos);\n\n  pos = mix(pos, tpos, isTetra);\n  pos = mix(pos, opos, isOcta);\n  pos = mix(pos, cpos, isCube);\n  pos = mix(pos, dpos, isDodeca);\n  pos = mix(pos, ipos, isIcosa);\n\n  return pos;\n}\n\nvoid main() {\n\n  vec2 uv = gl_FragCoord.xy / resolution.xy;\n  vec3 position = texture(positionTexture, uv).xyz;\n\n  float t = time * 0.15 + seed * 10.0;\n\n  vec3 rpos = rough3D(position);\n  float rlen = length(rpos);\n  rpos *= rlen * roughness;\n\n  vec3 cpos = cnoise((position + rpos) * noiseScale + t);\n\n  vec3 ppos = platonic(cpos, 2.0);\n\n  position = mix(cpos, ppos, platonicness) * sphereScale;\n\n  \n  \n\n  gl_FragColor = vec4(position, 1.0);\n\n}";
const amount$3 = spherePointsAmount;
const side$3 = Math.sqrt(amount$3);
const initiateNoiseComputation = (seed, sphereScale, noiseScale, roughness, platonicness, platonictype) => {
  const positionTexture = gpuComputer.createTexture();
  positionTexture.image.data.set(spherePositions);
  const positionMaterial = gpuComputer.createShaderMaterial(
    compute_noise_default,
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
      isIcosa: { value: platonictype === "icosa" ? 1 : 0 }
    }
  );
  const positionTarget = gpuComputer.createRenderTarget(
    side$3,
    side$3,
    RepeatWrapping,
    RepeatWrapping,
    NearestFilter,
    NearestFilter
  );
  const computeNoise = (t) => {
    positionMaterial.uniforms.time.value = t;
    gpuComputer.doRenderTarget(positionMaterial, positionTarget);
    return positionTarget.texture;
  };
  return [positionMaterial, computeNoise];
};
var compute_velocity_default = "uniform sampler2D positionTexture;\nuniform sampler2D responsedPositionTexture;\nuniform sampler2D velocityTexture;\nuniform vec4 pointer;\nuniform vec3 prevPointer;\nuniform float time;\n\nconst float PI  = 3.14159265359;\nconst float PHI = 1.61803398875;\nconst float LEN = PHI;\n\nvoid main() {\n\n  vec2 uv = gl_FragCoord.xy / resolution.xy;\n  vec3 initialPosition = texture(positionTexture, uv).xyz;\n  vec3 currentPosition = texture(responsedPositionTexture, uv).xyz;\n  vec3 velocity = texture(velocityTexture, uv).xyz;\n  vec3 ptr  = pointer.xyx     * vec3(cos(time), 1.0, sin(time));\n  vec3 pptr = prevPointer.xyx * vec3(cos(time), 1.0, sin(time));\n\n    vec3 pdiff = ptr - pptr;\n    pdiff = length(pdiff) > 0.0 ? normalize(pdiff) : vec3(0.0);\n    vec3 diff = currentPosition - ptr;\n    float dlen = length(diff);\n    float force = dlen < LEN\n      ? 1.0 - pow(1.0 - pow(1.0 - dlen / LEN, 3.0), 0.333) \n      : 0.0;\n    force *= pointer.w * 0.5;\n\n    \n    velocity += mix(normalize(diff), pdiff, 0.333) * force;\n\n    \n    velocity *= 0.95;\n\n    \n    diff = initialPosition - currentPosition;\n    velocity += diff * 0.0001;\n\n  gl_FragColor = vec4(velocity, 1.0);\n  \n}";
var compute_response_default = "uniform sampler2D positionTexture;\nuniform sampler2D responsedPositionTexture;\nuniform sampler2D velocityTexture;\n\nvoid main() {\n\n  vec2 uv = gl_FragCoord.xy / resolution.xy;\n  vec4 position = texture(positionTexture, uv);\n  vec4 resPosition = texture(responsedPositionTexture, uv);\n  vec4 velocity = texture(velocityTexture, uv);\n\n  resPosition.x += velocity.x;\n  resPosition.y += velocity.y;\n  resPosition.z += velocity.z;\n\n  gl_FragColor = mix(position, resPosition, 0.618);\n}";
const amount$2 = spherePointsAmount;
const side$2 = Math.sqrt(amount$2);
const initiateResponseComputation = (positionTexture) => {
  const velocityTexture = gpuComputer.createTexture();
  const velocityMaterial = gpuComputer.createShaderMaterial(
    compute_velocity_default,
    {
      positionTexture: { value: positionTexture },
      responsedPositionTexture: { value: positionTexture },
      velocityTexture: { value: velocityTexture },
      pointer: { value: pointer },
      prevPointer: { value: prevPointer },
      time: { value: 0 }
    }
  );
  const responsedPositionMaterial = gpuComputer.createShaderMaterial(
    compute_response_default,
    {
      positionTexture: { value: positionTexture },
      responsedPositionTexture: { value: positionTexture },
      velocityTexture: { value: velocityTexture }
    }
  );
  const responsedPositionTarget = Array(2).fill(null).map(() => gpuComputer.createRenderTarget(side$2, side$2, RepeatWrapping, RepeatWrapping, NearestFilter, NearestFilter));
  const velocityTarget = Array(2).fill(null).map(() => gpuComputer.createRenderTarget(side$2, side$2, RepeatWrapping, RepeatWrapping, NearestFilter, NearestFilter));
  let i = 1;
  return (t, positionTexture2) => {
    i ^= 1;
    velocityMaterial.uniforms.positionTexture.value = positionTexture2;
    responsedPositionMaterial.uniforms.positionTexture.value = positionTexture2;
    velocityMaterial.uniforms.time.value = t;
    gpuComputer.doRenderTarget(velocityMaterial, velocityTarget[i]);
    velocityMaterial.uniforms.velocityTexture.value = velocityTarget[i].texture;
    responsedPositionMaterial.uniforms.velocityTexture.value = velocityTarget[i].texture;
    gpuComputer.doRenderTarget(responsedPositionMaterial, responsedPositionTarget[i]);
    velocityMaterial.uniforms.responsedPositionTexture.value = responsedPositionTarget[i].texture;
    responsedPositionMaterial.uniforms.responsedPositionTexture.value = responsedPositionTarget[i].texture;
    return responsedPositionTarget[i].texture;
  };
};
var vertex_default = "attribute vec2 ref;\n\nuniform sampler2D positionTexture;\nuniform float dotSize;\n\nvoid main() {\n\n  vec4 pos = texture(positionTexture, ref);\n\n  vec4 mvPosition = modelViewMatrix * pos;\n  gl_Position = projectionMatrix * mvPosition;\n\n  \n\n  gl_PointSize = dotSize;\n}";
var fragment_default = "uniform float color;\n\nvoid main() {\n  gl_FragColor = vec4(vec3(0.0), color);\n}";
const sphereGeometry = new BufferGeometry();
sphereGeometry.setAttribute("position", new BufferAttribute(spherePositions, 4));
const amount$1 = spherePointsAmount;
const side$1 = Math.sqrt(amount$1);
const ref = new Float32Array(amount$1 * 2);
for (let i = 0; i < amount$1; i++) {
  ref[i * 2 + 0] = i % side$1 / side$1;
  ref[i * 2 + 1] = (i / side$1 | 0) / side$1;
}
sphereGeometry.setAttribute("ref", new BufferAttribute(ref, 2));
const initSphere = (dotSize = 1 * renderer.getPixelRatio(), color = 0.5, sphereScale = 1, noiseScale = 0.25, roughness = 0.2, platonicness = 0, platonictype = "tetra") => {
  const seed = Math.random() * 123;
  const material = new ShaderMaterial({
    uniforms: {
      positionTexture: { value: null },
      dotSize: { value: dotSize },
      color: { value: color }
    },
    vertexShader: vertex_default,
    fragmentShader: fragment_default,
    transparent: true,
    depthWrite: false
  });
  const sphere = new Points(sphereGeometry, material);
  scene.add(sphere);
  const [noiseMaterial, computePosition] = initiateNoiseComputation(
    seed,
    sphereScale,
    noiseScale,
    roughness,
    platonicness,
    platonictype
  );
  const initialPositionTexture = computePosition(0);
  const computeResponse = initiateResponseComputation(initialPositionTexture);
  material.uniforms.positionTexture.value = initialPositionTexture;
  return {
    update: (t) => {
      const positionTexture = computePosition(t);
      material.uniforms.positionTexture.value = computeResponse(t / 2, positionTexture);
      sphere.rotation.y = t / 2;
    },
    sphere: {
      dotSize: material.uniforms.dotSize,
      color: material.uniforms.color,
      sphereScale: noiseMaterial.uniforms.sphereScale,
      noiseScale: noiseMaterial.uniforms.noiseScale,
      roughness: noiseMaterial.uniforms.roughness,
      platonicness: noiseMaterial.uniforms.platonicness,
      platonictype: {
        isTetra: noiseMaterial.uniforms.isTetra,
        isOcta: noiseMaterial.uniforms.isOcta,
        isCube: noiseMaterial.uniforms.isCube,
        isDodeca: noiseMaterial.uniforms.isDodeca,
        isIcosa: noiseMaterial.uniforms.isIcosa
      }
    }
  };
};
const spheresUpdate = [];
const attractorsUpdate = [];
const spheres = [];
const attractors = [];
let state = {
  cleartrail: 0.3,
  attractors: [],
  spheres: []
};
const initiateState = (json) => {
  state = { ...state, ...json };
  for (const spheredata of state.spheres) {
    const { sphere, update } = initSphere(
      spheredata.dotSize,
      spheredata.color,
      spheredata.sphereScale,
      spheredata.noiseScale,
      spheredata.roughness,
      spheredata.platonicness,
      spheredata.platonictype
    );
    spheres.push(sphere);
    spheresUpdate.push(update);
  }
  for (const attractordata of state.attractors) {
    const { attractor, update } = initAttractor(
      attractordata.dotSize,
      attractordata.color,
      attractordata.attractorScale,
      attractordata.noiseScale,
      attractordata.name,
      attractordata.roughness,
      attractordata.vel,
      attractordata.platonicness,
      attractordata.platonictype
    );
    attractors.push(attractor);
    attractorsUpdate.push(update);
  }
  return { spheres, spheresUpdate, attractors, attractorsUpdate };
};
const initClearPlane = (opacity) => {
  renderer.autoClearColor = false;
  const clearPlane = new Mesh(
    new PlaneBufferGeometry(2, 2),
    new MeshBasicMaterial({
      color: 268435455,
      transparent: true,
      opacity
    })
  );
  const size = new Vector2();
  const scaleClearPlane = () => {
    renderer.getSize(size);
    clearPlane.scale.set(size.x / size.y / camera.zoom, 1 / camera.zoom, 1);
  };
  clearPlane.renderOrder = -1;
  const distance = camera.position.distanceTo(scene.position) * 2;
  clearPlane.position.z = -1 * distance;
  camera.add(clearPlane);
  return scaleClearPlane;
};
const initiatePointer = (canvas) => {
  const prevPointer2 = new Vector4(0, 0, 0, 0);
  const pointer2 = new Vector4(0, 0, 0, 0);
  canvas.addEventListener("pointermove", (e) => {
    prevPointer2.x = pointer2.x;
    prevPointer2.y = pointer2.y;
    pointer2.x = (e.offsetX / canvas.width * 2 - 1) * camera.right * (1 / camera.zoom);
    pointer2.y = (e.offsetY / canvas.height * -2 + 1) * (1 / camera.zoom);
    const [dx, dy] = [pointer2.x - prevPointer2.x, pointer2.y - prevPointer2.y];
    pointer2.w += Math.sqrt(dx ** 2 + dy ** 2);
  });
  return [pointer2, prevPointer2];
};
const scene = new Scene();
scene.background = new Color("#fff");
const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
camera.position.set(0, 0, 10);
camera.zoom = 0.25;
camera.updateProjectionMatrix();
scene.add(camera);
const renderer = new WebGLRenderer({ preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const amount = spherePointsAmount;
const side = Math.sqrt(amount);
const gpuComputer = new GPUComputationRenderer(side, side, renderer);
const [pointer, prevPointer] = initiatePointer(renderer.domElement);
const initParticles = (width, height, state2) => {
  const scaleClearPlane = initClearPlane(state2.cleartrail);
  const resize = (width2, height2) => {
    const aspect = width2 / height2;
    camera.left = -1 * aspect;
    camera.right = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(width2, height2);
    scaleClearPlane();
  };
  resize(width, height);
  const { spheres: spheres2, spheresUpdate: spheresUpdate2, attractors: attractors2, attractorsUpdate: attractorsUpdate2 } = initiateState(state2);
  let t = 0;
  const startParticles = () => {
    t += 0.01;
    pointer.w *= 0.9;
    spheresUpdate2.forEach((update) => update(t));
    attractorsUpdate2.forEach((update) => update(t));
    renderer.render(scene, camera);
    requestAnimationFrame(startParticles);
  };
  return {
    canvas: renderer.domElement,
    resize,
    spheres: spheres2,
    attractors: attractors2,
    startParticles
  };
};
export { initParticles };
