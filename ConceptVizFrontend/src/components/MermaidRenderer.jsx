import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis',
  },
});

export default function MermaidRenderer({ code, className = '', onError }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (code && containerRef.current) {
      const renderDiagram = async () => {
        try {
          containerRef.current.innerHTML = '';
          setError(null);
          
          // Validate code before rendering
          if (!code.trim()) {
            throw new Error('Empty diagram code');
          }
          
          const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(uniqueId, code);
          containerRef.current.innerHTML = svg;
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          const errorMessage = error.message || 'Unknown error occurred';
          setError(errorMessage);
          
          if (onError) {
            onError(error);
          }
          
          containerRef.current.innerHTML = `
            <div class="text-red-500 p-6 bg-red-50 rounded-lg border-2 border-red-200">
              <div class="flex items-start gap-3">
                <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <div class="flex-1">
                  <p class="font-semibold text-lg mb-2">Failed to Render Diagram</p>
                  <p class="text-sm text-red-600 mb-3">
                    The AI generated invalid Mermaid syntax. This can happen sometimes with complex topics.
                  </p>
                  <details class="text-xs text-red-700">
                    <summary class="cursor-pointer font-medium hover:text-red-800">View Error Details</summary>
                    <pre class="mt-2 p-2 bg-red-100 rounded overflow-x-auto">${errorMessage}</pre>
                  </details>
                  <div class="mt-4 text-sm text-slate-600">
                    <p class="font-medium mb-1">💡 Try:</p>
                    <ul class="list-disc list-inside space-y-1 ml-2">
                      <li>Click "Visualize" again to regenerate</li>
                      <li>Simplify your topic (e.g., "Git Workflow" → "Git Basics")</li>
                      <li>Be more specific about what you want to see</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          `;
        }
      };

      renderDiagram();
    }
  }, [code, onError]);

  return (
    <div className={`mermaid-container ${className}`}>
      <div ref={containerRef} className="flex items-center justify-center min-h-[200px]" />
    </div>
  );
}