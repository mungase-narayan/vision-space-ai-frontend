import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { URLS } from "@/constants";
import { Waves, Database, MapPin, ArrowRight, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomeV1 = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 min-h-screen">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Badge */}
        <Badge className="inline-flex text-sm items-center gap-2 px-4 py-2 font-medium bg-blue-100/80 text-blue-700 border border-blue-200 rounded-full shadow-sm backdrop-blur-sm">
          <Waves className="w-4 h-4" />
          Real-time Ocean Data Analysis
        </Badge>

        {/* Main Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
              FloatChat
            </span>
            <br />
            <span className="text-slate-800">Ocean Intelligence</span>
          </h1>

          <p className="text-md sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-4 text-slate-600">
            Unlock the secrets of our oceans with AI-powered analysis of Argo float data.
            Explore temperature, salinity, and current patterns from thousands of autonomous
            ocean sensors worldwide.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 py-8">
          <div className="space-y-2 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-600">
              4000+
            </div>
            <div className="text-sm sm:text-base text-slate-600">Active Floats</div>
          </div>
          <div className="space-y-2 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-600">
              2M+
            </div>
            <div className="text-sm sm:text-base text-slate-600">Data Points</div>
          </div>
          <div className="space-y-2 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-teal-600">
              50+
            </div>
            <div className="text-sm sm:text-base text-slate-600">Countries</div>
          </div>
          <div className="space-y-2 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-700">
              24/7
            </div>
            <div className="text-sm sm:text-base text-slate-600">Monitoring</div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-6 py-6">
          <div className="p-6 rounded-xl bg-white/70 backdrop-blur-sm border border-white/30 shadow-sm">
            <Database className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 mb-2">Real-time Data</h3>
            <p className="text-sm text-slate-600">Access live oceanographic measurements from Argo floats across global waters</p>
          </div>
          <div className="p-6 rounded-xl bg-white/70 backdrop-blur-sm border border-white/30 shadow-sm">
            <MapPin className="w-8 h-8 text-cyan-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 mb-2">Global Coverage</h3>
            <p className="text-sm text-slate-600">Explore ocean data from all major basins and marine ecosystems worldwide</p>
          </div>
          <div className="p-6 rounded-xl bg-white/70 backdrop-blur-sm border border-white/30 shadow-sm">
            <Compass className="w-8 h-8 text-teal-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 mb-2">AI Analysis</h3>
            <p className="text-sm text-slate-600">Chat with AI to discover patterns and insights in ocean temperature and salinity</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button
            size="lg"
            onClick={() => navigate("/chats")}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Waves className="w-4 h-4" />
            Explore Ocean Data
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomeV1;