import { asyncFile } from "./file";
import { fetch } from "../tsimport";

class ChatAPI {
    api_chat: String = "" // 模型请求的网络路径
    api_key: String = "" // 模型请求的密钥
    api_header = undefined // 模型请求时附带的Header信息
    api_Custom = true

    constructor(p_api_chat: String, p_api_key: String, p_api_custom: boolean) {
        this.api_chat = p_api_chat
        this.api_key = p_api_key
        this.api_header = {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
            "Authorization": "Bearer " + this.api_key,
            "Content-Type": "application/json"
        }
    }
}

class BotModel extends ChatAPI {
    m_name: String = "" // 模型名称
    m_images: String = "" // 该模型的图片名称
    m_model: String = "" // 模型具体代号

    constructor(p_api_chat: String, p_api_key: String, p_api_custom: boolean, pm_name: String, pm_images: String, pm_model: String) {
        super(p_api_chat, p_api_key, p_api_custom);
        this.m_name = pm_name
        this.m_images = pm_images
        this.m_model = pm_model
    }
}


class ChatHistory extends BotModel {

    history_name: String = "undfinde" // 该聊天记录的名称

    history_last_content: String = "undfinde"// 用户最后一次对机器人的提问

    history_uuid: String = "" // 聊天记录唯一标识

    history_list: Array<any> = [] // 聊天记录历史

    constructor(p_api_chat: String, p_api_key: String, p_api_custom: boolean, pm_name: String, pm_images: String, pm_model: String, p_history_uuid: String, p_history_name: String, p_history_last_content: String) {
        super(p_api_chat, p_api_key, p_api_custom, pm_name, pm_images, pm_model);
        this.history_name = p_history_name
        this.history_last_content = p_history_last_content
        // 判断UUID是否为空，决定了此是否为新的聊天对象
        if (p_history_uuid === "" || p_history_uuid === undefined) {
            this.history_uuid = this.getNewUuid()
            this.history_list = [{ "role": "user", "content": "你好呀,我该如何使用呢?" }, { "role": "assistant", "content": "点击右下角编辑小按钮输入文字" }]
        } else {
            this.history_uuid = p_history_uuid
            this.readHistory()
        }
    }

    /**
     * 创建一个新的UUID
     * @returns 十六位UUID
     */
    getNewUuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
                v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * 读取聊天记录，并且返回到类的聊天记录中
     */
    readHistory() {
        console.info(`chatbot.ts[info] ==> 开始读取${this.history_uuid}的本地聊天`)
        asyncFile.readText({
            uri: `internal://files/chat/${this.history_uuid}.json`
        }).then((data) => {
            let json_data = JSON.parse(data)
            this.history_list = json_data.messages
            console.info(`chatbot.ts[info] ==> 读取${this.history_uuid}的本地聊天成功`)
        }).catch((data) => {
            console.error(`chatbot.ts[error] ==> 读取${this.history_uuid}的聊天记录失败,因为:${data}`)
        })
    }

    /**
     * 保存聊天记录，嗯
     */
    saveHistory() {
        console.info(`chatbot.ts[info] ==> 开始保存${this.history_uuid}到本地聊天`)
        let json_history_list = JSON.stringify({ messages: this.history_list })
        asyncFile.writeText({
            uri: `internal://files/chat/${this.history_uuid}.json`,
            text: json_history_list
        }).then(_ => {
            console.info(`chatbot.ts[info] ==> 保存${this.history_uuid}到本地聊天成功`)
        }).catch(data => {
            console.info(`chatbot.ts[error] ==> 保存${this.history_uuid}到本地聊天失败,因为：${data}`)
        })
    }

    /**
     * 删除聊天记录
     * @param uuid 聊天记录的UUID
     * @returns 是否删除成功
     */
    static deleteHistoryList(uuid: String): boolean {
        console.info("chatbot.ts[info] ==> 开始删除聊天记录")
        // 删除聊天记录
        asyncFile.delete({
            uri: `internal://files/chat/${uuid}.json`
        }).then(_ => {
            console.info("chatbot.ts[info] ==> 删除聊天记录成功")
            return true
        }).catch(data => {
            console.info("chatbot.ts[error] ==> 删除聊天记录失败，因为：" + data)
            return false
        })
        return false
    }
}

class ChatBot extends ChatHistory {

    is_fetch?: boolean = undefined  // 是否正在请求中

    constructor(p_api_chat: String, p_api_key: String, p_api_custom: boolean, pm_name: String, pm_images: String, pm_model: String, p_history_uuid: String, p_history_name: String, p_history_last_content: String) {
        super(p_api_chat, p_api_key, p_api_custom, pm_name, pm_images, pm_model, p_history_uuid, p_history_name, p_history_last_content)
    }


    /**
     * 请求机器人回复
     * @param user_messages 用户发送的问题
     */
    getBotReplay(user_messages: String) { }
}

class RevChatBot extends ChatBot {

    constructor(p_api_chat: String, p_api_key: String, p_api_custom: boolean, pm_name: String, pm_images: String, pm_model: String, p_history_uuid: String, p_history_name: String, p_history_last_content: String){
        super(p_api_chat, p_api_key, p_api_custom, pm_name, pm_images, pm_model, p_history_uuid, p_history_name, p_history_last_content)
    }

    getBotReplay(user_messages: String): void {
        console.info("chatbot.ts[info] ==> 开始请求机器人回复")
        if (this.is_fetch) {
            console.info("chatbot.ts[info] ==> 请不要重复请求哦~~")
            return
        }
        let req_data = { messages: this.history_list, model: this.m_model }
        this.history_list.push({ "role": "user", "content": user_messages })
        this.history_last_content = user_messages
        console.info("chatbot.ts[info] ==> 请求体构建完成, 开始发送fetch请求")
        this.is_fetch = true
        fetch
            .fetch({
                url: this.api_chat,
                header: this.api_header,
                method: "POST",
                data: JSON.stringify(req_data)
            })
            .then(res => {
                this.is_fetch = false
                this.history_list.push({ "role": "assistant", "content": res.data.data })
                console.info("chatbot.ts[info] ==> 请求成功，机器人已经回复")
            })
            .catch(error => {
                this.is_fetch = false
                console.info(`chatbot.ts[info] ==> 呜呜呜~请求失败，因为${error.data},错误码:${error.code}`)
            })
    }
}

class CustomChatBot extends ChatBot {

    getBotReplay(user_messages: String): void {

    }
}

export { ChatBot, BotModel, RevChatBot, CustomChatBot, ChatHistory }