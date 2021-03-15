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
	if (h < 0.1) { h = pow(3*noiseOctave(v/30, 4), 2); }
	// Your implementation ends here
	return h;
}

float perlin_noise(vec2 v) 
{
	float noise = 0;
	// Your implementation starts here
	vec2 i = floor(v);
	vec2 N0 = i;
	vec2 N1 = N0 + vec2(1.0, 0.0);
	vec2 N2 = N0 + vec2(0.0, 1.0);
	vec2 N3 = N0 + vec2(1.0, 1.0);
	vec2 f= fract(v);
	
	vec2 grad0 = hash2(N0);
	vec2 dist0 = v - N0;
	float n0 = dot(grad0, dist0);
	vec2 grad1 = hash2(N1);
	vec2 dist1 = v - N1;
	float n1 = dot(grad1, dist1);
	vec2 grad2 = hash2(N2);
	vec2 dist2 = v - N2;
	float n2 = dot(grad2, dist2);
	vec2 grad3 = hash2(N3);
	vec2 dist3 = v - N3;
	float n3 = dot(grad3, dist3);

	float M0 = mix(n0, n1, f.x);
	float M1 = mix(n2, n3, f.x);
	noise = mix(M0, M1, f.y);

	// Your implementation ends here
	return noise;
}

float perlinOctave(vec2 v, int num)
{
	float sum = 0;
	// Your implementation starts here
	for (int i = 1; i <= num; i++) {
		sum += pow(2,-i) * perlin_noise(pow(2, i) * v);
	}
	// Your implementation ends here
	return sum;
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
	/* Terrain color */
	vec3 col = vec3(0);
	vec3 vtx_normal = compute_normal(v, 0.01);
	vec3 emissiveColor = vec3(0,0,0);
	vec3 lightingColor= vec3(1.,1.,1.);
	vec3 color_mountains = vec3(37., 21., 7.)/255.;
	//vec3 color_ground = vec3(255., 255., 255.)/255.;
	vec3 color_ground = vec3(155., 185., 255.)/255.;
	vec3 water_color = vec3(23., 45., 89.)/255.;
	vec3 grad1 = mix(color_ground, color_mountains, vtx_pos.z/3);

	/* Lighting */
	//vec3 LightPosition = vec3(20, -5, 12);
	vec3 LightPosition[2];
	LightPosition[0] = vec3(20, -7, 12); // General world light
	LightPosition[1] = vec3(50, 80, 10); // Moon light
	// const vec3 LightIntensity = vec3(550);
	vec3 LightIntensity[2];
	LightIntensity[0] = vec3(350); // General world light
	LightIntensity[1] = vec3(100); // Moon Light
	const vec3 lcolor = vec3(155., 185., 255.)/255.;
	const vec3 ka = 0.05 *lcolor;
	const vec3 kd = 0.9*lcolor;
	vec3 ks = vec3(2.);
	const float n = 10.0;
	float depth = 2*sqrt(perlinOctave(v.xy/0.3, 12));
	if (depth < 0.1) { depth += 2; }
	if (vtx_pos.z > depth) {
		emissiveColor = vec3(1.f)*kd;
	}
	else if (pow(3*noiseOctave(v/30, 12), 2) < 0.1) {
		emissiveColor = water_color;
	}
	else {
		emissiveColor = grad1;
	}

	for (int i = 0; i < 2; i++) {
		vec3 normal = normalize(vtx_normal.xyz);
		vec3 lightDir = LightPosition[i] - vtx_pos;
		float _lightDist = length(lightDir);
		vec3 _lightDir = normalize(lightDir);
		vec3 _localLight = LightIntensity[i] / (_lightDist * _lightDist);
		vec3 ambColor = ka;
		lightingColor = kd * _localLight * max(0., dot(_lightDir, normal));

		vec3 V = normalize(position.xyz - vtx_pos);
		vec3 R = -_lightDir + 2.0*dot(normal, _lightDir)*normal;
		float s_max = max(0.0, dot(R, V));

		// ambient + diffusive + specular
		if (pow(3*noiseOctave(v/30, 12), 2) < 0.1) {
			col += ka*emissiveColor + emissiveColor*lightingColor/4 + ks*emissiveColor*pow(s_max, 50);
		}
		else {
			col += ka*emissiveColor + emissiveColor*lightingColor + ks/8*emissiveColor*pow(s_max, n);
		}
	}

	return col;
}

void main()							
{
	vec3 col = get_color(vtx_pos.xy);
	vec3 fog1 = vec3(0);
	vec3 fog2 = vec3(0);

	// Range Based Fog Source: https://stackoverflow.com/questions/27898985/range-based-fog-in-glsl
	// Low level fog
	if (vtx_pos.z < 2* 0.5-noiseOctave(vtx_pos.xy/7, 12)) {
		float dist = distance(vtx_pos, position.xyz);	
		float fog_start = 50; float fog_end = 100;
		float fog_factor = (dist - fog_start) / (fog_end - fog_start);
		fog_factor = clamp(fog_factor, 0, 0.2);
		fog1 += vec3(fog_factor);
		fog1 = clamp(fog1, 0, 0.08);
		col += fog1;
	}
	// Distance based fog
	float dist = distance(vtx_pos, position.xyz);	
	float fog_start = 30; float fog_end = 100;
	float fog_factor = (dist - fog_start) / (fog_end - fog_start);
	fog_factor = clamp(fog_factor, 0, 0.2);
	fog2 += vec3(fog_factor);
	fog2 = clamp(fog2, 0, 0.2);
	col += mix(fog1, fog2, 2* 0.5-noiseOctave(vtx_pos.xy/7, 12));
	frag_color = vec4(col, 1.f);
}	