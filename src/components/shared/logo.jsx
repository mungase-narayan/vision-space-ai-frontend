import { URLS } from "@/constants";
import { cn } from "@/lib/utils";

const Logo = ({ className }) => {
  return (
    <div
      className={cn("font-bold flex items-center justify-center", className)}
    >
      <img className="dark:hidden h-[45px]" src={URLS.LOGO_URL} alt="logo" />
      <img
        className="hidden dark:block  h-[45px]"
        src={URLS.DARK_LOGO_URL}
        alt="logo"
      />
    </div>
  );
};

export default Logo;
