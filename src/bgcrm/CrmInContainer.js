import React from 'react'
import AppInContainer from '../app/AppInContainer'
export default function CrmInContainer(props){
    const modelViews=[]
    return <AppInContainer app="crm" modelViews={modelViews}></AppInContainer>
}