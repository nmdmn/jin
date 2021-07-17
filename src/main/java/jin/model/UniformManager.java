package jin.model;

import static org.lwjgl.opengl.GL20.*;

import gnu.trove.map.hash.THashMap;
import java.nio.IntBuffer;
import org.lwjgl.system.MemoryStack;

import lombok.AllArgsConstructor;
import lombok.Data;

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
	@Data @AllArgsConstructor
	public static class UniformData {
		private final int type;
		private final int size;
		private final String name;
		private int location;

		/**
		 * Creates a UniformData from its type and name.
		 * The location is initialized to -1.
		 */
		public UniformData(int type, int size, String name) { this(type, size, name, -1); }
	}

	private THashMap<String, UniformData> uniforms;
	private int programId;

	/**
	 * Creates a UniformManager with the corresponding program ID.
	 * @param programId the ID of the program that is parsed for uniforms
	 */
	public UniformManager(int programId) {
		uniforms = new THashMap<>();
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
	 * Gets the uniforms of a program.
	 * Stores the uniforms in a map with their
	 * name as the key.
	 *
	 * @param programId the program to process
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
