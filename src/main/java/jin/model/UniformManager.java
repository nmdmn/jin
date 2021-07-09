package jin.model;

import static org.lwjgl.opengl.GL20.*;

import java.util.HashMap;
import java.util.Map;

import java.nio.IntBuffer;
import org.lwjgl.system.MemoryStack;

/**
 * <p>Utility class to handle uniforms.
 * Uniform are referenced by name and spelling errors can result
 * in hard to find errors. This utility class reads the shaders,
 * collects the uniforms and if the uniforms are retireved through
 * it, the names are handled in a safe way.
 * @author nagygr
 * @version 1.0
 * @since 2020-08-04
 */
public class UniformManager {
	/**
	 * <p>Holds data that describes a uniform.
	 */
	public static class UniformData {
		private final int type;
		private final int size;
		private final String name;
		private int location;

		/**
		 * Creates a UniformData from its type, name and location.
		 */
		public UniformData(int type, int size, String name, int location) {
			this.type = type;
			this.size = size;
			this.name = name;
			this.location = location;
		}

		/**
		 * Creates a UniformData from its type and name.
		 * The location is initialized to -1.
		 */
		public UniformData(int type, int size, String name) { this(type, size, name, -1); }

		/**
		 * Gets the uniform type.
		 * @return the uniform type
		 */
		public int getType() { return type; }

		/**
		 * Gets the uniform size.
		 * @return the uniform size
		 */
		public int getSize() { return size; }

		/**
		 * Gets the uniform name.
		 * @return the uniform name
		 */
		public String getName() { return name; }

		/**
		 * Gets the uniform location.
		 * @return the uniform location
		 */
		public int getLocation() { return location; }

		/**
		 * Sets the uniform location.
		 * @param locaiton the uniform location
		 */
		public void setLocation(int location) { this.location = location; }
	}

	private Map<String, UniformData> uniforms;
	private int programId;

	/**
	 * Creates a UniformManager with the corresponding program ID.
	 * @param programId the ID of the program that is parsed for uniforms
	 */
	public UniformManager(int programId) {
		uniforms = new HashMap<>();
		this.programId = programId;
	}

	/**
	 * Retrieves the uniform data for the given name.
	 * @param uniformName the name of the uniform
	 */
	public UniformData get(String uniformName) {
		UniformData uniform = uniforms.get(uniformName);

		if (uniform == null)
			throw new AssertionError(String.format("The given uniform (%s) was not found", uniformName));

		return uniform;
	}

	/**
	 * Parses the shader text for uniforms.
	 * @param program the shader to parse
	 */
	public void getUniformsFrom(int programId) {
		try (MemoryStack stack = MemoryStack.stackPush()) {
			IntBuffer uniformCount = stack.callocInt(1);
			glGetProgramiv(programId, GL_ACTIVE_UNIFORMS, uniformCount);
			for (int i = 0; i < uniformCount.get(0); i++) {
				IntBuffer size = stack.callocInt(1);
				IntBuffer type = stack.callocInt(1);
				String name = glGetActiveUniform(programId, i, size, type);
				UniformData uniform = new UniformData(type.get(), size.get(), name);
				uniform.setLocation(glGetUniformLocation(programId, name));
				if (uniform.getLocation() == -1)
					throw new AssertionError(String.format("Uniform (%s) location could not be retrieved", name));
				uniforms.put(name, uniform);
			}
		}
	}
}
