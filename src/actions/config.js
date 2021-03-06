import {ReducerRegistry} from '../ReducerRegistry'

export const SET_CURR_APP='SET_CURR_APP'
export const SET_OPEN_MENU_KEYS="SET_OPEN_MENU_KEYS"
export function setCurrApp(app) {
    const {store}=ReducerRegistry
    store.dispatch({
        type:SET_CURR_APP,
        payload:{currApp:app}
    })
}
export function setOpenMenuKeys(data) {
    const {store}=ReducerRegistry
    store.dispatch({
        type:SET_OPEN_MENU_KEYS,
        payload:{openMenuKeys:data}
    })
}

