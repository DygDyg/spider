import {useEffect,useState} from 'react';
interface PromptEvent extends Event {prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>}
export function useInstallApp(){
  const [prompt,setPrompt]=useState<PromptEvent|null>(null);
  const [isInstalled,setInstalled]=useState(false);
  useEffect(()=>{
    const mq=matchMedia('(display-mode: standalone)');
    const sync=()=>setInstalled(mq.matches||(navigator as Navigator & {standalone?:boolean}).standalone===true);
    sync();
    const onPrompt=(e:Event)=>{e.preventDefault();setPrompt(e as PromptEvent)};
    const onInstalled=()=>{setInstalled(true);setPrompt(null)};
    addEventListener('beforeinstallprompt',onPrompt);
    addEventListener('appinstalled',onInstalled);
    mq.addEventListener?.('change',sync);
    return ()=>{removeEventListener('beforeinstallprompt',onPrompt);removeEventListener('appinstalled',onInstalled);mq.removeEventListener?.('change',sync)};
  },[]);
  const install=async()=>{if(prompt){await prompt.prompt();await prompt.userChoice;setPrompt(null)}else alert('В меню браузера выберите «Установить приложение» или «Добавить на главный экран».')};
  return {install,isInstalled};
}
