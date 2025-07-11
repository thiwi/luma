import { useEffect } from 'react';
import Lottie from 'lottie-web';

const moodFiles = {
  rain: '/moods/rain.json',
  sun: '/moods/sun.json',
  waves: '/moods/waves.json',
  fog: '/moods/fog.json'
};

export default function MoodVisualizer({ mood }) {
  useEffect(() => {
    const anim = Lottie.loadAnimation({
      container: document.getElementById('mood-canvas'),
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: moodFiles[mood] || moodFiles.rain
    });
    return () => anim.destroy();
  }, [mood]);
  return <div id="mood-canvas" style={{width:'100%',height:'100%'}}></div>;
}
