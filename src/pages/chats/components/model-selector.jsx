import React, { useState } from "react";
import { Check, ChevronDownIcon, ZapIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/providers/app-provider";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const OTHER_COMPANIES = ["Others"];
const CATEGORIES = ["all", "free", "paid"];

export default function ModelSelector({
  selectedModel,
  onSelectModel,
  models,
  task,
}) {
  const { xThreshold } = useApp();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedFilteredModel = models
    ?.find((m) => m.name === task)
    ?.models?.find((m) => m.value === selectedModel) ?? {
    label: selectedModel,
    value: selectedModel,
    pricing: {
      completion: 0,
      prompt: 0,
    },
  };

  const cost =
    task === "Image Generation"
      ? parseFloat(selectedFilteredModel?.pricing?.image || 0)
      : (parseFloat(selectedFilteredModel?.pricing?.completion || 0) +
          parseFloat(selectedFilteredModel?.pricing.prompt || 0)) /
        2.0;

  const filteredModels = (models?.find((m) => m.name === task)?.models ?? [])
    .map((model) => {
      const completion = parseFloat(model.pricing.completion) || 0;
      const prompt = parseFloat(model.pricing.prompt) || 0;
      const image = parseFloat(model.pricing.image) || 0;

      let modelCategory = "free";
      let averagePricing = "$";
      if (task === "Image Generation") {
        modelCategory = image > 0 ? "paid" : "free";
        averagePricing = image;
      } else {
        averagePricing = (completion + prompt) / 2.0;
        modelCategory = averagePricing > 0 ? "paid" : "free";
      }

      const matchesCategory = category === "all" || modelCategory === category;
      const matchesSearch =
        searchQuery === "" ||
        model.label.toLowerCase().includes(searchQuery.toLowerCase());
      if (matchesCategory && matchesSearch) {
        return {
          ...model,
          category: modelCategory,
          cost: averagePricing,
          sign:
            averagePricing === 0
              ? ""
              : averagePricing > (xThreshold ?? 0.000003)
              ? "$$"
              : "$",
        };
      }
      return null;
    })
    .filter(Boolean);

  const priorityCompanies = ((models) => {
    const providers = new Set();

    models.forEach((modelGroup) => {
      modelGroup.models.forEach((item) => {
        if (item.label.includes(":")) {
          const providerName = item.label.split(":")[0].trim();
          providers.add(providerName);
        }
      });
    });

    return [...providers, "Others"];
  })(models);

  const groupedByProvider = priorityCompanies.reduce((acc, provider) => {
    const providerModels = filteredModels.filter(
      (model) => model.label.split(":")[0].trim() === provider
    );
    if (providerModels.length > 0) {
      acc[provider] = providerModels;
    }
    return acc;
  }, {});

  const otherModels = filteredModels.filter(
    (model) => !priorityCompanies.includes(model.label.split(":")[0].trim())
  );

  if (otherModels.length > 0) {
    groupedByProvider[OTHER_COMPANIES] = otherModels;
  }

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 px-3 py-2 h-9 border-border"
          >
            <span className="font-medium w-[120px] sm:w-fit truncate">
              {selectedFilteredModel?.label}
            </span>
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80">
          <DropdownMenuLabel>Select a model</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* <div className="px-2 pb-2">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />

              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <DropdownMenuSeparator /> */}

          <DropdownMenuGroup>
            <div className="flex p-1 bg-muted rounded-md mx-2 mb-2">
              <button
                onClick={() => setCategory(CATEGORIES[0])}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  category === CATEGORIES[0]
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategory(CATEGORIES[1])}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  category === CATEGORIES[1]
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Free
              </button>
              <button
                onClick={() => setCategory(CATEGORIES[2])}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  category === CATEGORIES[2]
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Paid
              </button>
            </div>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <Command>
            <CommandInput placeholder="Search models..." autoFocus />
            <CommandList>
              <CommandEmpty>No models found.</CommandEmpty>
              {(filteredModels || []).map((model) => (
                <CommandItem
                  key={model.value}
                  onSelect={() => onSelectModel(model.value)}
                  className="text-xs sm:text-sm"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{model.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedModel === model.value && (
                        <Check className="h-4 w-4" />
                      )}
                      {model.category === CATEGORIES[1] ? (
                        <div className="flex items-center gap-1">
                          <Badge className="text-xs bg-green-50 text-green-700 border-green-200">
                            Free
                          </Badge>
                          <span className="text-xs w-4">{model?.sign}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                          >
                            Paid
                          </Badge>
                          <span className="text-xs w-4">{model?.sign}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </Command>

          {/* {filteredModels.length === 0 && searchQuery ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No models found matching "{searchQuery}"
            </div>
          ) : (
            Object.entries(groupedByProvider).map(([provider, models]) => {
              if (models.length === 0) return null;

              return (
                <DropdownMenuSub key={provider}>
                  <DropdownMenuSubTrigger className="flex items-center justify-between px-2 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{provider}</span>
                      <Badge
                        variant="outline"
                        className="text-xs bg-muted text-muted-foreground border-border"
                      >
                        {models.length}
                      </Badge>
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="w-80 h-[300px] overflow-y-auto">
                      {models.map((model) => (
                        <DropdownMenuItem
                          key={model.id}
                          className="flex items-center justify-between px-2 py-2"
                          onSelect={() => onSelectModel(model.value)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {model.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {model.category === CATEGORIES[1] ? (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-700 border-green-200"
                                >
                                  Free
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  Paid
                                </Badge>
                              )}
                              {selectedModel === model.value && (
                                <Check className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              );
            })
          )} */}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="hidden sm:flex items-center gap-2 ml-2">
        <Badge
          variant="outline"
          className={`text-xs ${
            cost <= 0
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }`}
        >
          <ZapIcon className="h-3 w-3 mr-1" />

          {cost > 0 ? "Paid" : "Free"}
        </Badge>
        {cost > 0 && (
          <span className="text-xs text-muted-foreground">
            {cost === 0 ? "" : cost > (xThreshold ?? 0.000003) ? "$$" : "$"}
          </span>
        )}
      </div>
    </div>
  );
}
