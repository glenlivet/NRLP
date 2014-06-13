package org.kwan.nrlp;


/**
 * NRLP中的资源接口。
 * 
 * @author shulai.zhang
 *
 */
public interface Resource {
	
	/**
	 * 获取资源的名称
	 * @return
	 */
	public String getName();
	
	/**
	 * 获取资源的类型
	 * @return
	 */
	public int getType();
	
	/**
	 * 获取资源某一段的byte array.
	 * 
	 * @param start 起始offset.
	 * @param quantity	需要的量。等于结果byte array的长度
	 * @return	返回该段资源的byte array
	 */
	public byte[] getBytes(int start, int quantity);
	
	/**
	 * 资源的总大小。
	 * @TODO 用int是否合适
	 * @return
	 */
	public int getSize();

}
