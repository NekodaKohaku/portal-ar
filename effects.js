import * as THREE from './vendor/three.module.js';
const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
export function createEmitters(config,group){
  return config.map((c,index)=>{
    const count=c.maximum,positions=new Float32Array(count*3),sizes=new Float32Array(count),alphas=new Float32Array(count),angles=new Float32Array(count);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));geo.setAttribute('particleSize',new THREE.BufferAttribute(sizes,1));geo.setAttribute('particleAlpha',new THREE.BufferAttribute(alphas,1));geo.setAttribute('particleAngle',new THREE.BufferAttribute(angles,1));
    const tex=new THREE.TextureLoader().load(`./assets/${c.texture}`);
    const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{map:{value:tex},color:{value:new THREE.Color(...c.color)},height:{value:800}},vertexShader:`uniform float height;attribute float particleSize,particleAlpha,particleAngle;varying float alpha,angle;void main(){alpha=particleAlpha;angle=particleAngle;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=particleSize*height*.5*projectionMatrix[1][1]/max(.1,-mv.z);gl_Position=projectionMatrix*mv;}`,fragmentShader:`uniform sampler2D map;uniform vec3 color;varying float alpha,angle;void main(){vec2 p=gl_PointCoord-.5;float c=cos(angle),s=sin(angle);vec2 uv=mat2(c,-s,s,c)*p+.5;vec4 tex=texture2D(map,uv);if(uv.x<0.||uv.y<0.||uv.x>1.||uv.y>1.||alpha*tex.a<.01)discard;gl_FragColor=vec4(color*tex.rgb,alpha*tex.a);}`});
    const points=new THREE.Points(geo,mat);points.frustumCulled=false;group.add(points);
    return {c,index,points,positions,sizes,alphas,angles};
  });
}
export function updateEmitters(emitters,time,height,burst=0){
  for(const e of emitters){
    const {c,positions,sizes,alphas,angles}=e;e.points.material.uniforms.height.value=height;
    const slotPeriod=c.maximum/c.rate;
    for(let i=0;i<c.maximum;i++){
      const phase=i/c.rate;const cycle=Math.floor((time-phase)/slotPeriod);const birth=phase+cycle*slotPeriod;const age=time-birth;
      const seed=i+(Math.max(0,cycle)*c.maximum)+e.index*919;
      const life=THREE.MathUtils.lerp(...c.lifetime,hash(seed+1));const speed=THREE.MathUtils.lerp(...c.speed,hash(seed+2));
      const a=hash(seed+3)*Math.PI*2;const radius=c.radius*(1-c.radiusThickness*hash(seed+4))+speed*age;
      // Original Base Graphics has a 90-degree Z rotation and uniform 1.2 scale.
      positions[i*3]=-Math.sin(a)*radius*c.scale[1]*1.2+Math.sin(a)*burst*.18;
      positions[i*3+1]=1.1+Math.cos(a)*radius*c.scale[0]*1.2+Math.cos(a)*burst*.18;
      positions[i*3+2]=.04;
      sizes[i]=THREE.MathUtils.lerp(...c.size,hash(seed+5))*1.2;
      alphas[i]=cycle>=0&&age>=0&&age<life?Math.max(0,1-Math.abs(age/life*2-1)):0;
      angles[i]=e.index===1?a:0;
    }
    ['position','particleSize','particleAlpha','particleAngle'].forEach(key=>e.points.geometry.attributes[key].needsUpdate=true);
  }
}
