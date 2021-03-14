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

out vec4 frag_color;

void main()							
{		
	vec4 col = vec4(1.f);
	vec2 uv = calc_uv(vtx_uv, vtx_pos);
	vec4 tex_color = texture(tex_albedo, uv);

	frag_color = vec4(tex_color.rgb, 1);
}	

vec2 calc_uv(const vec2 uv, const vec3 pos) {
	float x = pos.x;
	float y = pos.y;
	float z = pos.z;
	float r = sqrt(x*x + y*y + z*z);

	float u = (atan(x,z) / (2*PI)) + 0.5;
	float v = asin(-y/r)/PI + 0.5;
	vec2 val = vec2(u, v);
	return val;
}