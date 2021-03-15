/*This is your fragment shader for texture and normal mapping*/

#version 330 core

#define PI 3.14159265

vec2 calc_uv(const vec2 uv, const vec3 pos);

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
uniform float iTime;					////time
uniform sampler2D tex_albedo;			////texture color
uniform sampler2D tex_normal;			////texture normal

/*input variables*/
in vec3 vtx_pos;
in vec4 vtx_color;
in vec2 vtx_uv;
in vec4 vtx_normal;
in vec4 vtx_tangent;
in vec3 sphere_origin;

out vec4 frag_color;

const vec3 LightPosition = vec3(20, -7, 12);
const vec3 LightIntensity = vec3(2);
const vec3 lcolor = vec3(175., 205., 255.)/255.;
const vec3 ka = 0.3*lcolor;
const vec3 kd = 0.5*lcolor;
const vec3 ks = vec3(2.);
const float n = 400.0;

void main()							
{	
		vec2 uv = calc_uv(vtx_uv, vtx_pos);
		vec4 tex_color = texture(tex_albedo, uv);

		vec4 tn = texture(tex_normal, uv);
		tn = normalize(tn * 2.0 - 1.0); // remap
		vec3 N = normalize(vtx_normal.xyz);
		vec3 T = normalize(vtx_tangent.xyz);
		T = normalize(T - dot(T, N) * N); // re-orthogonalize T with respect to N
		vec3 B = cross(N.xyz, T.xyz);
		mat3 TBN = mat3(T, B, N);
		N = normalize(TBN * tn.xyz);

		// Lighting
		vec3 L = normalize(LightPosition - vtx_pos.xyz);
		float L_max = max(0.0, dot(N, L));
		vec3 Lambertian = ka*tex_color.rgb + LightIntensity*kd*tex_color.rgb*L_max;

		frag_color = vec4(Lambertian.rgb, 1);
}	

vec2 calc_uv(const vec2 uv, const vec3 pos) {
	vec3 d = normalize(sphere_origin - pos);
	float r = sqrt(pos.x*pos.x + pos.y*pos.y + pos.z*pos.z);
	float u = 0.5 + (atan(d.x, d.z) / (2*PI));
	float v = 0.5 - (asin(d.y)/PI);
	vec2 val = vec2(u, v);
	return val;
}