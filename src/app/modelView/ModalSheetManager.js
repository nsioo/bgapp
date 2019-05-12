import React from 'react'
import ReactDOM from 'react-dom'
import {Dialog,Button} from '../../ui'
import {ReactReduxContext} from 'react-redux'
import {openModalSheet,closeModalSheet} from '../actions/modalSheetQueue'
export class ModalSheet extends React.Component{
    constructor(props){
        super(props)
        let {sheetIndex}=this.props
        this.sheetIndex=sheetIndex
    }
    get index(){
        return this.sheetIndex
    }
    unHookElement(){
        closeModalSheet(this)
    }
    componentDidMount(){
        const {sheetIndex} = this.props
        let sheetTag = "sheet" + sheetIndex
        let selfSheetDom = document.querySelector("div[sheetTag='"+sheetTag+"']  .el-dialog__wrapper")
        if(selfSheetDom){
            selfSheetDom.style=selfSheetDom.style||{}
            selfSheetDom.style["z-index"]=sheetIndex 
        }
    }

    render(){
        let self = this
        const {view:ComView,sheetIndex,title,viewParam,...rest} = this.props
        let {external} = (viewParam||{})

        external=Object.assign(external||{},{
            close:()=>{
                self.unHookElement()
            }
        })
        let newViweParam = Object.assign({},viewParam,{external})
        let sheetTag = "sheet" + sheetIndex
        return <div sheetTag={sheetTag}>
                <Dialog  title={title}
                    closeOnClickModal={false}
                    size="large"
                    visible={true}
                    onCancel={ () => {self.unHookElement()} }
                    onClose={()=>{
                        self.unHookElement()
                    }}
                >
                <Dialog.Body>  
                   <ComView  {...rest} inModalQueue={true} viewParam={newViweParam}></ComView> 
                </Dialog.Body>
                <Dialog.Footer>
                </Dialog.Footer>
            </Dialog>
        </div>
    }
}

class WaitingSheet extends React.Component{
    render(){
        let {sheetIndex} = this.props
        return <div style={{zIndex:sheetIndex}} className="bg-waiting-sheet">
            <div class="bg-waiting-sheet-show">
                <div className="bg-waiting-g bg-waiting-g1">

                </div>
                <div className="bg-waiting-g bg-waiting-g2">

                </div>
                <div className="bg-waiting-g bg-waiting-g3">

                </div>
                <div className="bg-waiting-g bg-waiting-g4">

                </div>
                <div className="bg-waiting-g bg-waiting-g5">

                </div>
                <div className="bg-waiting-g bg-waiting-g6">

                </div>
                <div className="bg-waiting-g bg-waiting-g7">

                </div>
                <div className="bg-waiting-g bg-waiting-g8">

                </div>
            </div>
        </div>
    }
}

class ConfirmSheet extends React.Component{
    
    unHookElement(){
        const {sheetHookElement}= this.props
        if(sheetHookElement){
            document.body.removeChild(sheetHookElement)
        }
        sheetHookElement=null
    }

    componentDidMount(){
        const {sheetIndex} = this.props
        let sheetTag = "sheet" + sheetIndex
        let selfSheetDom = document.querySelector("div[sheetTag='"+sheetTag+"'] > .el-dialog__wrapper")
        if(selfSheetDom){
            selfSheetDom.style=selfSheetDom.style||{}
            selfSheetDom.style["z-index"]=sheetIndex 
        }
    }

    render(){
        let self = this
        const {sheetIndex,title,msg,cancel,ok} = this.props
        let cCancel = cancel||function(){}
        let cOk = ok||function(){}
        let sheetTag = "sheet" + sheetIndex
        return <div sheetTag={sheetTag}>
            <Dialog
                title={title}
                size="tiny"
                visible={ true }
                onCancel={ () =>{ cCancel();self.unHookElement(); }}
                lockScroll={ false }
            >
                <Dialog.Body>
                <span>{msg}</span>
                </Dialog.Body>
                <Dialog.Footer>
                <Button onClick={ () =>{ cCancel();self.unHookElement(); }}>取消</Button>
                <Button type="primary" onClick={ () => {
                    cOk();
                    self.unHookElement();
                } }>确定</Button>
                </Dialog.Footer>
            </Dialog>
        </div>
    }
}

class AlertSheet extends React.Component{
    unHookElement(){
        const {sheetHookElement}= this.props
        if(sheetHookElement){
            document.body.removeChild(sheetHookElement)
        }
        sheetHookElement=null
    }

    componentDidMount(){
        const {sheetIndex} = this.props
        let sheetTag = "sheet" + sheetIndex
        let selfSheetDom = document.querySelector("div[sheetTag='"+sheetTag+"'] > .el-dialog__wrapper")
        if(selfSheetDom){
            selfSheetDom.style=selfSheetDom.style||{}
            selfSheetDom.style["z-index"]=sheetIndex 
        }
    }

    render(){
        let self = this
        const {sheetIndex,title,msg} = this.props
        let sheetTag = "sheet" + sheetIndex
        return <div sheetTag={sheetTag}>
            <Dialog
                title={title}
                size="tiny"
                visible={ true}
                onCancel={()=>self.unHookElement()}
                lockScroll={false}>
                <Dialog.Body>
                <span>{msg}</span>
                </Dialog.Body>
                <Dialog.Footer>
                <Button type="primary" onClick={ () => {
                    self.unHookElement()
                } }>确定</Button>
                </Dialog.Footer>
            </Dialog>
        </div>
    }
}


export const ModalSheetManager={
    sheetIndex:20000,
    openModal(view,props){
      let sheetIndex = this.nextSheetIndex()
      openModalSheet(view,props,sheetIndex)
    }
    ,nextSheetIndex(){
        return this.sheetIndex++
    },
    openWaiting(props){
        var hookDiv = document.createElement("div")
        document.body.appendChild(hookDiv)
        let sheetIndex = this.nextSheetIndex()
        ReactDOM.render(<WaitingSheet  {...props} sheetIndex={sheetIndex}/>,hookDiv)
        return function(){
            try{
                document.body.removeChild(hookDiv)
            }
            catch(err){

            }
           
        }
    },
    openConfirm(props){
        let hookDiv = document.createElement("div")
        document.body.appendChild(hookDiv)
        let sheetIndex = this.nextSheetIndex()
        ReactDOM.render(<ConfirmSheet  {...props} sheetIndex={sheetIndex} sheetHookElement={hookDiv}/>,hookDiv)
    },
    openAlert(props){
        let hookDiv = document.createElement("div")
        document.body.appendChild(hookDiv)
        let sheetIndex = this.nextSheetIndex()
        ReactDOM.render(<AlertSheet  {...props} sheetIndex={sheetIndex} sheetHookElement={hookDiv}/>,hookDiv)
    }
}

