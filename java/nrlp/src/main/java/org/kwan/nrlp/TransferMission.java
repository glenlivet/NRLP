package org.kwan.nrlp;

public interface TransferMission {
	
	/**
	 * 请求者ID
	 * 
	 * @return
	 */
	public String getRequesterId();
	
	/**
	 * 资源
	 * @return
	 */
	public Resource getResource();
	
	/**
	 * 传输任务ID
	 * @return
	 */
	public String getId();
	
	/**
	 * 
	 * 传输
	 * @return
	 */
	public TransferConfig getTransferConfig();

}
