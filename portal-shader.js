// Semantic translation of the non-stereo DXBC ps_4_0 variant extracted from
// VRChat/Portal/Ring FX. Register-to-property bindings are preserved in
// the local extracted/shader-fragment-bindings.json research artifact.
export const vertexShader=`
uniform vec3 localCamera;varying vec2 portalUV;varying vec3 toCamera;
void main(){portalUV=uv;vec3 view=localCamera-position;
toCamera=vec3(view.y,-view.x,abs(view.z));
gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const fragmentShader=`
precision highp float;
uniform vec4 globals[11];uniform float ratio,time,flash;
uniform sampler2D picture,noiseMap;
varying vec2 portalUV;varying vec3 toCamera;
float saturate(float x){return clamp(x,0.,1.);}
float smoothPolynomial(float x){x=saturate(x);return x*x*(3.-2.*x);}
// DXBC's polynomial atan2 approximation, including sign/quadrant selection.
float originalAngle(vec2 p){
float low=min(abs(p.x),abs(p.y)),high=max(abs(p.x),abs(p.y));
float q=low/max(high,1.e-8),q2=q*q;
float poly=((((.020835*q2-.085133)*q2+.180141)*q2-.330299)*q2+.999866);
float angle=q*poly;
if(abs(p.x)<abs(p.y))angle=1.570796- angle;
if(p.x<0.)angle-=3.1415927;
if(min(p.x,p.y)<0. && max(p.x,p.y)>=0.)angle=-angle;
return angle;
}
void main(){
vec2 p=portalUV-.5;
float circleDistance=.5-length(p),horizontalDistance=.5-abs(p.x);
float distanceToEdge=circleDistance+horizontalDistance*(circleDistance*ratio-circleDistance);
float thickness=globals[8].x,borderFade=globals[8].y;
float mask=distanceToEdge>=thickness?1.:0.;
vec4 result=mask*globals[5];
result.rgb*=1.-globals[6].x*distanceToEdge;
if(distanceToEdge>thickness){
 vec2 uv=portalUV-globals[4].x*toCamera.xy/max(toCamera.z,.0001);
 float imageRatio=globals[2].x*globals[2].w/ratio;
 imageRatio=mix(imageRatio,1.,globals[4].z);
 float sx=min(imageRatio,1.),sy=1./max(imageRatio,1.);
 uv=(uv-.5)*vec2(sx,sy)+.5;
 vec2 insetUV=uv*.9+.05;
 if(all(greaterThanEqual(insetUV,vec2(0.)))&&all(lessThanEqual(insetUV,vec2(1.)))){
   vec2 inset=uv*.9-.45;
   float d=.5-length(inset),h=.5-abs(inset.x);
   d=d+h*(d*imageRatio-d);
   float weight=smoothPolynomial(d*20.)*globals[3].a*(1.-globals[4].y);
   vec2 texUV=insetUV;if(!gl_FrontFacing)texUV.x=1.-texUV.x;
   result.rgb=mix(result.rgb,texture2D(picture,texUV).rgb*globals[3].rgb,weight);
 }
 float worldAlpha=globals[3].a*globals[6].y;
 result.a+=worldAlpha*(globals[3].a-globals[5].a*mask);
 float a=abs(originalAngle(p))*globals[10].z*3.141593;
 float n=texture2D(noiseMap,vec2(a,globals[10].y*time/20.)).r;
 float aurora=saturate(n-globals[10].w);
 float falloff=saturate((globals[10].x-distanceToEdge+thickness*2.)/max(.00001,globals[10].x));
 aurora*=falloff*falloff;
 result=mix(result,globals[9],aurora);
}
float border=smoothPolynomial((distanceToEdge-thickness-borderFade)/-borderFade);
result=clamp(mix(result,globals[7],border),0.,1.);
result.rgb+=vec3(.45,.7,1.)*flash;
gl_FragColor=result;
}`;
