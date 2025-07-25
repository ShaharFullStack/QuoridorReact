import { useEffect } from "react";
import { Menu } from "../Menu/Menu";
import { UserMenu } from "../UserMenu/UserMenu";
import { createSkipLink } from "../../../Utils/KeyboardNavigation";
import "./Header.css";

export function Header(): JSX.Element {
    // This accessibility feature is great! Keep it as is.
    useEffect(() => {
        if (!document.querySelector('.skip-link')) {
            const skipLink = createSkipLink('main-content', 'Skip to main content');
            document.body.insertBefore(skipLink, document.body.firstChild);
        }
    }, []);

    return (
        <header className="Header" role="banner">
            <Menu />
            
            <h1 className="header-title">
                <span aria-label="Quoridor 3D - Strategic Board Game">
                    Quoridor 3D
                </span>
            </h1>
            
            <UserMenu />
        </header>
    );
}