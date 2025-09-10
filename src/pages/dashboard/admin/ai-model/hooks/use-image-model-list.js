import { useState, useEffect } from "react";

const useImageModelList = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModels = async () => {
      const openRouterModelListUrl = "https://api.imagerouter.io/v1/models";

      try {
        const response = await fetch(openRouterModelListUrl);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const output = await response.json();

        const modelsData = Object.entries(output)
          .map(([name, model]) => {
            const price =
              model?.providers?.[0]?.pricing?.range?.average ||
              model?.providers?.[0]?.pricing?.value ||
              0;

            return {
              label: name,
              value: name,
              description: "No description",
              inputModalities: model.output || [],
              pricing: {
                prompt: "0",
                completion: "0",
                request: "0",
                web_search: "0",
                internal_reasoning: "0",
                image: `${price}`,
              },
            };
          })
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

export default useImageModelList;
