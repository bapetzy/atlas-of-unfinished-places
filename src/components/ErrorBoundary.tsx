import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

/** If the sheet cannot be drawn, say so plainly and offer the two things that usually fix it. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('The sheet could not be drawn.', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="fault" role="alert">
        <h1>This sheet could not be drawn</h1>
        <p>Something failed while plotting the chart. Your findings are safe; they are kept separately.</p>
        <p className="fault-detail">{this.state.error.message}</p>
        <p>
          <button type="button" onClick={() => window.location.reload()}>
            Draw it again
          </button>{' '}
          <a
            href="#/"
            onClick={() => {
              window.location.hash = '#/';
              window.location.reload();
            }}
          >
            Go back to the first edition
          </a>
        </p>
      </div>
    );
  }
}
