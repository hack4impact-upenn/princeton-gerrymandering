import React from 'react';
import ReactDOM from 'react-dom'
import Icon, { FileTextOutlined,  } from '@ant-design/icons';
var collections = require('pycollections');
import {svgIcon, jsIcon, jsxIcon, tsIcon, tsxIcon, pngIcon, jpgIcon, jpegIcon, docIcon, docxIcon, xmlIcon, pdfIcon, zipIcon, mp3Icon, mp4Icon, epsIcon, aviIcon, aiIcon, flaIcon, psdIcon, binIcon, exeIcon, icoIcon, mkvIcon, wmvIcon, movIcon, pptIcon, pptxIcon, isoIcon, gifIcon, jarIcon, vcfIcon, objIcon, htmIcon, htmlIcon, dllIcon, aspIcon, dwgIcon, emlIcon, txtIcon, _3dsIcon, iniIcon, otfIcon, ttfIcon, pkgIcon, comIcon, nfoIcon, wavIcon, rtfIcon, xlsxIcon, xlsmIcon, csvIcon, dbfIcon, cssIcon, scssIcon, sassIcon, lessIcon, defaultIcon} from "../assets/svg/index.js";

interface SearchResultsIconProps {
    filetype: string;
};

var svgMap = new collections.DefaultDict(
  function(){return defaultIcon},
  new collections.Dict({
    "svg": svgIcon,
    "js": jsIcon,
    "jsx": jsxIcon,
    "ts": tsIcon,
    "tsx": tsxIcon,
    "png": pngIcon,
    "jpg": jpgIcon,
    "jpeg": jpegIcon,
    "doc": docIcon,
    "docx": docxIcon,
    "xml": xmlIcon,
    "pdf": pdfIcon,
    "zip": zipIcon,
    "mp3": mp3Icon,
    "mp4": mp4Icon,
    "eps": epsIcon,
    "avi": aviIcon,
    "ai": aiIcon,
    "fla": flaIcon,
    "psd": psdIcon,
    "bin": binIcon,
    "exe": exeIcon,
    "ico": icoIcon,
    "mkv": mkvIcon,
    "wmv": wmvIcon,
    "mov": movIcon,
    "ppt": pptIcon,
    "pptx": pptxIcon,
    "iso": isoIcon,
    "gif": gifIcon,
    "jar": jarIcon,
    "vcf": vcfIcon,
    "obj": objIcon,
    "htm": htmIcon,
    "html": htmlIcon,
    "dll": dllIcon,
    "asp": aspIcon,
    "dwg": dwgIcon,
    "eml": emlIcon,
    "txt": txtIcon,
    "3ds": _3dsIcon,
    "ini": iniIcon,
    "otf": otfIcon,
    "ttf": ttfIcon,
    "pkg": pkgIcon,
    "com": comIcon,
    "nfo": nfoIcon,
    "wav": wavIcon,
    "rtf": rtfIcon,
    "xlsx": xlsxIcon,
    "xlsm": xlsmIcon,
    "csv": csvIcon,
    "dbf": dbfIcon,
    "css": cssIcon,
    "scss": scssIcon,
    "sass": sassIcon,
    "less": lessIcon,
  })
);

const SearchResultsIcon: React.FC<SearchResultsIconProps> = ({ filetype }: SearchResultsIconProps) => {

  const icon = svgMap.get(filetype.toLowerCase());
  return <img src={icon}/>;
};

export default SearchResultsIcon;
