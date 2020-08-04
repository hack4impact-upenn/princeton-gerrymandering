import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom'
import GeoJSONViewer from './GeoJSONViewer';
import { Result } from '../types/interfaces';
import { Empty, Typography } from 'antd';

import secureRequest from "../util/secureRequest";
import ZipFileViewer from './ZipFileViewer';
import { text } from 'd3';

interface FileViewerProps {
  resource: Result | undefined
};


const FileViewer: React.FC<FileViewerProps> = ({ resource }: FileViewerProps) => {
  let viewer;
  const [link, setLink] = useState<undefined | string>(undefined)


  useEffect( () => {
    if(resource){
      secureRequest(`/api/resource/link/${resource!.id}`, "GET").then( (data) => {
        setLink(data.url)
      }).catch( (error) => {
        console.log(error)
      }) 
    }
  }, [resource])

  if(resource != undefined && link != undefined){
    const type = resource!.type;
    const encodedUrl = encodeURIComponent(link)
    const microsoftPath = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;

    if(type == "doc" || type == "docx" || type == "document"){
      viewer = <iframe src={microsoftPath} width='100%' height='720px' />
    } else if(type == "xls" || type == "xlsx" || type == "xlsm"){
      viewer = <iframe src={microsoftPath} width='100%' height='540px' />
    } else if(type == "pdf"){
      viewer = <embed src={link} type="application/pdf" width="100%" height="720px" />
    } else if(type == "shapefile" && resource.geojson != undefined){
      try{
        viewer = <GeoJSONViewer source={resource!.geojson}></GeoJSONViewer>
      } catch(err) {
        viewer = <Empty description = {"No File Preview Available"}></Empty>
      }
    } else if(type == "zip"){
      console.log("ss")
      viewer = <ZipFileViewer data = { JSON.parse(resource!.text) }></ZipFileViewer>
    } else if(["png", "jpg", "jpeg", "gif", "svg"].includes(type)) {
      viewer = <img src = {link} style = {{display: "block", marginLeft: "auto", marginRight: "auto"}}></img>
    } else if(["txt", "log"].includes(type)){
      viewer = <div style = {{backgroundColor: "whitesmoke", padding: "15px", maxHeight: 400, overflowY: "scroll"}}>
        <Typography.Text style = {{
          fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
        }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum commodo aliquet varius. Cras porta sem turpis, eget rutrum enim suscipit quis. Duis bibendum libero at nisi varius cursus. Nam viverra quis mauris et malesuada. Pellentesque id velit posuere, tristique dolor nec, condimentum ligula. Nulla id mi id lacus semper luctus. Fusce malesuada malesuada magna, vitae blandit lacus lobortis ac. Morbi ligula quam, sodales id commodo sed, malesuada ut turpis. Maecenas posuere metus eget eleifend mattis. Nunc efficitur condimentum lectus vitae tempor. Nam sed ante tempor, maximus velit vel, interdum ligula. Integer accumsan commodo ex. Praesent tempor a mauris ut rhoncus. Nam non turpis lectus.

        Cras ornare elementum purus vel dictum. Integer placerat risus in velit malesuada interdum. Integer laoreet magna ut pellentesque dignissim. Donec gravida magna in lorem tincidunt consequat. Integer mi massa, aliquet quis varius at, consequat ac ipsum. Cras sed mi consequat, dignissim ex a, porttitor ligula. Maecenas nec metus accumsan, facilisis lacus eget, tincidunt arcu.
        
        Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec dapibus eros tristique augue maximus, sit amet dignissim quam finibus. Aliquam efficitur felis non erat dignissim maximus. Donec tincidunt pulvinar efficitur. Cras id ullamcorper tellus. Suspendisse congue ligula vel lobortis ullamcorper. Pellentesque ac magna eros.
        
        Pellentesque vel fringilla risus. Phasellus et tellus ac erat varius condimentum eget ut tortor. Nullam varius id enim id mattis. Morbi vel odio dolor. Pellentesque tincidunt velit nisi. Sed sed porta odio, sed sagittis eros. Suspendisse ac augue a dui efficitur molestie. Nullam eget convallis velit, ut gravida lacus. Suspendisse potenti. In gravida, velit suscipit laoreet varius, libero nisi congue nibh, eu porttitor tellus urna vulputate erat. Mauris finibus efficitur ex sed pretium. Proin consectetur, mi at ultrices eleifend, erat enim accumsan purus, eu mattis nisl turpis nec velit.
        
        Nullam eu semper nisl. Donec accumsan eros enim, non semper nisl vehicula ac. Morbi malesuada mauris enim, vel elementum mi mollis consequat. Quisque aliquet, est quis auctor porttitor, dolor sem dapibus tortor, vel vulputate diam leo vitae magna. Aliquam vehicula risus mi, nec facilisis felis lobortis eget. Aliquam porttitor et urna in accumsan. Cras ligula odio, maximus et justo rhoncus, tristique scelerisque urna. Mauris ac dictum dolor. Sed ut risus ut enim molestie lobortis sit amet vitae leo. Phasellus vel felis tristique, vulputate magna at, efficitur eros. Proin augue nibh, consequat sit amet libero sit amet, facilisis dictum ante. Nulla imperdiet tellus suscipit velit dictum imperdiet.</Typography.Text>
      </div>
    } else {
      viewer = <Empty description = {"No File Preview Available"}></Empty>
    }
  }

  if (viewer) {
      return (
        <React.Fragment>
          {viewer}
        </React.Fragment>
      );
  }
  return null;
}

export default FileViewer
