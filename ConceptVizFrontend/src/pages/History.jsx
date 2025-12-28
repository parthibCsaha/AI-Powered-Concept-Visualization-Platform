import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagramService } from '../services/diagramService';
import { useStore } from '../store/useStore';
import MermaidRenderer from '../components/MermaidRenderer';

export default function History() {
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiagram, setSelectedDiagram] = useState(null);
  const { user } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchHistory = async () => {
      try {
        const data = await diagramService.getHistory();
        setDiagrams(data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-primary-600 mx-auto"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-4 text-slate-600">Loading your diagrams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold font-display gradient-text mb-2">My Diagrams</h1>
          <p className="text-slate-600">
            {diagrams.length} diagram{diagrams.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {diagrams.length === 0 ? (
          <div className="card-modern text-center py-12 animate-slide-up">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold font-display mb-2">No Diagrams Yet</h2>
            <p className="text-slate-600 mb-6">
              Start creating and saving diagrams to see them here
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Create Your First Diagram
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diagrams.map((diagram, index) => (
              <div
                key={diagram.id}
                className="card-modern cursor-pointer hover:scale-105 transition-transform duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setSelectedDiagram(diagram)}
              >
                <div className="aspect-video bg-slate-50 rounded-lg mb-4 overflow-hidden">
                  <MermaidRenderer
                    code={diagram.mermaidCode}
                    className="scale-75 origin-top-left w-[133%] h-[133%]"
                  />
                </div>
                <h3 className="font-bold font-display text-lg mb-2 truncate">
                  {diagram.topic}
                </h3>
                <p className="text-sm text-slate-500">
                  {new Date(diagram.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedDiagram && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={() => setSelectedDiagram(null)}
          >
            <div
              className="card-modern max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold font-display">{selectedDiagram.topic}</h2>
                <button
                  onClick={() => setSelectedDiagram(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="mb-4">
                <MermaidRenderer code={selectedDiagram.mermaidCode} />
              </div>

              <details>
                <summary className="cursor-pointer text-slate-600 hover:text-slate-800 font-medium">
                  View Code
                </summary>
                <pre className="mt-2 p-4 bg-slate-50 rounded-lg overflow-x-auto text-sm">
                  <code>{selectedDiagram.mermaidCode}</code>
                </pre>
              </details>

              <div className="mt-4 text-sm text-slate-500">
                Created on{' '}
                {new Date(selectedDiagram.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}