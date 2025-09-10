import { useState, useEffect } from "react";

const useModelList = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModels = async () => {
      const openRouterModelListUrl = "https://openrouter.ai/api/v1/models";

      try {
        const response = await fetch(openRouterModelListUrl);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const output = await response.json();
        const modelsList = output.data;

        const modelsData = modelsList
          .map((model) => ({
            label: model.name,
            value: model.id,
            description: model.description,
            inputModalities: model.architecture.input_modalities || [],
            pricing: model.pricing,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setModels(modelsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  return { models, loading, error };
};

export default useModelList;
