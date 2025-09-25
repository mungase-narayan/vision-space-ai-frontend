import { siteConfigs } from "@/configs";
import { Rocket } from "lucide-react";

const Logo = () => {
  return (
    <div
      className="
        font-bold text-lg sm:text-xl tracking-tight
        flex items-center justify-center space-x-2.5
      "
    >
      <div
        className="
          w-8 h-8 flex items-center justify-center
          rounded-md bg-gradient-to-tr from-sky-400 to-sky-600
          text-white shadow-sm
        "
      >
        <Rocket className="w-5 h-5" />
      </div>
      <p
        className="
          bg-gradient-to-r from-sky-500 to-sky-700
          dark:from-sky-300 dark:to-sky-500
          bg-clip-text text-transparent
        "
      >
        {siteConfigs.name}
      </p>
    </div>
  );
};

export default Logo;
