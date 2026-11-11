import {Component, ErrorInfo, ReactNode} from 'react';
import {useLocation} from 'react-router-dom';

interface Props {
    children: ReactNode;
    resetKey?: string
}

interface State {
    failed: boolean
}

class Boundary extends Component<Props, State> {
    state: State = {failed: false};

    static getDerivedStateFromError(): State {
        return {failed: true};
    }

    componentDidCatch(err: Error, info: ErrorInfo) {
        console.error('Page crashed:', err, info.componentStack);
    }

    componentDidUpdate(prev: Props) {
        if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({failed: false});
    }

    render() {
        if (!this.state.failed) return this.props.children;
        return (
            <div className="grid min-h-screen place-items-center px-6 text-center">
                <div className="max-w-md">
                    <p className="text-5xl">:(</p>
                    <h1 className="mt-3 text-xl font-extrabold text-navy-900">Something went wrong on this page</h1>
                    <p className="mt-2 text-sm text-slate-600">Your account and ads are safe. Try again, or go back to
                        the home page.</p>
                    <div className="mt-5 flex justify-center gap-3">
                        <button className="btn-primary" onClick={() => window.location.reload()}>Reload page</button>
                        <a className="btn-ghost" href="/">Home</a>
                    </div>
                </div>
            </div>
        );
    }
}

export default function ErrorBoundary({children}: { children: ReactNode }) {
    const {pathname} = useLocation();
    return <Boundary resetKey={pathname}>{children}</Boundary>;
}
