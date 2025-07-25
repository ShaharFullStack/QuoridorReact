import { Header } from "../Header/Header";
import { Routing } from "../Routing/Routing";
import { ErrorBoundary } from "../../Common/ErrorBoundary/ErrorBoundary";
import "./Layout.css";

export function Layout(): JSX.Element {
    return (
        <div className="Layout">
            <Header />

            <main id="main-content" className="main-content" role="main" tabIndex={-1}>
                <ErrorBoundary>
                    <Routing />
                </ErrorBoundary>
            </main>
        </div>
    );
}
