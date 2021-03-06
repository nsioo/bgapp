import {
    SET_CREATE_CONTEXT_FIELD_VALUE,
    CLEAR_CREATE_CONTEXT_FIELD_VALUE,
    SET_CREATE_CONTEXT_VIEW_DATA,
    SET_LIST_CONTEXT_CRITERIA,
    SET_LIST_CONTEXT_VIEW_DATA,
    SET_EVENT_LOG_CONTEXT_VIEW_DATA,
    SET_DETAIL_CONTEXT_VIEW_DATA,
    SET_EDIT_CONTEXT_VIEW_DATA,
    SET_EDIT_CONTEXT_FIELD_VALUE,
    REMOVE_LIST_CONTEXT_VIEW_DATA_RECORD,
    UPDATE_LIST_CONTEXT_VIEW_DATA_RECORD,
    SET_LIST_OP_SEARCH_BOX_VISIBLE,
    SET_LIST_OP_SEARCH_BOX_CRITERIA_VALUE,
    SET_LIST_CURRENT_PAGE,
    SET_LIST_PAGE_SIZE,
    UPDATE_CREATE_CONTEXT_FIELD_META,
    SET_EVENT_LOG_OP_SEARCH_BOX_VISIBLE,
    SET_EVENT_LOG_PAGE_SIZE,
    SET_EVENT_LOG_CURRENT_PAGE,
    SET_EVENT_LOG_OP_SEARCH_BOX_CRITERIA_VALUE
} from '../actions/appContext'
import ViewContext from '../modelView/ViewContext'
import produce from "immer"
import { createSelector } from 'reselect'
import memoize from 'lodash.memoize'
import ViewType from '../modelView/ViewType'
import {CREATE_VIEW_DATA, LIST_VIEW_DATA, DETAIL_VIEW_DATA, EDIT_VIEW_DATA,RECORD_TAG, MODEL_FIELD_UPDATE_FLAG, EVENT_LOG_VIEW_DATA} from '../ReservedKeyword'
import { ReducerRegistry } from '../../ReducerRegistry';
import {nextRecordTag} from '../../lib/tag-helper'
import { bindRecordTag } from '../fieldHelper';
import {getViewTypeViewDataContextkey} from "../modelView/ModelViewRegistry"
const initAppContext={}
initAppContext[EDIT_VIEW_DATA]={}
initAppContext[CREATE_VIEW_DATA]={}
initAppContext[DETAIL_VIEW_DATA]={}
initAppContext[LIST_VIEW_DATA]={}
initAppContext[EVENT_LOG_VIEW_DATA]={}
export function appContext(state,action){
    if(typeof state == "undefined"){
        return initAppContext
    }
    switch(action.type){
        case SET_CREATE_CONTEXT_FIELD_VALUE:
        {

            let newState=action.payload
            return produce(state,draft=>{
                if(newState.length>0){
                  newState.map(fv=>{
                    let rootField = fv[0]
                    let key=getAppModelViewKey(rootField.app,rootField.model,rootField.viewType,rootField.ownerField)
                    draft[CREATE_VIEW_DATA][key]=draft[CREATE_VIEW_DATA][key]||{
                      app:rootField.app,
                      model:rootField.model,
                      viewData:{
                          data:{
                              app:rootField.app,
                              model:rootField.model
                          }
                      }
                    }
                    const [fd,value]=fv
                    draft[CREATE_VIEW_DATA][key]["viewData"]["data"]["record"]=draft[CREATE_VIEW_DATA][key]["viewData"]["data"]["record"]||{}
                    draft[CREATE_VIEW_DATA][key]["viewData"]["data"]["record"][fd.name]=value
                    draft[CREATE_VIEW_DATA][key]["viewData"]["data"]["record"][MODEL_FIELD_UPDATE_FLAG]=true
                  })
                }
            })
        }
        case SET_EDIT_CONTEXT_FIELD_VALUE:
        {
            let newFieldValues = action.payload
            return produce(state,draft=>{
                if(newFieldValues.length>0){
                    newFieldValues.map(fv=>{
                      let rootField = fv[0]
                      let key=getAppModelViewKey(rootField.app,rootField.model,rootField.viewType,rootField.ownerField)
                      draft[EDIT_VIEW_DATA][key]=draft[EDIT_VIEW_DATA][key]||{
                        app:rootField.app,
                        model:rootField.model,
                        viewData:{
                            data:{
                                app:rootField.app,
                                model:rootField.model,
                                record:{}
                            }
                        }
                      }
                      const [fd,value]=fv
                      draft[EDIT_VIEW_DATA][key]["viewData"]["data"]["record"][fd.name] = value
                      draft[EDIT_VIEW_DATA][key]["viewData"]["data"]["record"][MODEL_FIELD_UPDATE_FLAG] = true
                    })
                }
            })
        }
        case CLEAR_CREATE_CONTEXT_FIELD_VALUE:
        {
            let {app,model,viewType,ownerField}=action.payload
            return produce(state,draft=>{
                let key=getAppModelViewKey(app,model,viewType,ownerField)
                draft[CREATE_VIEW_DATA][key]=draft[CREATE_VIEW_DATA][key]||{
                    app,
                    model,
                    viewData:{
                        data:{
                            app:app,
                            model:model,
                            data:{
                                app,
                                model
                            }
                        }
                    }
                }
                draft[CREATE_VIEW_DATA][key]["viewData"]["data"]["record"]=null
            })
        }
        case SET_CREATE_CONTEXT_VIEW_DATA:
        {
            const {app,model,viewType,viewData,ownerField}=action.payload
            updateViewField(viewData,ownerField)
            return produce(state,draft=>{
               setCreateViewData(draft,viewData,ownerField)
            })
        }
        case UPDATE_CREATE_CONTEXT_FIELD_META:
        {
            const {app,model,viewType,ownerField,field,meta}=action.payload
            return produce(state,draft=>{
                updateCreateContextFieldMeta(draft,app,model,viewType,ownerField,field,meta)
             })
        }
        case SET_LIST_CONTEXT_CRITERIA:
        {
            const {app,model,viewType,ownerField,name,criteria} = action.payload
            return produce(state,draft=>{
                setModelViewCriteria(draft,app,model,viewType,ownerField,name,criteria)
            })
        }
        case SET_LIST_CONTEXT_VIEW_DATA:
        {
            const {app,model,viewType,viewData,ownerField,refView}=action.payload
            updateViewField(viewData,ownerField)
            return produce(state,draft=>{
                setListViewData(draft,viewData,ownerField)
            })
        }
        case SET_EVENT_LOG_CONTEXT_VIEW_DATA:
        {
            const {app,model,viewType,viewData,ownerField}=action.payload
            return produce(state,draft=>{
                setEventLogViewData(draft,app,model,viewType,viewData,ownerField)
            })
        }
        case REMOVE_LIST_CONTEXT_VIEW_DATA_RECORD:
        {
            const {app,model,viewType,tags,ownerField}  = action.payload
            return produce(state,draft=>{
                let key =getAppModelViewKey(app,model,viewType,ownerField)
                try{
                    draft[LIST_VIEW_DATA][key]["viewData"]["data"]["record"]=draft[LIST_VIEW_DATA][key]["viewData"]["data"]["record"]||[]
                    let record = draft[LIST_VIEW_DATA][key]["viewData"]["data"]["record"]
                    record = record.filter(x=>tags.indexOf(x[RECORD_TAG])<0)
                    draft[LIST_VIEW_DATA][key]["viewData"]["data"]["record"]=record
                }
                catch(err)
                {
                    console.log(err)
                }
            })
        }
        case UPDATE_LIST_CONTEXT_VIEW_DATA_RECORD:
        {
            const {app,model,viewType,record,ownerField} = action.payload
            return produce(state,draft=>{
                let key = getAppModelViewKey(app,model,viewType,ownerField)
                try{
                    let tag = record[RECORD_TAG]
                    if(tag){
                        draft[LIST_VIEW_DATA][key]["viewData"]["data"]["record"]= draft[LIST_VIEW_DATA][key]["viewData"]["data"]["record"]||[]
                        let index = draft[LIST_VIEW_DATA][key]["viewData"]["data"]["record"].findIndex(x=>x[RECORD_TAG]==tag)
                        if(index>-1){
                            draft[LIST_VIEW_DATA][key]["viewData"]["data"]["record"][index]=record
                        }
                        else{
                            draft[LIST_VIEW_DATA][key]["viewData"]["data"]["record"].unshift(record)
                        }
                    }
                }
                catch(err){
                    console.log(err)
                }
            })
        }
        case SET_LIST_OP_SEARCH_BOX_VISIBLE:
        {
            const {app,model,viewType,ownerField,visible} = action.payload
            return produce(state,draft=>{
                setModelViewListOpSearchBoxVisible(draft,app,model,viewType,LIST_VIEW_DATA,ownerField,visible)
            })
        }
        case SET_LIST_OP_SEARCH_BOX_CRITERIA_VALUE:
        {
            const {app,model,viewType,ownerField,fieldName,value} = action.payload
            return produce(state,draft=>{
                setListOpSearchBoxCriteriaValue(draft,app,model,viewType,LIST_VIEW_DATA,ownerField,fieldName,value)
            })
        }
        case SET_LIST_CURRENT_PAGE:
        {
            const {app,model,viewType,ownerField,currentPage} = action.payload
            return produce(state,draft=>{
                setModelViewListCurrentPage(draft,app,model,viewType,LIST_VIEW_DATA,ownerField,currentPage)
            })
        }
        case SET_LIST_PAGE_SIZE:
        {
            const {app,model,viewType,ownerField,pageSize} = action.payload
            return produce(state,draft=>{
                setModelViewListPageSize(draft,app,model,viewType,LIST_VIEW_DATA,ownerField,pageSize)
            })
        }
        case SET_EVENT_LOG_OP_SEARCH_BOX_VISIBLE:
        {
            const {app,model,viewType,ownerField,visible} = action.payload
            return produce(state,draft=>{
                setModelViewListOpSearchBoxVisible(draft,app,model,viewType,EVENT_LOG_VIEW_DATA,ownerField,visible)
            })
        }
        case SET_EVENT_LOG_OP_SEARCH_BOX_CRITERIA_VALUE:
        {
            const {app,model,viewType,ownerField,fieldName,value} = action.payload
            return produce(state,draft=>{
                setListOpSearchBoxCriteriaValue(draft,app,model,viewType,EVENT_LOG_VIEW_DATA,ownerField,fieldName,value)
            })
        }
        case SET_EVENT_LOG_CURRENT_PAGE:
        {
            const {app,model,viewType,ownerField,currentPage} = action.payload
            return produce(state,draft=>{
                setModelViewListCurrentPage(draft,app,model,viewType,EVENT_LOG_VIEW_DATA,ownerField,currentPage)
            })
        }
        case SET_EVENT_LOG_PAGE_SIZE:
        {
            const {app,model,viewType,ownerField,pageSize} = action.payload
            return produce(state,draft=>{
                setModelViewListPageSize(draft,app,model,viewType,EVENT_LOG_VIEW_DATA,ownerField,pageSize)
            })
        }
        case SET_DETAIL_CONTEXT_VIEW_DATA:
        {
            const {app,model,viewType,viewData,ownerField} = action.payload
            updateViewField(viewData,ownerField)
            return produce(state,draft=>{
                setDetailContextViewData(draft,app,model,viewType,viewData,ownerField)
            })
        }
        case SET_EDIT_CONTEXT_VIEW_DATA:
        {
            const {app,model,viewType,viewData,ownerField} = action.payload
            updateViewField(viewData,ownerField)
            return produce(state, draft=>{
                setEditContextViewData(draft,app,model,viewType,viewData,ownerField)
            })
        }
        default:
            return state
    }
}



function setCreateViewData(draft,viewData,ownerField){
    let {view,data,triggerGroups}=viewData
    let key = getAppModelViewKey(view.app,view.model,view.viewType,ownerField)
    draft[CREATE_VIEW_DATA][key]={
        app:view.app,
        model:view.model,
        viewData:Object.assign({
         ...viewData
        },{data:getInitCreateViewData(data,view, ownerField)})
    }
}

function  updateCreateContextFieldMeta(draft,app,model,viewType,ownerField,field,meta){
    let key = getAppModelViewKey(app,model,viewType,ownerField)
    let viewData = (draft[CREATE_VIEW_DATA][key]||{})["viewData"]
    if(viewData){
        let targetField = (viewData.view||{}).fields.find(x=>x.name==field.name)
        if(targetField){
            targetField.meta=meta
        }
    }
}

function setListViewData(draft,viewData,ownerField){
    let {view,data,triggerGroups}=viewData
    let key = getAppModelViewKey(view.app,view.model,view.viewType,ownerField)
    let localData =(draft[LIST_VIEW_DATA][key] && draft[LIST_VIEW_DATA][key]["localData"])||{
        visible:false,
        criteria:{}
    }
    draft[LIST_VIEW_DATA][key]={
        app:view.app,
        model:view.model,
        localData:localData,
        viewData:{
         ...viewData
        }
    }
    if(!draft[LIST_VIEW_DATA][key]["viewData"]){
        draft[LIST_VIEW_DATA][key]={
            app:view.app,
            model:view.model,
            viewData:Object.assign({
             ...viewData
            })
        }
    }
    draft[LIST_VIEW_DATA][key]["viewData"]["data"]=getInitListViewData(data, view, ownerField)
}
function setEventLogViewData(draft,app,model,viewType,viewData,ownerField){
    let key = getAppModelViewKey(app,model,viewType,ownerField)
    let localData =(draft[EVENT_LOG_VIEW_DATA][key] && draft[EVENT_LOG_VIEW_DATA][key]["localData"])||{
        visible:false,
        criteria:{}
    }
    draft[EVENT_LOG_VIEW_DATA][key]={
        app,
        model,
        localData:localData,
        viewData
    }
}
function setModelViewListOpSearchBoxVisible(draft,app,model,viewType,contextKey,ownerField,visible){
    let key = getAppModelViewKey(app,model,viewType,ownerField)
    draft[contextKey][key]["localData"]=draft[contextKey][key]["localData"]||{}
    draft[contextKey][key]["localData"]["searchBox"]=draft[contextKey][key]["localData"]["searchBox"]||{}
    draft[contextKey][key]["localData"]["searchBox"]["visible"]=visible
}

function setListOpSearchBoxCriteriaValue(draft,app,model,viewType,contextKey,ownerField,fieldName,value){
    let key = getAppModelViewKey(app,model,viewType,ownerField)
    draft[contextKey][key]["localData"]=draft[contextKey][key]["localData"]||{}
    draft[contextKey][key]["localData"]["searchBox"]=draft[contextKey][key]["localData"]["searchBox"]||{}
    draft[contextKey][key]["localData"]["searchBox"]["criteria"]=draft[contextKey][key]["localData"]["searchBox"]["criteria"]||{}
    draft[contextKey][key]["localData"]["searchBox"]["criteria"][fieldName]=value
}
function setModelViewListCurrentPage(draft,app,model,viewType,contextKey,ownerField,currentPage){
    let key = getAppModelViewKey(app,model,viewType,ownerField)
    draft[contextKey][key]["localData"]=draft[contextKey][key]["localData"]||{}
    draft[contextKey][key]["localData"]["pageData"]=draft[contextKey][key]["localData"]["pageData"]||{}
    draft[contextKey][key]["localData"]["pageData"]["pageIndex"]=currentPage
}
function setModelViewListPageSize(draft,app,model,viewType,contextKey,ownerField,pageSize){
    let key = getAppModelViewKey(app,model,viewType,ownerField)
    draft[contextKey][key]["localData"]=draft[contextKey][key]["localData"]||{}
    draft[contextKey][key]["localData"]["pageData"]=draft[contextKey][key]["localData"]["pageData"]||{}
    draft[contextKey][key]["localData"]["pageData"]["pageSize"]=pageSize
}
function getInitListViewData(data, view, ownerField){
    if(data && data.record){
        data.record.map(x=>{
            x[RECORD_TAG] = nextRecordTag()
        })
    }
    data=data||{
        app:view.app,
        model:view.model,
        record:[]
    }
    data.record=data.record||[]
    return data
}
function setModelViewCriteria(draft,app,model,viewType,ownerField,name,criteria){
    let key = getAppModelViewKey(app,model,viewType,ownerField)
    if(viewType == ViewType.LIST){
        if(draft[LIST_VIEW_DATA][key]){
            draft[LIST_VIEW_DATA][key]["viewData"]=draft[LIST_VIEW_DATA][key]["viewData"]||{}
            draft[LIST_VIEW_DATA][key]["viewData"]["criterias"] = draft[LIST_VIEW_DATA][key]["viewData"]["criterias"]||{}
            draft[LIST_VIEW_DATA][key]["viewData"]["criterias"][name]=criteria
        }
    }
}
function setDetailContextViewData(draft,app,model,viewType,viewData,ownerField){
    let {view,data,triggerGroups}=viewData
    let key = getAppModelViewKey(view.app,view.model,view.viewType,ownerField)
    draft[DETAIL_VIEW_DATA][key]={
        app:view.app,
        model:view.model,
        viewData:Object.assign({
         ...viewData
        })
    }

    if(!draft[DETAIL_VIEW_DATA][key]["viewData"]){
        draft[DETAIL_VIEW_DATA][key]={
            app:view.app,
            model:view.model,
            viewData:Object.assign({
             ...viewData
            })
        }
    }
    draft[DETAIL_VIEW_DATA][key]["viewData"]["data"]=getInitCreateViewData(data, view, ownerField)
}

function setEditContextViewData(draft,app,model,viewType,viewData,ownerField){
    let {view,data,triggerGroups}=viewData
    let key = getAppModelViewKey(view.app,view.model,view.viewType,ownerField)
    draft[EDIT_VIEW_DATA][key]={
        app:view.app,
        model:view.model,
        viewData:Object.assign({
         ...viewData
        })
    }
    if(!draft[EDIT_VIEW_DATA][key]["viewData"]){
        draft[EDIT_VIEW_DATA][key]={
            app:view.app,
            model:view.model,
            viewData:Object.assign({
             ...viewData
            })
        }    
    }
    draft[EDIT_VIEW_DATA][key]["viewData"]["data"]=getInitEditViewData(data, view, ownerField)
}
function getInitCreateViewData(data,view,ownerField){
    if(data){
        return data
    }
    return {
        app:view.app,
        model:view.model,
        record:{}
    }
}
function getInitEditViewData(data,view,ownerField){
    if(data){
        return data
    }
    return {
        app:view.app,
        model:view.model,
        record:{}
    }
}
export function getAppModelViewKey(app,model,viewType,ownerField){
    let key =`${app}.${model}.${viewType}`
    let pF=ownerField
    while(pF){
        let tag = pF[RECORD_TAG]
        if(!tag){
            key = `${pF.app}.${pF.model}.${pF.viewType}.${pF.name}@${key}`
        }
        else{
            key = `${pF.app}.${pF.model}.${pF.viewType}.${pF.name}.${tag}@${key}`
        }
        
        pF = pF.ownerField
    }
    return key
}

export function updateViewField(viewData,ownerField){
    let {view}=viewData
    if(view){
        view.ownerField=ownerField
        if(view.fields){
            view.fields.map(f=>{
                f.ownerField = ownerField
                return true
            })
        }
    }
}

export const viewDataFromCreateContext = createSelector(state=>state[ViewContext.APP_CONTEXT],appContext=>memoize(({app,model,viewType,ownerField})=>{
    let key=getAppModelViewKey(app,model,viewType, ownerField)
    if(!appContext||!appContext[CREATE_VIEW_DATA]||!(appContext[CREATE_VIEW_DATA][key])||!(appContext[CREATE_VIEW_DATA][key]["viewData"])) return {}
    return appContext[CREATE_VIEW_DATA][key]["viewData"]
}))

export const viewDataFromListContext = createSelector(state=>state[ViewContext.APP_CONTEXT],appContext=>memoize(({app,model,viewType,ownerField})=>{
    let key=getAppModelViewKey(app,model,viewType, ownerField)
    if(!appContext||!appContext[LIST_VIEW_DATA]||!(appContext[LIST_VIEW_DATA][key])||!(appContext[LIST_VIEW_DATA][key]["viewData"])) return {}
    return appContext[LIST_VIEW_DATA][key]["viewData"]
}))
export const localDataFromListContext = createSelector(state=>state[ViewContext.APP_CONTEXT],appContext=>memoize(({app,model,viewType,ownerField})=>{
    let key=getAppModelViewKey(app,model,viewType, ownerField)
    if(!appContext||!appContext[LIST_VIEW_DATA]||!(appContext[LIST_VIEW_DATA][key])||!(appContext[LIST_VIEW_DATA][key]["localData"])) return {}
    return appContext[LIST_VIEW_DATA][key]["localData"]
}))

export const viewDataFromEventLogContext = createSelector(state=>state[ViewContext.APP_CONTEXT],appContext=>memoize(({app,model,viewType,ownerField})=>{
    let key=getAppModelViewKey(app,model,viewType, ownerField)
    if(appContext){
        let data = appContext[EVENT_LOG_VIEW_DATA]
        if(data){
            data = data[key]
            if(data && data.viewData){
                return data.viewData
            }
        }
    }
    return {eventLogs:[],totalCount:0,triggerGroups:[]}
}))
export const localDataFromEventLogContext = createSelector(state=>state[ViewContext.APP_CONTEXT],appContext=>memoize(({app,model,viewType,ownerField})=>{
    let key=getAppModelViewKey(app,model,viewType, ownerField)
    if(appContext){
        let data = appContext[EVENT_LOG_VIEW_DATA]
        if(data){
            data = data[key]
            if(data && data.localData){
                return data.localData
            }
        }
    }
    return {}
}))


 
export const viewDataFromDetailContext = createSelector(state=>state[ViewContext.APP_CONTEXT],appContext=>memoize(({app,model,viewType,ownerField})=>{
    let key=getAppModelViewKey(app,model,viewType, ownerField)
    if(!appContext||!appContext[DETAIL_VIEW_DATA]||!(appContext[DETAIL_VIEW_DATA][key])||!(appContext[DETAIL_VIEW_DATA][key]["viewData"])) return {}
    return appContext[DETAIL_VIEW_DATA][key]["viewData"]
}))

export const viewDataFromEditContext = createSelector(state=>state[ViewContext.APP_CONTEXT],appContext=>memoize(({app,model,viewType,ownerField})=>{
    let key=getAppModelViewKey(app,model,viewType, ownerField)
    if(!appContext||!appContext[EDIT_VIEW_DATA]||!(appContext[EDIT_VIEW_DATA][key])||!(appContext[EDIT_VIEW_DATA][key]["viewData"])) return {}
    return appContext[EDIT_VIEW_DATA][key]["viewData"]
}))

function removeRedundancyProperty(modelData){
    if(modelData && modelData.record){
        if(modelData.record instanceof Array){
            var rModelData = {
                app:modelData.app,
                model:modelData.model,
                record:[]
            }
            modelData.record.map(r=>{
                if(r["id"]!=undefined){
                    if(r[MODEL_FIELD_UPDATE_FLAG]){
                        let nr = removeRedundancyRecordProperty(r)
                        rModelData.record.push(nr)
                    }
                    else{
                        rModelData.record.push({
                            id:r["id"]
                        })
                    }
                }
                else{
                    let nr = removeRedundancyRecordProperty(r)
                    rModelData.record.push(nr)
                }
            })
            return rModelData
        }
        else{
            if(modelData.record["id"]!=undefined){
                if(modelData.record[MODEL_FIELD_UPDATE_FLAG]){
                    let nr = removeRedundancyRecordProperty(modelData.record)
                    return  {
                             app:modelData.app,
                             model:modelData.model,
                             record:nr
                            }
                }
                else{
                    return {
                        app:modelData.app,
                        model:modelData.model,
                        record:{
                            id:modelData.record.id
                        }
                    }
                }
               
            }
            else{
                let nr = removeRedundancyRecordProperty(modelData.record)
                return  {
                         app:modelData.app,
                         model:modelData.model,
                         record:nr
                        }
            }
        }
    }
    return modelData
}
function removeRedundancyRecordProperty(record){
    let nr = {}
    Object.keys(record).map(key=>{
        let keyValue = record[key]
        if(keyValue instanceof Object){
            nr[key]=removeRedundancyProperty(keyValue)
        }
        else{
            nr[key]=keyValue
        }
    })
    return nr
}

function buildServerModelDataObject(view,dataRecord,state,subViews){
    let record={}
    if(dataRecord.hasOwnProperty("id")){
        record["id"]=dataRecord["id"]
        record[MODEL_FIELD_UPDATE_FLAG]=dataRecord[MODEL_FIELD_UPDATE_FLAG]
    }
    view.fields.map(f=>{
        if(!f.relationData){
            let value = dataRecord[f.name]
            if(value!==undefined && value!==null){
                record[f.name]=removeRedundancyProperty(value)
            }
        }
        else if(f.relationData.type=="Many2Many"){
            let value = dataRecord[f.name]
            if(value!==undefined && value!==null){
                if(value instanceof Object){
                    value = removeRedundancyProperty(value)
                }
                else{
                    value={
                        app:f.relationApp.targetApp,
                        model:f.relationApp.targetModel,
                        record:{
                            id:value
                        }
                    }
                }
               record["relRegistries"]=record["relRegistries"]||{}
               record["relRegistries"][f.relationData.relationModel]=record["relRegistries"][f.relationData.relationModel]||{
                   app:f.relationData.relationApp,
                   model:f.relationData.relationModel,
               }
               let r={}
               r[f.relationData.relationField]=value
               record["relRegistries"][f.relationData.relationModel]["record"]= record["relRegistries"][f.relationData.relationModel]["record"]||[r]
               record["relRegistries"][f.relationData.relationModel]["record"][0][f.relationData.relationField]=value
            }
            else{
                let {relationApp:app,relationModel:model} = f.relationData
                if(subViews){
                    let subView = (subViews||[]).find(x=>{
                        return x.refView.fieldName == f.name
                    })
                    if(subView){
                        let contextKey = getViewTypeViewDataContextkey(subView.refView.viewType)
                        let data=buildServerViewTypeData(app,model,subView.refView.viewType,contextKey,f,state)
                        data=removeRedundancyProperty(data)
                        let dataRecord=data.record
                        if(data.record && !(data.record instanceof Array)){
                          data.record=[dataRecord]
                        }
                        if(data.record && data.record.length>0){
                            record["relRegistries"]=record["relRegistries"]||{}
                            record["relRegistries"][f.relationData.relationModel]=data
                        }
                    }
                    else{
                        record[f.name]= removeRedundancyProperty(dataRecord[f.name])
                    }
                }
                else{
                    record[f.name]= removeRedundancyProperty(dataRecord[f.name])
                }

            }
        }
        else if(f.relationData.type=="One2Many"){
                let {targetApp:app,targetModel:model} = f.relationData
                if(subViews){
                    let subView = subViews.find(x=>{
                        return x.refView.fieldName == f.name
                    })
                    if(subView){
                        let contextKey = getViewTypeViewDataContextkey(subView.refView.viewType)
                        let createData=buildServerViewTypeData(app,model,subView.refView.viewType,contextKey,f,state)
                        createData=removeRedundancyProperty(createData)
                        if(createData.record && createData.record.length>0){
                            record[f.name]=createData
                        }
                    }
                    else{
                        record[f.name]= removeRedundancyProperty(dataRecord[f.name])
                    }
                }
                else{
                    record[f.name]= removeRedundancyProperty(dataRecord[f.name])
                }
        }
        else if(f.relationData.type=="VirtualOne2One" || f.relationData.type=="One2One"){
            let {targetApp:app,targetModel:model} = f.relationData
            if(subViews){
                let subView = subViews.find(x=>{
                    return x.refView.fieldName == f.name
                })
                if(subView){
                    let contextKey = getViewTypeViewDataContextkey(subView.refView.viewType)
                    let createData=buildServerViewTypeData(app,model,subView.refView.viewType,contextKey,f,state)
                    createData=removeRedundancyProperty(createData)
                    if(createData.record && Object.keys(createData.record).length>0){
                        record[f.name]=createData
                    }
                }
                else{
                    record[f.name]= removeRedundancyProperty(dataRecord[f.name])
                }
            }
            else{
                record[f.name]= removeRedundancyProperty(dataRecord[f.name])
            }
        }
        else{
            let value = dataRecord[f.name]
            if(value!==undefined && value!==null){
                record[f.name]=removeRedundancyProperty(value)
            }
        }
    })
    return record
}

//TODO 
function buildServerModelDataArray(app,model,viewType,data,viewDataConextkey,ownerField,state){
    let records = []
    if(ownerField){
        (data.record||[]).map((r)=>{
                let tag = r[RECORD_TAG]
                if(tag){
                    let tagOwnerField = bindRecordTag(ownerField,tag)
                    let addData = buildServerViewTypeData(app,model,ViewType.CREATE,viewDataConextkey,tagOwnerField,state)
                    if(addData && addData.record && Object.keys(addData.record).length>0){
                        let nr={}
                        Object.keys(addData.record).map(key=>{
                            if(r[key]!=undefined){
                                nr[key]=r[key]
                            }
                            else{
                                nr[key]=addData.record[key]
                            }
                        })
                        records.push(nr)
                    }
                }
        })
    }
    return records
}


function flushServerData(data,newData){
     newData.app=data.app
     newData.model=data.model
     if(data.record instanceof Array){
        newData.record=[]
        for(let dr of data.record){
            let r = flushServerModelRecord(dr)
            if(r){
                newData.record.push(r)
            }
        }
    } else if(data.record instanceof Object){
        let r = flushServerModelRecord(data.record)
        if(r){
            newData.record=r
        }
    }
}
function flushServerModelRecord(record){
    let newRecord={}
    Object.keys(record).map(key=>{
        if(key === "relRegistries"){
            let v = record[key]
            let relValue={}
            if(v){
                Object.keys(v).map(mKey=>{
                    let newRecords= []
                    let oldRecords=v[mKey].record||[]
                    for(let r of oldRecords){
                        let nr = flushServerModelRecord(r)
                        if(nr){
                            newRecords.push(nr)
                        }
                    }
                    
                   
                    if(newRecords.length>0){
                        relValue[mKey]={
                            app:v[mKey].app,
                            model:v[mKey].model,
                            record:newRecords
                        }
                    }
                })
            }
            if(Object.keys(relValue).length>0){
                newRecord["relRegistries"]=relValue
            }
        }
        else{
            let v = record[key]
            if((v instanceof Object) && v.app && v.model){
                let newData ={}
                flushServerData(v,newData)
                if(newData.record && newData.record){
                    if(newData.record instanceof Array){
                        if(newData.record.length>0){
                            newRecord[key]=newData
                        }
                    }
                    else{
                        newRecord[key]=newData
                    }
                }
            }
            else{
                newRecord[key]=v
            }
        }
    })
    if(Object.keys(newRecord).length>0){
        return newRecord
    }
}
export function buildServerCreateData(app,model,viewType,ownerField,state){
    let data= buildServerViewTypeData(app,model,viewType,CREATE_VIEW_DATA,ownerField,state)
    let newData={}
    flushServerData(data,newData)
    return newData
}

export function buildServerEditData(app,model,viewType,ownerField,state){
    let data= buildServerViewTypeData(app,model,viewType,EDIT_VIEW_DATA,ownerField,state)
    console.log("preflush="+JSON.stringify(data))
    let newData={}
    flushServerData(data,newData)
    console.log("afterflush="+JSON.stringify(newData))
    return newData
}
export function buildServerListData(app,model,viewType,ownerField,state){
    return buildServerViewTypeData(app,model,viewType,LIST_VIEW_DATA,ownerField,state)
}

function buildServerViewTypeData(app,model,viewType,viewDataConextkey,ownerField,state){
     let serverData={
        app,
        model
    }
    let rootKey = getAppModelViewKey(app,model,viewType,ownerField)
    let modelData = (state[ViewContext.APP_CONTEXT][viewDataConextkey]||{})[rootKey]
    if(modelData){

        if(((modelData.viewData||{}).data||{}).record && (modelData.viewData.data.record instanceof Array)){
            serverData.record=buildServerModelDataArray(app,model,viewType,
                modelData.viewData.data,CREATE_VIEW_DATA,ownerField,state)
        }
        else{
            serverData.record=buildServerModelDataObject(modelData.viewData.view,
                (modelData.viewData.data||{}).record||{},state,modelData.viewData.subViews)
        }
    }
    return serverData
}
