import { useState, useEffect } from "react";
import Lottie from "lottie-react";

export default function Loader({ text = "Loading...", loaderNumber = 0 }) {
  const [animationData, setAnimationData] = useState(null);

  // Dynamically import only the requested JSON file
  useEffect(() => {
    let isMounted = true;
    
    import(`../../assets/lottie/food-loading${loaderNumber}.json`)
      .then((mod) => {
        if (isMounted) setAnimationData(mod.default);
      })
      .catch(() => {
        import('../../assets/lottie/food-loading0.json').then(mod => {
          if (isMounted) setAnimationData(mod.default);
        });
      });

    return () => { isMounted = false; };
  }, [loaderNumber]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-28">
        {animationData && <Lottie animationData={animationData} loop />}
      </div>
      <p className="mt-2 text-sm font-medium text-green-900 animate-[softBlink_2s_ease-in-out_infinite]">
        {text}
      </p>

      {/* Keyframes */}
      <style>
        {`
          @keyframes softBlink {
            0%, 100% {
              opacity: 0.3;
            }
            50% {
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}