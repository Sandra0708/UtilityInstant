import type {Tool,Field} from './tools.ts';
import {timeCopy as c} from './localization/time.ts';
export const timeIds=['hours','timezones'] as const;
export type TimeId=typeof timeIds[number];
export const isTime=(id:string):id is TimeId=>id==='hours'||id==='timezones';
const field=(id:string,value:string):Field=>({id,value,type:'text',label:c('input'),help:c('help')});
export const timeTools:Omit<Tool,'exportable'|'compare'|'related'>[]=[
 {id:'hours',category:'date',title:c('hours'),description:c('hoursDesc'),fields:[field('start','09:15'),field('end','17:40')],formula:'net = end − start − break; decimal hours = minutes / 60',explanation:c('help'),limitations:c('zoneHelp'),example:c('convertHelp'),aliases:['horas','hours','duration','timesheet','stunden','horas decimales','parte'],source:'https://www.iana.org/time-zones'},
 {id:'timezones',category:'date',title:c('timezones'),description:c('zonesDesc'),fields:[field('datetime','2026-09-18T09:00'),field('from','Europe/Madrid'),field('to','Asia/Tokyo')],formula:'destination = source instant + destination UTC offset',explanation:c('zoneHelp'),limitations:c('zoneHelp'),example:c('zonesDesc'),aliases:['zona horaria','timezone','huso','jet lag','UTC','GMT','time zones'],source:'https://www.iana.org/time-zones'}
];
