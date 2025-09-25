import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, MapPin, ArrowRight, Compass, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomeV1 = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 min-h-screen">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Badge */}
        <Badge className="inline-flex text-sm items-center gap-2 px-4 py-2 font-medium bg-blue-100/80 text-blue-700 border border-blue-200 rounded-full shadow-sm backdrop-blur-sm">
          <Rocket className="w-4 h-4" />
          AI-Powered Satellite Data Insights
        </Badge>

        {/* Main Heading */}
        <div className="space-y-4">
          {/* <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
              VisionSpaceAI
            </span>
            <br />
            <span className="text-slate-800">Space Intelligence</span>
          </h1> */}
          <h1 className="text-5xl md:text-6xl mb-6 font-bold tracking-tight text-gray-700">
            The fastest and most powerful{" "}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
              multimodal AI
            </span>{" "}
            for Earth Observation
          </h1>

          <p className="text-md sm:text-sm md:text-lg max-w-3xl mx-auto leading-relaxed px-4 text-slate-600">
            Unlock the power of ISRO’s Earth Observation data with multimodal
            AI. Analyze satellite imagery and text queries together to detect
            land use changes, monitor natural resources, and generate actionable
            insights for space applications.
          </p>
        </div>

        {/* Statistics Grid */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 py-8 px-4 sm:px-6">
          <div className="space-y-2 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm transition-transform hover:scale-105">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-600">
              95%+
            </div>
            <div className="text-sm sm:text-base text-slate-600">
              Accuracy on VQA Benchmark
            </div>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm transition-transform hover:scale-105">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-cyan-600">
              100+
            </div>
            <div className="text-sm sm:text-base text-slate-600">
              EO Datasets Used
            </div>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm transition-transform hover:scale-105">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-teal-600">
              20B/120B
            </div>
            <div className="text-sm sm:text-base text-slate-600">
              Model Sizes Available
            </div>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm transition-transform hover:scale-105">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-700">
              Real-time
            </div>
            <div className="text-sm sm:text-base text-slate-600">Analysis</div>
          </div>
        </div> */}

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-6 py-6">
          <div className="p-6 rounded-xl bg-white/70 backdrop-blur-sm border border-white/30 shadow-sm">
            <Database className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 mb-2">
              Multimodal Data
            </h3>
            <p className="text-sm text-slate-600">
              Combine satellite imagery and text queries for enhanced space data
              understanding.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white/70 backdrop-blur-sm border border-white/30 shadow-sm">
            <MapPin className="w-8 h-8 text-cyan-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 mb-2">
              Geospatial Insights
            </h3>
            <p className="text-sm text-slate-600">
              Click any region on the map to get instant EO analysis, history,
              and trends.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white/70 backdrop-blur-sm border border-white/30 shadow-sm">
            <Compass className="w-8 h-8 text-teal-600 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 mb-2">AI Reasoning</h3>
            <p className="text-sm text-slate-600">
              Leverage GPT-OSS with vision to generate natural language
              explanations and reports.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button
            size="lg"
            onClick={() => navigate("/chats")}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Rocket className="w-4 h-4" />
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomeV1;