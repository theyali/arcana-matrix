// src/features/virtual-deck/hooks/useClickDelay.js
import { useEffect, useRef } from "react";
export default function useClickDelay(delay=250){
  const timersRef = useRef({});
  useEffect(()=>()=>{Object.values(timersRef.current).forEach(clearTimeout);},[]);
  const schedule = (key, fn)=>{ clearTimeout(timersRef.current[key]); timersRef.current[key]=setTimeout(()=>{fn(); delete timersRef.current[key];}, delay); };
  const cancel   = (key)=>{ clearTimeout(timersRef.current[key]); delete timersRef.current[key]; };
  return { schedule, cancel, timersRef };
}
