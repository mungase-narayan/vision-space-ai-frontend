import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { URLS } from "@/constants";
import { Sparkles, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomeV1 = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <Badge className="inline-flex text-sm items-center gap-2 px-4 py-2 font-medium bg-white/80 text-gray-700 border border-gray-200 rounded-full shadow-sm">
          <Sparkles className="w-4 h-4" />
          Access to 100+ AI Models
        </Badge>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-gray-500 to-gray-300 bg-clip-text text-transparent">
              {URLS.LOGO_TEXT}
            </span>
            <br />
            <span className="">Personal GPT</span>
          </h1>

          <p className="text-md sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-4">
            Your unified gateway to the world's most powerful AI models. Access
            OpenAI, Anthropic, Meta, Qwen, xAI, and more – all in one place.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 py-8">
          <div className="space-y-2">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold">
              20+
            </div>
            <div className="text-sm sm:text-base ">AI Providers</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold ">
              100+
            </div>
            <div className="text-sm sm:text-base">AI Models</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold">
              50+
            </div>
            <div className="text-sm sm:text-base ">Open Source</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold">
              20+
            </div>
            <div className="text-sm sm:text-base">Proprietary</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button size="lg" onClick={() => navigate("/auth/sign-in")}>
            <Zap className="w-4 h-4" />
            Start Chatting
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomeV1;
