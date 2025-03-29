import { ChatBot, BotModel } from "./chatbot"
import { asyncStorage } from "./storage"

interface HistoryList {
    apiChat: String, // 聊天接口地址
    apiKey: String, // API密钥
    apiHeader: any, // API请求头
    apiCustom: boolean,
    modelName: String, // 模型名称
    modelImages: String, // 模型相关图片
    modelModel: String, // 模型标识
    historyName: String, // 聊天记录名称
    historyLastContent: String, // 聊天记录的最后一条内容
    historyUuid: String, // 聊天记录的唯一标识符
}

export class Config {

    /**JOSN化的聊天记录主要信息列表 */
    history_list?: Array<HistoryList> = [{
        "apiChat": "https://api.example.com/chat",
        "apiKey": "",
        "apiCustom": false,
        "apiHeader": {
            "Content-Type": "application/json",
            "Authorization": "Bearer token12345"
        },
        "modelName": "ChatModelA",
        "modelImages": "deepseek.png",
        "modelModel": "modelA_v1",
        "historyName": "测试对话1",
        "historyLastContent": "你好，这是最后一条消息",
        "historyUuid": undefined
    },
    {
        "apiChat": "https://api.example.com/chat2",
        "apiKey": "xyz789uvw012",
        "apiCustom": false,
        "apiHeader": {
            "Content-Type": "application/json",
            "Authorization": "Bearer token67890"
        },
        "modelName": "ChatModelB",
        "modelImages": "llama.png",
        "modelModel": "modelB_v2",
        "historyName": "测试对话2",
        "historyLastContent": "这是第二条测试消息",
        "historyUuid": undefined
    }, {
        "apiChat": "https://api.example.com/chat3",
        "apiKey": "pqr456stu123",
        "apiCustom": false,
        "apiHeader": {
            "Content-Type": "application/json",
            "Authorization": "Bearer token34567"
        },
        "modelName": "ChatModelC",
        "modelImages": "onechat.png",
        "modelModel": "modelC_v3",
        "historyName": "测试对话3",
        "historyLastContent": "这是第三条测试消息",
        "historyUuid": undefined
    }
    ]

    /**JOSN化的模型主要信息列表 */
    model_list?: Array<any> = []

    constructor() {
        this.readModelList()
        this.readHistoryList
    }

    /**
     * 判断聊天记录是否存在
     * @returns bool
     */
    historyAccessByUuid(uuid: String): boolean {
        return this.model_list.some((element) => element.historyUuid === uuid)
    }

    /** 
     * 根据模型名称判断模型是否存在 
     * @param name 模型名称 
     * @returns bool 
     */
    ModelAccessByName(name: String): boolean {
        return this.model_list.some((element) => element.modelName === name);
    }

    /**
     * 添加一条聊天记录到该类的聊天记录列表中
     * @param chatbot Chatbot聊天对象
     */
    addHistory(chatbot: ChatBot): void {
        let in_history_list = this.historyAccessByUuid(chatbot.history_uuid)  // 判断聊天记录是否已经存在聊天列表中
        if (!in_history_list) {
            this.history_list.push({
                apiChat: chatbot.api_chat,
                apiKey: chatbot.api_key,
                apiHeader: chatbot.api_header,
                apiCustom: chatbot.api_Custom,
                modelName: chatbot.m_name,
                modelImages: chatbot.m_images,
                modelModel: chatbot.m_model,
                historyName: chatbot.history_name,
                historyLastContent: chatbot.history_last_content,
                historyUuid: chatbot.history_uuid,
            })
        }
    }

    /**
     * 添加一个模型到该类的模型列表中
     * @param botmodel BotMdoel对象
     */
    addModel(botmodel: BotModel) {
        let in_model_list = this.ModelAccessByName(botmodel.m_name)
        if (!in_model_list) {
            this.model_list.push({
                apiChat: botmodel.api_chat,
                apiKey: botmodel.api_key,
                apiHeader: botmodel.api_header,
                apiCustom: botmodel.api_Custom,
                modelName: botmodel.m_name,
                modelImages: botmodel.m_images,
                modelModel: botmodel.m_model,
            })
        }
    }

    /** 
    * 根据uuid移除聊天记录 
    * @param uuid 聊天记录的uuid 
    */
    rmHistoryByUuid(uuid: String): void {
        this.history_list = this.history_list.filter((element) => element.historyUuid !== uuid);
    }

    /** 
     * 根据模型名称移除聊天记录 
     * @param modelName 模型名称 
     */
    rmHistoryByModelName(modelName: String): void {
        this.history_list = this.history_list.filter((element) => element.modelName !== modelName);
    }

    /**保存聊天记录到本地 */
    saveHistoryList() {
        console.info("config.ts[info] ==> 开始保存聊天记录列表到本地")
        let json_history_list = JSON.stringify({ historyList: this.history_list })
        asyncStorage.set('HistoryList', json_history_list).then((data) => {
            console.info("config.ts[info] ==> 保存聊天记录列表到本地成功")
        }).catch((data) => {
            console.info(`config.ts[error] ==> 保存聊天记录列表到本地失败，因为:${data}`)
        })
    }

    /**从本地读取聊天记录 */
    readHistoryList(): boolean {
        console.info("config.ts[info] ==> 开始读取本地聊天记录列表")
        asyncStorage.get("HistoryList").then((data) => {
            let p_history_list = JSON.parse(data.toString())
            this.history_list = p_history_list.historyList
            console.info("config.ts[info] ==> 读取本地聊天记录列表成功")
            return true
        }).catch((data) => {
            this.history_list = []
            console.info("config.ts[error] ==> 读取本地聊天记录列表失败,因为:" + data)
            return false
        })
        return false
    }

    /**保存模型列表到本地 */
    saveModelList() {
        console.info("config.ts[info] ==> 开始保存模型列表")
        let json_model_list = JSON.stringify({ modelList: this.model_list })
        asyncStorage.set('ModelList', json_model_list).then((data) => {
            console.info("config.ts[info] ==> 保存模型列表成功")
        }).catch((data) => {
            console.info("config.ts[error] ==> 保存模型列表失败,因为:" + data)
        })
    }

    /**读取模型列表到类中 */
    readModelList(): boolean {
        console.info("config.ts[info] ==> 开始读取模型列表")
        asyncStorage.get("ModelList").then((data) => {
            let p_model_list = JSON.parse(data.toString())
            this.model_list = p_model_list.modelList
            console.info("config.ts[info] ==> 读取模型列表成功")
            return true
        }).catch((data) => {
            this.model_list = []
            console.info("config.ts[info] ==> 读取模型列表失败,因为:" + data)
            return false
        })
        return false
    }
}