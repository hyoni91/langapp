let cachedVoices : SpeechSynthesisVoice[] | null = null;

export const getVoices =() :Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve)=>{
        if(cachedVoices){
            resolve(cachedVoices);
            return
        }

        const voices = window.speechSynthesis.getVoices();
        if(voices.length > 0){
            cachedVoices = voices;
            resolve(voices);
        }else{
            window.speechSynthesis.onvoiceschanged = () =>{
                cachedVoices = window.speechSynthesis.getVoices();
                resolve(cachedVoices);
            }
        }
    })
}