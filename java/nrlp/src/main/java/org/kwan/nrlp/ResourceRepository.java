package org.kwan.nrlp;

public interface ResourceRepository {
	
	/**
	 * 添加资源
	 * @param r
	 */
	public void addResource(Resource r);
	
	/**
	 * 通过资源名称和类型找到指定资源
	 * 
	 * @param name
	 * @param type
	 * @return
	 */
	public Resource findByNameAndType(String name, int type);

	
	
}
