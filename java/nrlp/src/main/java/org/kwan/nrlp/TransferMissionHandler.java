package org.kwan.nrlp;


/**
 * 传输任务处理者。其实现为一个tcp server。负责接收
 * 资源请求者的 tcp 开始请求指令。按事先约定好的速度向其
 * 发送资源。
 * 
 * @author shulai.zhang
 *
 */
public interface TransferMissionHandler {

	/**
	 * 
	 * @param mission
	 */
	public void addMission(TransferMission mission);
}
