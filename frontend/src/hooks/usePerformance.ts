import { useEffect, useRef } from "react";

export const usePerformance = (componentName: string) => {
  const startTime = useRef(performance.now());

  useEffect(() => {
    const endTime = performance.now();
    const loadTime = endTime - startTime.current;

    // Log performance metric
    console.log(`${componentName} load time: ${loadTime.toFixed(2)}ms`);

    // Send to analytics if available
    if (window.gtag) {
      window.gtag("event", "component_load_time", {
        component: componentName,
        time: loadTime,
      });
    }
  }, [componentName]);
};
