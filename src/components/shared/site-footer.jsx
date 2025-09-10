import { URLS } from "@/constants";

const SiteFooter = () => {
  return (
    <div className="h-14 px-4 sm:px-8 border-t flex items-center">
      <div className="relative text-sm text-center sm:text-start">
        © {new Date().getFullYear()} {URLS.LOGO_TEXT}. All rights reserved.
      </div>
    </div>
  );
};

export default SiteFooter;
