import '@testing-library/jest-dom/vitest';
Object.defineProperty(window,"matchMedia",{writable:true,value:(query:string)=>({matches:false,media:query,onchange:null,addListener:()=>{},removeListener:()=>{},addEventListener:()=>{},removeEventListener:()=>{},dispatchEvent:()=>false})});
Object.defineProperty(window,"scrollTo",{writable:true,value:()=>{}});
class MockIntersectionObserver { observe(){} unobserve(){} disconnect(){} takeRecords(){return []} root=null;rootMargin="0px";thresholds=[0] }
Object.defineProperty(globalThis,"IntersectionObserver",{writable:true,value:MockIntersectionObserver});
