
import {ViewCMM} from './ViewCMM'
import {getDynamicRouterAppModelViewType} from '../../reducers/router'
import {getAppsSelector,corpModelsSelector} from '../../reducers/sys'
import {
  setCreateContextFieldValue,
  clearCreateContextFieldValue,
  setCreateContextViewData,
  setCreateContextViewDataToSource
} from '../actions/appContext'

import produce from "immer"
import {ViewFieldType} from '../modelView/ViewFieldType'
import { ModelAction } from '../mq/ModelAction'
import {CREATE_VIEW_DATA} from '../ReservedKeyword'
import { getRoutePath,goRoute } from '../routerHelper'
import {
    viewDataFromCreateContext,
    getCreateContextFieldValue,
    buildServerCreateData} from '../reducers/appContext'
import {Button,Form,Tabs,Table, MessageBox} from 'element-react'
import {createViewParam,createDetailParam} from '../modelView/ViewParam'
import ViewType from '../modelView/ViewType'
import {RECORD_TAG} from '../ReservedKeyword'
import _ from 'lodash'
export class CreateViewCMM extends ViewCMM{

    constructor(app,model,viewType){
      super(app,model,viewType)
    }

    static get s_viewType(){
        return "create"
    }

    mapTo(state, ownProps){
      let baseProps= super.mapTo(state, ownProps);
      const {appModelViewType,viewParam} = ownProps
      const ownerField = (viewParam||{}).ownerField
      let installApps=getAppsSelector(state)
      const {app,model,viewType}=appModelViewType
      let viewData=viewDataFromCreateContext(state)({app,model,viewType,ownerField})
      let newProps= Object.assign({},installApps,{viewData})
       return Object.assign({},baseProps,newProps,ownProps);
    }

    init(view){
      
    }

    update(view){

    }

    getOwnerFieldRawFieldValue(app,model,ownerField,ownerFieldValue){
      if(ownerField && ownerFieldValue!=null && ownerFieldValue!=undefined){
        if(ownerFieldValue instanceof Object){
           if(ownerFieldValue.record){
               if(app==ownerField.relationData.targetApp && model==ownerField.relationData.targetModel){
                   return ownerFieldValue.record[ownerField.relationData.targetField]
               }
               else if(app == ownerField.relationData.relationApp && model == ownerField.relationApp.relationModel){
                return ownerFieldValue.record[ownerField.relationData.relationField]
               }
           }
           else{
              if(app==ownerField.relationData.targetApp && model==ownerField.relationData.targetModel){
                return ownerFieldValue[ownerField.relationData.targetField]
              }
              else if(app == ownerField.relationData.relationApp && model == ownerField.relationApp.relationModel){
              return ownerFieldValue[ownerField.relationData.relationField]
              }
           }
        }
        else{
          return ownerFieldValue
        }
      }
    }

    didMount(view){
        let self= this
        let {viewParam, viewData}= view.props
        let {ownerField,ownerFieldValue,external} = (viewParam||{})
        let {getDatasource,setDatasource} = (external||{})
        let rawOwnerFieldValue = self.getOwnerFieldRawFieldValue(this.app,this.model,ownerField,ownerFieldValue)
        let recordTag = ownerField?ownerField[RECORD_TAG]:undefined
        let datasource = getDatasource&&getDatasource(recordTag)
        var reqParam={
            viewType:this.viewType,
            ownerField:ownerField?{
                app:ownerField.app,
                model:ownerField.model,
                name:ownerField.name,
                value:rawOwnerFieldValue
            }:undefined,
            reqData:{
                app:this.app,
                model:this.model
            }
        }
        
        new ModelAction(this.app,this.model).call("loadModelViewType",reqParam,function(data){
        data.bag && setCreateContextViewData(
            self.app,
            self.model,
            self.viewType,
            self.initDatasource(data.bag,datasource),
            ownerField
        )
        },function(err){
            console.log(err)
        })
    }

    initDatasource(bag,datasource){
      if(datasource){
         bag["data"]=datasource
      }
      return bag
    }
    
    getOwnerRelationFieldValues(view){
      const {viewParam,viewData} = view.props
      let {ownerField,ownerFieldValue} = (viewParam||{})
      if(ownerField){
        if(ownerField.relationData.targetApp==this.app && ownerField.relationData.targetModel==this.model){
          if(ownerFieldValue instanceof Object){
             let rawValue = ownerFieldValue.record?ownerFieldValue.record[ownerField.relationData.targetField]:ownerFieldValue[ownerField.relationData.targetField]
             if(rawValue){
               let fd=viewData.view.fields.find(x=>x.name==ownerField.relationData.targetField)
               return fd?[fd,rawValue]:undefined
             }
          }
          else if(ownerFieldValue!=undefined){
            let fd=viewData.view.fields.find(x=>x.name==ownerField.relationData.targetField)
            if(fd){
              return [ownerField,ownerFieldValue]
            }
          }
       }
       else if(ownerField.relationData.relationApp==this.app && ownerField.relationData.relationModel == this.model){
         if(ownerFieldValue instanceof Object){
           let rawValue = ownerFieldValue.record?ownerFieldValue.record[ownerField.relationData.relationField]:ownerFieldValue[ownerField.relationData.relationField]
           if(rawValue){
             let fd=viewData.view.fields.find(x=>x.name==ownerField.relationData.relationField)
             return fd?[fd,rawValue]:undefined
           }
        }
        else if(ownerFieldValue!=undefined){
          let fd=viewData.view.fields.find(x=>x.name==ownerField.relationData.relationField)
          if(fd){
            return [fd,ownerFieldValue]
          }
        }
       }
      }
    }

    // getOwnerRelationFieldValues(view){
    //   const {viewData,ownerField}=self.props
    //   const  {view}=viewData||{}
    //   if(view && ownerField){
    //     let f = view.fields.find(x=>{
    //       x.name = ownerField.relationData.targetField
    //     })
    //     return f
    //   }
    // }

    onFieldValueChange(fd,value,view){
      let relationFieldValues =this.getOwnerRelationFieldValues(view)
      if(!relationFieldValues){
        setCreateContextFieldValue([[fd,value]])
      }
      else{
        setCreateContextFieldValue([[fd,value],relationFieldValues])
      }
  }

  getSubRefViewParam(view,subRefView,ownerField){
    const {viewData} = view.props
    const {data}=(viewData||{})
    let ownerFieldValue = (data.record||{})[ownerField.name]
    return createViewParam(ownerField,ownerFieldValue,null,null)
  }

  showDetail(view,id){
    const {viewParam,viewRefType} = view.props
    if((viewParam||{}).ownerField){
      const {ownerField,ownerFieldValue,orgState} = viewParam
      let dViewParam = createDetailParam(ownerField,ownerFieldValue,undefined,orgState,id)
      this.showAppModelViewInModalQueue(this.app,this.model,ViewType.DETAIL,viewRefType,dViewParam)
    }
    else{
      var editPath=getRoutePath(this.app,this.model,"detail/"+id)
      goRoute(editPath,{id:id})
    }
  }
  doCreate(view){
      let self=this
      const {viewParam,viewData} = view.props
      const {ownerField,orgState,external}=(viewParam||{})
      let {getDatasource,setDatasource,close} = (external||{})
      if(close && setDatasource){
        let tag = ownerField[RECORD_TAG]
        let datasource = _.cloneDeep(viewData.data||{})
        datasource[RECORD_TAG]=tag
        setDatasource(datasource)
        close()
      }
      else{
        let createData= buildServerCreateData(self.app,self.model,self.viewType,ownerField,orgState)
        new ModelAction(this.app,this.model).call("create",createData,function(res){
            if(res.errorCode==0){
                var newID=res.bag["id"]
                self.showDetail(view,newID)
            }
            else{
                MessageBox.alert(res.description)
            }
            
            },function(err){
                MessageBox.alert("通讯失败！")
            })
      }
  }

  doAction(view,trigger){
     this[trigger.name].call(this,view)
  }
 
  doCancel(view){
    const {viewParam} = view.props
    const {ownerField,external}=(viewParam||{})
      clearCreateContextFieldValue(this.app,this.model,this.viewType, ownerField)
      if(external && external.close){
        external.close()
      }
  }
}