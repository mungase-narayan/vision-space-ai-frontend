import { siteConfigs } from "@/configs";
import { Anchor } from "lucide-react";

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
          rounded-md bg-gradient-to-tr from-indigo-500 to-purple-500
          text-white shadow-sm
        "
      >
        <Anchor className="w-5 h-5" />
      </div>
      <p
        className="
          bg-gradient-to-r from-indigo-600 to-purple-600
          dark:from-indigo-400 dark:to-purple-400
          bg-clip-text text-transparent
        "
      >
        {siteConfigs.name}
      </p>
    </div>
  );
};

export default Logo;
