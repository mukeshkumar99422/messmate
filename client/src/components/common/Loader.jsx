import Lottie from "lottie-react";
import foodLoading0 from "../../assets/lottie/food-loading0.json";
import foodLoading1 from "../../assets/lottie/food-loading1.json";
import foodLoading2 from "../../assets/lottie/food-loading2.json";
import foodLoading3 from "../../assets/lottie/food-loading3.json";
import foodLoading4 from "../../assets/lottie/food-loading4.json";

export default function Loader({ text = "Loading...", loaderNumber = 0}) {
  const foodLoading = [foodLoading0, foodLoading1, foodLoading2, foodLoading3, foodLoading4][loaderNumber] || foodLoading0;
  return (
    <div className="flex flex-col items-center justify-center">

      {/* Lottie animation */}
      <div className="w-28">
        <Lottie animationData={foodLoading} loop />
      </div>

      {/* Smooth blinking text */}
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
