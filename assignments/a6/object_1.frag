/*This is your fragment shader for texture and normal mapping*/

#version 330 core

#define PI 3.14159265

/*default camera matrices. do not modify.*/
layout (std140) uniform camera
{
	mat4 projection;	/*camera's projection matrix*/
	mat4 view;			/*camera's view matrix*/
	mat4 pvm;			/*camera's projection*view*model matrix*/
	mat4 ortho;			/*camera's ortho projection matrix*/
	vec4 position;		/*camera's position in world space*/
};

/*uniform variables*/
uniform vec2 iResolution;
uniform float iTime;
uniform int iFrame;			
uniform vec2 offset;

uniform sampler2D tex_albedo;			////texture color
uniform sampler2D tex_normal;			////texture normal

in vec3 vtx_pos;

out vec4 frag_color;

vec2 hash2(vec2 v)
{
	vec2 rand = fract(sin(dot(v, vec2(12.9898, 78.233))) * v * 43758.5453);
	return rand;
}

/* Simplex Noise Function Source: https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83 */
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float simplex_noise(vec2 v) 
{
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float noiseOctave(vec2 v, int num)
{
	float sum = 0;
	// Your implementation starts here
	for (int i = 1; i <= num; i++) {
		sum += pow(2,-i) * simplex_noise(pow(2, i) * v);
	}
	// Your implementation ends here
	return sum;
}

float height(vec2 v){
    float h = 0;
	float e = 2.71;
	// Your implementation starts here
	h = pow(3*noiseOctave(v/30, 12), 2);

	// Your implementation ends here
	return h;
}

vec3 compute_normal(vec2 v, float d)
{	
	vec3 normal_vector = vec3(0,0,0);
	// Your implementation starts here
	vec3 v1 = vec3(v.x + d, v.y, height(vec2(v.x + d, v.y)));
	vec3 v2 = vec3(v.x - d, v.y, height(vec2(v.x - d, v.y)));
	vec3 v3 = vec3(v.x, v.y + d, height(vec2(v.x, v.y + d)));
	vec3 v4 = vec3(v.x, v.y - d, height(vec2(v.x, v.y - d)));
	
	vec3 V12 = v2 - v1;
	vec3 V34 = v4 - v3;

	normal_vector = normalize(cross(V12, V34));

	// Your implementation ends here
	return normal_vector;
}

vec3 get_color(vec2 v)
{
	vec3 vtx_normal = compute_normal(v, 0.01);
	vec3 emissiveColor = vec3(0,0,0);
	vec3 lightingColor= vec3(1.,1.,1.);
	vec3 color_mountains = vec3(84., 71., 64.)/255.;
	vec3 color_ground = vec3(10., 27., 48.)/255.;
	vec3 water_color = vec3(23., 45., 89.)/255.;
	vec3 grad1 = mix(color_ground, color_mountains, vtx_pos.z/1.5);


	/*This part is the same as your previous assignment. Here we provide a default parameter set for the hard-coded lighting environment. Feel free to change them.*/
	const vec3 LightPosition = vec3(8, 2, 8);
	const vec3 LightIntensity = vec3(250);
	const vec3 ka = 0.1 *vec3(1., 1., 1.);
	const vec3 kd = 0.7*vec3(1., 1., 1.);
	const vec3 ks = vec3(2.);
	const float n = 400.0;

	emissiveColor = grad1;

	vec3 normal = normalize(vtx_normal.xyz);
	vec3 lightDir = LightPosition - vtx_pos;
	float _lightDist = length(lightDir);
	vec3 _lightDir = normalize(lightDir);
	vec3 _localLight = LightIntensity / (_lightDist * _lightDist);
	vec3 ambColor = ka;
	lightingColor = kd * _localLight * max(0., dot(_lightDir, normal));

	// Your implementation ends here

    return emissiveColor*lightingColor;
}

void main()							
{		
	frag_color = vec4(get_color(vtx_pos.xy), 1.f);
}	