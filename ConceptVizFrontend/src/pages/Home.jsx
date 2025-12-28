import { useState } from 'react';
import { diagramService } from '../services/diagramService';
import { useStore } from '../store/useStore';
import MermaidRenderer from '../components/MermaidRenderer';
import LoginModal from '../components/LoginModal';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const { user, currentDiagram, setCurrentDiagram } = useStore();

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setSaveSuccess(false);
    setRenderError(false);
    try {
      const diagram = await diagramService.generate(topic);
      setCurrentDiagram(diagram);
    } catch (error) {
      console.error('Failed to generate diagram:', error);
      alert('Failed to generate diagram. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    setRenderError(false);
    handleGenerate({ preventDefault: () => {} });
  };

  const handleRenderError = (error) => {
    console.error('Render error:', error);
    setRenderError(true);
  };

  const handleSave = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!currentDiagram) return;

    try {
      await diagramService.save(currentDiagram.topic, currentDiagram.mermaidCode);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save diagram:', error);
      alert('Failed to save diagram. Please try again.');
    }
  };

  const handleLoginSuccess = async () => {
    if (currentDiagram) {
      await handleSave();
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl sm:text-6xl font-bold font-display mb-4 gradient-text">
            Transform Ideas into Visuals
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Powered by AI, ConceptViz instantly converts your concepts into beautiful flowcharts
            and diagrams
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleGenerate} className="card-modern mb-8 animate-slide-up stagger-1 border-blue-500">
          <div className="flex gap-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Describe your concept (e.g., 'Machine Learning Pipeline' or 'User Authentication Flow')"
              className="input-modern flex-1"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Visualize
                </span>
              )}
            </button>
          </div>

          {/* Quick Examples */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-slate-600">Try:</span>
            {[
              'REST API Architecture',
              'Git Workflow',
              'React Component Lifecycle',
              'Database Schema Design',
            ].map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setTopic(example)}
                className="text-sm px-3 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-full transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </form>

        {/* Result Section */}
        {currentDiagram && (
          <div className="card-modern animate-slide-up stagger-2 border-blue-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold font-display text-slate-800">
                {currentDiagram.topic}
              </h2>
              <div className="flex gap-2">
                {renderError && (
                  <button
                    onClick={handleRegenerate}
                    disabled={loading}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    {loading ? 'Regenerating...' : 'Regenerate'}
                  </button>
                )}
                {saveSuccess && (
                  <span className="text-green-600 font-medium flex items-center gap-2 animate-fade-in">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Saved!
                  </span>
                )}
                {!renderError && (
                  <button
                    onClick={handleSave}
                    className="btn-secondary flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
                    title={user ? 'Save to your profile' : 'Sign in to save'}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    {user ? 'Save' : 'Sign in to Save'}
                  </button>
                )}
              </div>
            </div>

            <MermaidRenderer code={currentDiagram.mermaidCode} onError={handleRenderError} />

            {/* Code View */}
            <details className="mt-4">
              <summary className="cursor-pointer text-slate-600 hover:text-slate-800 font-medium">
                View Mermaid Code
              </summary>
              <pre className="mt-2 p-4 bg-slate-50 rounded-lg overflow-x-auto text-sm">
                <code>{currentDiagram.mermaidCode}</code>
              </pre>
            </details>
          </div>
        )}

        {/* Features */}
        {!currentDiagram && (
          <div className="grid md:grid-cols-3 gap-6 mt-12 animate-slide-up stagger-3">
            {[
              {
                icon: '⚡',
                title: 'Instant Generation',
                description: 'Get your diagrams in seconds with AI-powered generation',
              },
              {
                icon: '🎨',
                title: 'Beautiful Visuals',
                description: 'Clean, professional diagrams ready to share',
              },
              {
                icon: '💾',
                title: 'Save & Organize',
                description: 'Keep all your diagrams in one place with your account',
              },
            ].map((feature, index) => (
              <div key={index} className="card-modern text-center border-blue-500">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-bold font-display mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}