import * as THREE from './vendor/three.module.js';
const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
export function createEmitters(config,group){
  return config.map((c,index)=>{
    const count=c.maximum,positions=new Float32Array(count*3),sizes=new Float32Array(count),alphas=new Float32Array(count),angles=new Float32Array(count);
    const geo=new THREE.InstancedBufferGeometry();geo.instanceCount=count;
    geo.setAttribute('position',new THREE.Float32BufferAttribute([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3));
    geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,1],2));geo.setIndex([0,1,2,0,2,3]);
    geo.setAttribute('particleCenter',new THREE.InstancedBufferAttribute(positions,3));geo.setAttribute('particleSize',new THREE.InstancedBufferAttribute(sizes,1));geo.setAttribute('particleAlpha',new THREE.InstancedBufferAttribute(alphas,1));geo.setAttribute('particleAngle',new THREE.InstancedBufferAttribute(angles,1));
    const tex=new THREE.TextureLoader().load(`./assets/${c.texture}`);
    // Renderer source: stretched billboard, lengthScale=1, velocityScale=0.
    // Align the ember texture with projected inward velocity, including side views.
    const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{map:{value:tex},color:{value:new THREE.Color(...c.color)},ellipse:{value:new THREE.Vector2(c.scale[1],c.scale[0])},stretched:{value:index===1?1:0}},vertexShader:`attribute vec3 particleCenter;attribute float particleSize,particleAlpha,particleAngle;uniform float stretched;uniform vec2 ellipse;varying float alpha;varying vec2 texUV;void main(){alpha=particleAlpha;texUV=uv;vec4 mv=modelViewMatrix*vec4(particleCenter,1.);vec3 velocity=mat3(modelViewMatrix)*vec3(sin(particleAngle)*ellipse.x,-cos(particleAngle)*ellipse.y,0.);float angle=stretched*atan(-velocity.y,-velocity.x);float c=cos(angle),s=sin(angle);vec2 offset=mat2(c,s,-s,c)*position.xy;float scale=length(modelViewMatrix[0].xyz);mv.xy+=offset*particleSize*scale;gl_Position=projectionMatrix*mv;}`,fragmentShader:`uniform sampler2D map;uniform vec3 color;varying float alpha;varying vec2 texUV;void main(){vec4 tex=texture2D(map,texUV);if(alpha*tex.a<.01)discard;gl_FragColor=vec4(color*tex.rgb,alpha*tex.a);}`});
    const points=new THREE.Mesh(geo,mat);points.frustumCulled=false;group.add(points);
    return {c,index,points,positions,sizes,alphas,angles};
  });
}
export function updateEmitters(emitters,time,height,burst=0,opacity=1){
  for(const e of emitters){
    const {c,positions,sizes,alphas,angles}=e;
    const slotPeriod=c.maximum/c.rate;
    for(let i=0;i<c.maximum;i++){
      const phase=i/c.rate;const cycle=Math.floor((time-phase)/slotPeriod);const birth=phase+cycle*slotPeriod;const age=time-birth;
      const seed=i+(Math.max(0,cycle)*c.maximum)+e.index*919;
      const life=THREE.MathUtils.lerp(...c.lifetime,hash(seed+1));const speed=THREE.MathUtils.lerp(...c.speed,hash(seed+2));
      const a=hash(seed+3)*Math.PI*2;const radius=c.radius*(1.12-c.radiusThickness*hash(seed+4))+speed*age;
      // Original Base Graphics has a 90-degree Z rotation and uniform 1.2 scale.
      positions[i*3]=-Math.sin(a)*radius*c.scale[1]*1.2+Math.sin(a)*burst*.18;
      positions[i*3+1]=1.1+Math.cos(a)*radius*c.scale[0]*1.2+Math.cos(a)*burst*.18;
      positions[i*3+2]=.04;
      sizes[i]=THREE.MathUtils.lerp(...c.size,hash(seed+5))*1.2;
      alphas[i]=cycle>=0&&age>=0&&age<life?opacity*Math.max(0,1-Math.abs(age/life*2-1)):0;
      angles[i]=a;
    }
    ['particleCenter','particleSize','particleAlpha','particleAngle'].forEach(key=>e.points.geometry.attributes[key].needsUpdate=true);
  }
}

