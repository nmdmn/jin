#version 330

layout (location = 0) in vec3 vs_someAttrib;

uniform mat4 u_someMatrix;

void main()
{
	gl_Position = u_someMatrix * vec4(vs_someAttrib, 1);
}
