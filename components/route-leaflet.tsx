'use client';
import {useEffect} from 'react';
import {MapContainer,TileLayer,CircleMarker,Tooltip,useMap} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
export type MapPoint={lat:number;lng:number;label:string;index:number};
function Frame({points}:{points:MapPoint[]}){const map=useMap();useEffect(()=>{if(points.length===1)map.setView([points[0].lat,points[0].lng],12);else if(points.length>1)map.fitBounds(points.map(p=>[p.lat,p.lng]),{padding:[35,35],maxZoom:13});},[points,map]);return null;}
export default function RouteLeaflet({points}:{points:MapPoint[]}){return <MapContainer center={[40,0]} zoom={3} scrollWheelZoom={false} style={{height:400,width:'100%',borderRadius:10,zIndex:0}}><TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'/>{points.map(p=><CircleMarker key={p.index} center={[p.lat,p.lng]} radius={10} pathOptions={{color:'#fff',fillColor:'#315ddd',fillOpacity:1,weight:2}}><Tooltip permanent direction="top">{p.index+1}. {p.label}</Tooltip></CircleMarker>)}<Frame points={points}/></MapContainer>;}
