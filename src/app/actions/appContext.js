import {ReducerRegistry} from '../../ReducerRegistry'
export const SET_CREATE_CONTEXT_FIELD_VALUE='setCreateContextFieldValue'
export const CLEAR_CREATE_CONTEXT_FIELD_VALUE='clearCreateContextFieldValue'
export const SET_CREATE_CONTEXT_VIEW_DATA='setCreateContextViewData'
export const SET_LIST_CONTEXT_CRITERIA='setListContextCtriteria'
export const SET_LIST_CONTEXT_VIEW_DATA='setListContextData'

export const UPDATE_LIST_CONTEXT_VIEW_DATA='updateListContextData'
export const REMOVE_LIST_CONTEXT_VIEW_DATA = 'removeListContextViewData'
export const SET_LIST_CONTEXT_PAEG_DATA = 'setListContextPageData'

export const SET_DETAIL_CONTEXT_VIEW_DATA = 'setDetailContextViewData'

export const SET_EDIT_CONTEXT_VIEW_DATA = 'setEditContextViewData'
export const SET_EDIT_CONTEXT_FIELD_VALUE = 'setEditContextFieldValue'

export const SET_CREATE_CONTEXT_VIEW_DATA_TO_SOURCE = "setCreateContextViewDataToSource"
export const SET_EDIT_CONTEXT_VIEW_DATA_TO_SOURCE = "setEditContextViewDataToSource"



function setContextDataAction(type,payload){
    const {store}=ReducerRegistry
    store.dispatch({
        type,
        payload
    })
}

export function setCreateContextFieldValue(fieldValues){
    const {store}=ReducerRegistry
    store.dispatch({
        type:SET_CREATE_CONTEXT_FIELD_VALUE,
        payload:fieldValues
    })
}



export function clearCreateContextFieldValue(app,model,viewType,ownerField){
    const {store}=ReducerRegistry
    store.dispatch({
        type:CLEAR_CREATE_CONTEXT_FIELD_VALUE,
        payload:{app,model,viewType, ownerField}
    })
}

export function setCreateContextViewData(app,model,viewType, viewData,ownerField,datasourceKey){
    setContextDataAction(SET_CREATE_CONTEXT_VIEW_DATA, {app,model,viewType,viewData,ownerField,datasourceKey})
}

export function setListContextCriteria(app,model,viewType,cKey,criteria){
    const {store}=ReducerRegistry
    store.dispatch({
        type:SET_LIST_CONTEXT_CRITERIA,
        payload:{
            app,
            model,
            viewType,
            cKey,
            criteria
        }
    })
}

export function setListContextData(app,model,viewType,viewData,ownerField){
    setContextDataAction(SET_LIST_CONTEXT_VIEW_DATA, {app,model,viewData,viewType,ownerField})
}

export function updateListContextData(app,model,viewType,viewData,ownerField){
    setContextDataAction(UPDATE_LIST_CONTEXT_VIEW_DATA, {app,model,viewType,viewData,ownerField})
}

export function removeListContextViewData(app,model,viewType,tags,ownerField){
    setContextDataAction(REMOVE_LIST_CONTEXT_VIEW_DATA, {app,model,viewType,tags,ownerField})
}

export function setListContextPageData(app,model,viewType,pageSize,pageIndex,ownerField){
    setContextDataAction(SET_LIST_CONTEXT_PAEG_DATA, {app,model,viewType,pageIndex,pageSize,ownerField})
}


export function setDetailContextViewData(app,model,viewType,viewData,ownerField){
    setContextDataAction(SET_DETAIL_CONTEXT_VIEW_DATA, {app,model,viewType,viewData,ownerField})
}
export function setEditContextViewData(app,model,viewType, viewData,ownerField){
    setContextDataAction(SET_EDIT_CONTEXT_VIEW_DATA, {app,model,viewType,viewData,ownerField})
}

export function setEditContextFieldValue(fieldValues){
    const {store}=ReducerRegistry
    store.dispatch({
        type:SET_EDIT_CONTEXT_FIELD_VALUE,
        payload:fieldValues
    })
}

export function setCreateContextViewDataToSource(app,model,viewType,ownerField,datasourceKey){
    setContextDataAction(SET_CREATE_CONTEXT_VIEW_DATA_TO_SOURCE, {app,model,viewType,ownerField,datasourceKey})
}

export function setEditContextViewDataToSource(app,model,viewType,ownerField,datasourceKey){
    setContextDataAction(SET_EDIT_CONTEXT_VIEW_DATA_TO_SOURCE, {app,model,viewType,ownerField,datasourceKey})
}





