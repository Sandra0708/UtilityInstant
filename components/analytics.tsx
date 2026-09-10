'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {startAnalytics,analyticsPageView} from '@/lib/analytics';
export function AnalyticsBootstrap(){
  const path=usePathname();
  useEffect(()=>{startAnalytics();analyticsPageView(path||'/');},[path]);
  return null;
}
